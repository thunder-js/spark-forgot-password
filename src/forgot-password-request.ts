import { fromEvent, FunctionEvent } from 'graphcool-lib'
import sendRecoverEmail from './send-recover-email'
import { GraphQLClient } from 'graphql-request'
import { updateUserPasswordQuery } from './forgot-password'
const uuidv4 = require('uuid/v4');

export interface IUser {
  id: string
  name: string
}

export interface IGetUserResponse {
  User: IUser
}

export interface IEventData {
  email: string
}

const updateUserForgotPasswordTokenMutation = `
  mutation updateUserForgotPasswordToken($id: ID!, $forgotPasswordToken: String) {
    updateUser(
      id: $id,
      forgotPasswordToken:$forgotPasswordToken
    ){
      id
    }
  }
`
export const updateUserForgotPasswordToken = async (graphQLClient: GraphQLClient, id: string, forgotPasswordToken: string): Promise<IUser> => {
  const response = await graphQLClient.request<{ updateUser: IUser}>(updateUserForgotPasswordTokenMutation, {
    id,
    forgotPasswordToken,
  })
  return response.updateUser
}

async function getUser(graphQLClient: GraphQLClient, email: string): Promise<IUser> {
  const query = `
    query getUser($email: String!) {
      User(email: $email) {
        id
        name
      }
    }
  `
  const response = await graphQLClient.request<IGetUserResponse>(query, {
    email,
  })

  return response.User
}

export interface IAPI {
  updateUserForgotPasswordToken: (id: string, token: string) => Promise<IUser>
  getUser: (email: string) => Promise<IUser>
}

export interface IDependencies {
  api: IAPI;
  sendRecoverEmail: (name: string, to: string, token: string) => Promise<any>;
  generateToken: () => string
}

export const forgotPasswordRequest = async (deps: IDependencies, email: string) => {
  const user = await deps.api.getUser(email)
  const userExists = user !== null
  if (!userExists) {
    return {
      data: {
        email,
        success: false,
      },
    }
  }

  const {
    name,
    id,
  } = user

  const token = deps.generateToken();

  await deps.sendRecoverEmail(name, email, token)
  await deps.api.updateUserForgotPasswordToken(id, token)

  return {
    data: {
      email: 'rafael.correia.poli@gmail.com',
      success: true,
    },
  }
}

const getApi = (graphQLClient: GraphQLClient): IAPI => ({
  updateUserForgotPasswordToken: (id: string, forgotPasswordToken: string) => updateUserForgotPasswordToken(graphQLClient, id, forgotPasswordToken),
  getUser: (email: string) => getUser(graphQLClient, email),
})

export default async (event: FunctionEvent<IEventData>) => {
  const graphcool = fromEvent(event)
  const graphQLClient = graphcool.api('simple/v1')
  const api = getApi(graphQLClient)
  const generateToken = uuidv4

  try {
    return forgotPasswordRequest({ api, sendRecoverEmail, generateToken }, event.data.email)
  } catch (e) {
    console.log(e)
    return {
      error: {
        code: 0,
        message: 'An unexpected error occured during authentication.',
        userFacingMessage: `${e.toString()}`,
      },
    }
  }
}

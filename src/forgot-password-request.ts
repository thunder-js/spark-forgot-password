import { fromEvent, FunctionEvent } from 'graphcool-lib'
import sendRecoverEmail from './send-recover-email'
import { GraphQLClient } from 'graphql-request'
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

async function getUser(api: GraphQLClient, email: string): Promise<IGetUserResponse> {
  const query = `
    query getUser($email: String!) {
      User(email: $email) {
        id
        name
      }
    }
  `

  const variables = {
    email,
  }

  return api.request<IGetUserResponse>(query, variables)
}

export interface IDependencies {
  api: GraphQLClient;
  sendRecoverEmail: (name: string, to: string, token: string) => Promise<any>;
  generateToken: () => string
}
export const forgotPasswordRequest = async (deps: IDependencies, email: string) => {
  const response = await getUser(deps.api, email)
  const userExists = response.User !== null
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
  } = response.User

  const token = deps.generateToken();

  await deps.sendRecoverEmail(name, email, token)

  return {
    data: {
      email: 'rafael.correia.poli@gmail.com',
      success: true,
    },
  }
}

export default async (event: FunctionEvent<IEventData>) => {
  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')
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

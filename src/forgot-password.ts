import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
const bcrypt = require('bcrypt')

const saltRounds = 10

export interface IEventData {
  token: string
  newPassword: string
}

interface IUser {
  id: string
}

export interface IMutationSuccessResponse {
  data: {
    success: boolean
    userId: string,
  }
}
export interface IMutationErrorResponse {
  error: {
    code: number
    message: string,
  }
}

interface IUpdateUserResponse {
  updateUser: IUser
}

export interface IAPI {
  getUserByForgotPasswordToken: (token: string) => Promise<IUser | null>
  updateUserPassword: (userId: string, newPassword: string) => Promise<IUser>
}

type MutationResponse = IMutationSuccessResponse | IMutationErrorResponse

export const updateUserPasswordQuery = `
mutation updateUserPassword($id: ID!, $password: string!) {
  updateUser(
    id: $id,
    password:$password
  ){
    id
  }
}`

export const hashPassword = async (password: string): string => bcrypt.hash(password, saltRounds)

const updateUserPassword = async (graphQLClient: GraphQLClient, userId: string, hashedPassword: string): Promise<IUser> => {
  const response = await graphQLClient.request<IUpdateUserResponse>(updateUserPasswordQuery, {
    id: userId,
    password: hashedPassword,
  })
  return response.updateUser
};

export const getUserByForgotPasswordTokenQuery = `
query getUserByForgotPasswordToken($token: string!){
  User(forgotPasswordToken: $token) {
    id
  }
}`

const getUserByForgotPasswordToken = async (graphQLClient: GraphQLClient, token: string): Promise<IUser | null> => {
  const response = await graphQLClient.request<{User: IUser}>(getUserByForgotPasswordTokenQuery)
  return response.User
}

//  Main function
export const forgotPassword = async (api: IAPI, token: string, newPassword: string): Promise<MutationResponse> => {
  const user = await api.getUserByForgotPasswordToken(token)
  if (!user) {
    return {
      error: {
        code: 0,
        message: `Token ${token} is invalid`,
      },
    }
  }

  const hasedPassword = await hashPassword(newPassword)
  const updateResponse = await api.updateUserPassword(user.id, hasedPassword)
  console.log(updateResponse)
  return {
    data: {
      success: true,
      userId: user.id,
    },
  }
}

const getApi = (graphQLClient: GraphQLClient): IAPI => ({
  getUserByForgotPasswordToken: (token: string) => getUserByForgotPasswordToken(graphQLClient, token),
  updateUserPassword: (userId: string, newPassword: string) => updateUserPassword(graphQLClient, userId, newPassword),
})

//  Event handler
export default async (event: FunctionEvent<IEventData>): Promise<MutationResponse> => {
  const {
    token,
    newPassword,
  } = event.data

  const graphcool = fromEvent(event)
  const graphQLClient = graphcool.api('simple/v1')
  const api = getApi(graphQLClient)

  try {
    return forgotPassword(api, token, newPassword)
  } catch (e) {
    console.log(e)
    return {
      error: {
        code: 0,
        message: 'An unexpected error occured during reset password.',
        userFacingMessage: `${e.toString()}`,
      },
    }
  }
}

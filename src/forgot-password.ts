import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import * as bcrypt from 'bcryptjs'
import { updateUserForgotPasswordToken } from './forgot-password-request'

const SALT_ROUNDS = 10

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
export interface IAPI {
  getUserByForgotPasswordToken: (token: string) => Promise<IUser | null>
  updateUserPassword: (userId: string, newPassword: string) => Promise<IUser>
  updateUserForgotPasswordToken: (id: string, forgotPasswordToken: string) => Promise<IUser>
}

type MutationResponse = IMutationSuccessResponse | IMutationErrorResponse

export const updateUserPasswordQuery = `
mutation updateUserPassword($id: ID!, $password: String!) {
  updateUser(
    id: $id,
    password:$password
  ){
    id
  }
}`

const updateUserPassword = async (graphQLClient: GraphQLClient, userId: string, hashedPassword: string): Promise<IUser> => {
  const response = await graphQLClient.request<{updateUser: IUser}>(updateUserPasswordQuery, {
    id: userId,
    password: hashedPassword,
  })
  return response.updateUser
};

export const getUserByForgotPasswordTokenQuery = `
  query getUserByForgotPasswordToken($token: String!){
    User(forgotPasswordToken: $token) {
      id
    }
  }
`
const getUserByForgotPasswordToken = async (graphQLClient: GraphQLClient, token: string): Promise<IUser | null> => {
  const response = await graphQLClient.request<{User: IUser}>(getUserByForgotPasswordTokenQuery, {
    token
  })
  return response.User
}

// //  Main function
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

  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)

  const updateResponse = await api.updateUserPassword(user.id, hash)
  await api.updateUserForgotPasswordToken(user.id, null)

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
  updateUserForgotPasswordToken: (id: string, forgotPasswordToken: string) => updateUserForgotPasswordToken(graphQLClient, id, forgotPasswordToken)
})

//  Event handler
export default async (event) => {
  const {
    token,
    newPassword,
  } = event.data

  try {
    const graphcool = fromEvent(event)
    const graphQLClient = graphcool.api('simple/v1')
    const api = getApi(graphQLClient)
    return forgotPassword(api, token, newPassword)
  } catch (e) {
    console.log(e)
    return {
      error: {
        code: 10,
        message: 'An unexpected error occured during reset password.',
        userFacingMessage: `${e.toString()}`,
      },
    }
  }
}

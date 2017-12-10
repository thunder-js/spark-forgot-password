import { fromEvent, FunctionEvent } from 'graphcool-lib'
import { GraphQLClient } from 'graphql-request'
import bcrypt from 'bcrypt'

const saltRounds = 10

export interface IEventData {
  token: string
  newPassword: string
}

interface IUser {
  id: string
}

interface IUpdateUserResponse {
  updateUser: IUser
}

const updateUserPassword = async (api: GraphQLClient, userId: string, newPassword: string): Promise<IUser> => {
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)
  const response = await api.request<IUpdateUserResponse>(`
  mutation updateUserPassword($id: ID!, $password: string!) {
    updateUser(
      id: $id,
      password:$password
    ){
      id
    }
  }`, {
    id: userId,
    password: newPasswordHash,
  })

  return response.updateUser
};

const getUserByForgotPasswordToken = async (api: GraphQLClient, token: string): Promise<IUser | null> => {
  const response = await api.request<{User: IUser}>(`
    query getUserByForgotPasswordToken($token: string!){
      User(forgotPasswordToken: $token) {
        id
      }
    }
  `)

  return response.User
}

export default async (event: FunctionEvent<IEventData>) => {
  const {
    token,
    newPassword,
  } = event.data

  const graphcool = fromEvent(event)
  const api = graphcool.api('simple/v1')

  try {
    const user = await getUserByForgotPasswordToken(api, token)

    if (!user) {
        return {
          error: {
            code: 0,
            message: `Token ${token} is invalid`,
          },
        }
      }

    const updateResponse = await updateUserPassword(api, user.id, newPassword)
  } catch (e) {
    return {
      error: {
        code: 0,
        message: 'An unexpected error occured during reset password.',
        userFacingMessage: `${e.toString()}`,
      },
    }
  }
}

import { forgotPassword } from '../src/forgot-password'

describe('forgotPassword', () => {
  it('can update user password and clear forgotPasswordToken, if it is correct', async () => {
    const userId = 'my-user-id'
    const token = 'my-token'
    const newPassword = 'my-new-password'

    const updateUserPassword = jest.fn().mockReturnValue({
      id: userId
    })

    const getUserByForgotPasswordToken = jest.fn().mockReturnValue({
      id: userId
    })

    const updateUserForgotPasswordToken = jest.fn().mockReturnValue({
      id: userId      
    })

    const mockApi = {
      updateUserPassword,
      getUserByForgotPasswordToken,
      updateUserForgotPasswordToken
    }

    const response = await forgotPassword(mockApi, token, newPassword)

    expect(updateUserPassword.mock.calls.length).toBe(1)
    expect(getUserByForgotPasswordToken.mock.calls.length).toBe(1)
    expect(updateUserForgotPasswordToken.mock.calls.length).toBe(1)
    expect(updateUserForgotPasswordToken.mock.calls[0][0]).toBe(userId)
    expect(updateUserForgotPasswordToken.mock.calls[0][1]).toBe(null)
    expect(getUserByForgotPasswordToken.mock.calls[0][0]).toBe(token)
    expect(updateUserPassword.mock.calls[0][0]).toBe(userId)
    expect(response).toEqual({
      data: {
        success: true,
        userId
      }
    })
  })
})
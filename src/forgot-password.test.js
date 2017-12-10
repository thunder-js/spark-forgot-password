import { forgotPassword } from './forgot-password'
// import { updateUserPasswordQuery, getUserByForgotPasswordTokenQuery } from './forgot-password'

describe('forgotPassword', () => {
  it('works', async () => {
    const userId = 'my-user-id'
    const token = 'my-token'
    const newPassword = 'my-new-password'

    const updateUserPassword = jest.fn().mockReturnValue({
      id: userId
    })

    const getUserByForgotPasswordToken = jest.fn().mockReturnValue({
      id: userId
    })

    const mockApi = {
      updateUserPassword,
      getUserByForgotPasswordToken
    }

    const response = await forgotPassword(mockApi, token, newPassword)

    expect(updateUserPassword.mock.calls.length).toBe(1)
    expect(getUserByForgotPasswordToken.mock.calls.length).toBe(1)

    expect(getUserByForgotPasswordToken.mock.calls[0][0]).toBe(token)
    expect(updateUserPassword.mock.calls[0][0]).toBe(userId)
    expect(response).toEqual({
      data: {
        success: true,
        user: {
          id: userId
        }
      }
    })
  })
})
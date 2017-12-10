/*  global describe test */
import {forgotPasswordRequest} from './forgot-password-request'


describe('forgotPasswordRequest', () => {
  test.only('works', async () => {
    const getUser = jest.fn(async () => ({
      id: 'belial-id',
      name: 'Belial lord of Darkness'
    }))
    const updateUserForgotPasswordToken = jest.fn(async () => ({
      
    }))

    const mockApi = {
      getUser,
      updateUserForgotPasswordToken
    }

    const mockSendRecoverEmail = jest.fn()
    const mockGenerateToken = () => 'my-token'
    const deps = {
      api: mockApi,
      sendRecoverEmail: mockSendRecoverEmail,
      generateToken: mockGenerateToken,
    }
    const response = await forgotPasswordRequest(deps, 'rafael.correia.poli@gmail.com')

    expect(getUser.mock.calls.length).toBe(1)
    expect(getUser.mock.calls[0][0]).toBe('rafael.correia.poli@gmail.com')
    expect(updateUserForgotPasswordToken.mock.calls.length).toBe(1)
    expect(updateUserForgotPasswordToken.mock.calls[0][0]).toBe('belial-id')
    expect(updateUserForgotPasswordToken.mock.calls[0][1]).toBe('my-token')
    expect(mockSendRecoverEmail.mock.calls.length).toBe(1)
    expect(mockSendRecoverEmail.mock.calls[0][0]).toBe('Belial lord of Darkness')
    expect(mockSendRecoverEmail.mock.calls[0][1]).toBe('rafael.correia.poli@gmail.com')
    expect(mockSendRecoverEmail.mock.calls[0][2]).toBe('my-token')

    expect(response).toEqual({
      data: {
        email: 'rafael.correia.poli@gmail.com',
        success: true
      }
    })
  })
})

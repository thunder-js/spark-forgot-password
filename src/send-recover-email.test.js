/*  global describe test */
import {getLink, getHtml} from './send-recover-email'


describe('getLink', () => {
  test.only('works', async () => {
    expect(getLink('my-token-1234')).toBe('https://app.savebob.com.br/forgot-password?token=my-token-1234')
  })
})

describe('getHtml', () => {
  test.only('works', async () => {
    expect(getHtml('Belial Lord of Darkness', 'my-token-1234')).toEqual(`
    Olá Belial Lord of Darkness! <br>
    Para recuperar sua senha, acesse este link: <br>
    <a href="https://app.savebob.com.br/forgot-password?token=my-token-1234">https://app.savebob.com.br/forgot-password?token=my-token-1234</a> <br>
    Um grande abraço da equipe <b>SaveBob</b>! <br>
  `)
  })
})
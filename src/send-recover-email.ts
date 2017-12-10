// using SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = 'noreply@savebob.com.br'
const SUBJECT = 'Recuperar senha'

export const getLink = (token: string) => `https://app.savebob.com.br/forgot-password?token=${token}`

export const getHtml = (name: string, token: string) => {
  const link = getLink(token)
  return `
    Olá ${name}! <br>
    Para recuperar sua senha, acesse este link: <br>
    <a href="${link}">${link}</a> <br>
    Um grande abraço da equipe <b>SaveBob</b>! <br>
  `
}


export default (name: string, to: string, token: string): Promise<any> => {
  return sgMail.send({
    to,
    from: FROM_EMAIL,
    subject: SUBJECT,
    html: getHtml(name, token),
  });
}

import sendRecoverEmail from './send-recover-email'

export default async (event) => {
  await sendRecoverEmail('Rafael Ribeiro Correia', 'rafael.correia.poli@gmail.com', 'token1234')

  return {
    data: true
  }
}
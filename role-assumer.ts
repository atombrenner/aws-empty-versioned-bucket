import { STS, AssumeRoleRequest } from '@aws-sdk/client-sts'
import { Credentials } from '@aws-sdk/types'

// TODO: why the heck is this glue code not part of the aws sdk?
export const roleAssumer = async (
  sourceCreds: Credentials,
  assumeRoleParams: AssumeRoleRequest
) => {
  const sts = new STS({ credentials: sourceCreds })
  const { Credentials } = await sts.assumeRole({ ...assumeRoleParams })
  if (!Credentials) throw Error('Could not assume role')
  return {
    accessKeyId: Credentials.AccessKeyId!,
    secretAccessKey: Credentials.SecretAccessKey!,
    sessionToken: Credentials.SessionToken!,
    expiration: Credentials.Expiration!,
  }
}

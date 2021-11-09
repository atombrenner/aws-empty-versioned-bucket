import { S3 } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-provider-ini'
import { roleAssumer } from './role-assumer'
import { range } from 'remeda'

// npx ts-node -T fill-bucket

const Bucket = 'some-atombrenner-bucket'

const s3 = new S3({
  region: 'eu-west-1',
  credentials: fromIni({ profile: 'atombrenner', roleAssumer }), // use profile from ~/.aws/config
})

async function main() {
  const step = 50
  for (let i = 0; i < 1100; i += step) {
    await Promise.all(
      range(i, i + step).map((i) =>
        s3.putObject({ Bucket, Key: `some-folder/${i}`, Body: `${i}`, ContentType: 'text/plain' })
      )
    )
    console.log(`put ${i + step} objects`)
  }
}

main().catch(console.error)

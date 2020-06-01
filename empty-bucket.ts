import { S3, ListObjectVersionsOutput, ObjectIdentifier } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-provider-ini'
import { roleAssumer } from './role-assumer'

const Bucket = 'some-atombrenner-bucket'

const s3 = new S3({
  region: 'eu-west-1',
  credentials: fromIni({ profile: 'atombrenner', roleAssumer }), // use profile from ~/.aws/config
})

async function* listObjectVersions() {
  let KeyMarker: string | undefined = undefined
  let VersionIdMarker: string | undefined = undefined
  let hasMoreData = true
  while (hasMoreData) {
    const response: ListObjectVersionsOutput = await s3.listObjectVersions({
      Bucket,
      KeyMarker,
      VersionIdMarker,
    })
    KeyMarker = response.NextKeyMarker
    VersionIdMarker = response.NextVersionIdMarker
    hasMoreData = !!response.IsTruncated
    yield getObjectsToDelete(response)
  }
}

function getObjectsToDelete(list: ListObjectVersionsOutput): ObjectIdentifier[] {
  const deleteMarkers = list.DeleteMarkers ?? []
  const objectVersions = list.Versions ?? []
  const objects = [...deleteMarkers, ...objectVersions].map((o) => ({
    Key: o.Key,
    VersionId: o.VersionId,
  }))
  return objects
}

let deleteCount = 0
let errorCount = 0

async function deleteObjects(Objects: ObjectIdentifier[]) {
  const response = await s3.deleteObjects({
    Bucket,
    Delete: { Objects },
  })
  if (response.Errors) errorCount += response.Errors.length
  if (response.Deleted) deleteCount += response.Deleted.length

  const fmtNumber = (n: number) => n.toString().padStart(10)
  console.log(`Deleted: ${fmtNumber(deleteCount)} Errors: ${fmtNumber(errorCount)}`)
}

async function main() {
  let pending: Promise<void> = Promise.resolve()
  for await (const objects of listObjectVersions()) {
    await pending
    pending = deleteObjects(objects)
  }
  await pending
}

main().catch(console.error)

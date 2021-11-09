# aws-empty-versioned-bucket

You can't empty a versioned S3 bucket in the AWS console or with the aws-cli.
The easiest and fastest way is to use the `listObjectVersions` API to enumerate
all object versions and delete-markers and delete them.
Note that you should turn off versioning before running this script,
else all deletes will create just more delete markers which may not be
listed so that a second run of the script is necessary.

Use `npm ci` to install prerequisites and `npm start` to execute it.
Change the `Bucket` constant in [empty-bucket.ts](./empty-bucket.ts) to specify
which bucket should be emptied.

This script uses the new [aws-sdk-js-v3](https://github.com/aws/aws-sdk-js-v3)
which was written in typescript.

Also, this is an example of how to use async iterables and async generators.
They are a great way to simplify the usage of paging APIs like list* and describe*,
which are in fact async iterables.

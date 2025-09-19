import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'node:stream'

export async function uploadStreamToS3(opts: { bucket: string; key: string; body: Readable; contentType?: string; concurrency?: number }) {
  const s3 = new S3Client({ region: process.env.AWS_REGION })
  const uploader = new Upload({
    client: s3,
    params: { Bucket: opts.bucket, Key: opts.key, Body: opts.body, ContentType: opts.contentType || 'text/csv; charset=utf-8' },
    queueSize: opts.concurrency ?? 4, // parallel parts
    partSize: 5 * 1024 * 1024,       // 5MB minimum
    leavePartsOnError: false,
  })
  await uploader.done()
}

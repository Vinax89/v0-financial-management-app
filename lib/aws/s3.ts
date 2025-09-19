import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: process.env.AWS_REGION })

export async function putCSVAndSign({ Bucket, Key, Body, ContentType = 'text/csv; charset=utf-8', TTL = 900 }: { Bucket: string; Key: string; Body: string | Uint8Array; ContentType?: string; TTL?: number }) {
  await s3.send(new PutObjectCommand({ Bucket, Key, Body, ContentType }))
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key }), { expiresIn: TTL })
  return `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(Key)}`
}

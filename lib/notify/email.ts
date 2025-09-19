// lib/notify/email.ts
type Job = { id: string; status: string; error?: string | null }

export async function notifyJobEmail(userEmail: string, job: Job) {
  const api = process.env.RESEND_API_KEY
  if (!api) return false
  const from = process.env.RESEND_FROM || 'no-reply@example.com'
  const subject = job.status === 'error' ? 'Export failed' : 'Export ready'
  const body = job.status === 'error'
    ? `Your export job ${job.id} failed. Error: ${job.error || 'Unknown'}\n`
    : `Your export job ${job.id} finished successfully.\n`
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${api}` },
      body: JSON.stringify({ from, to: [userEmail], subject, text: body })
    })
    return res.ok
  } catch {
    return false
  }
}

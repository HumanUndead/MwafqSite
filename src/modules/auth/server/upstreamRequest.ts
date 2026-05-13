import 'server-only'

import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'

interface UpstreamTextRequestOptions {
  method: 'GET' | 'POST'
  url: URL
}

export async function performUpstreamTextRequest(
  { method, url }: UpstreamTextRequestOptions,
): Promise<{ status: number; body: string }> {
  const requestImpl = url.protocol === 'https:' ? httpsRequest : httpRequest

  return new Promise((resolve, reject) => {
    const req = requestImpl(
      url,
      {
        method,
      },
      res => {
        const status = typeof res.statusCode === 'number' ? res.statusCode : 500
        const chunks: Buffer[] = []

        res.on('data', chunk => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })

        res.on('end', () => {
          resolve({
            status,
            body: Buffer.concat(chunks).toString('utf8'),
          })
        })
      },
    )

    req.on('error', reject)
    req.end()
  })
}

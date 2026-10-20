import { clientMetadata } from 'airspace/oauth/metadata'

import { clientMetadataOptions } from '../../shared/atproto/oauth'

const LOOPBACK_HOST_RE = /^(localhost|127\.|\[::1\])/

export default defineEventHandler((event) => {
  const host =
    getRequestHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim() || getRequestHeader(event, 'host') || ''
  const isLoopback = LOOPBACK_HOST_RE.test(host)
  const proto = getRequestHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim() || (isLoopback ? 'http' : 'https')
  const origin = `${proto}://${host}`

  setResponseHeaders(event, {
    'cache-control': 'public, max-age=300',
    'content-type': 'application/json',
  })

  return clientMetadata(clientMetadataOptions(origin))
})

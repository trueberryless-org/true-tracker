import type { ClientMetadataOptions } from 'airspace/oauth/metadata'

import { baseScopes, scopes } from './collections'

const OAUTH_METADATA_PATH = '/oauth-client-metadata.json'
const OAUTH_REDIRECT_PATH = '/'
const OAUTH_CLIENT_NAME = 'Time Tracker'

export function clientMetadataOptions(baseUrl: string): ClientMetadataOptions {
  return {
    baseUrl,
    metadataPath: OAUTH_METADATA_PATH,
    name: OAUTH_CLIENT_NAME,
    redirectPath: OAUTH_REDIRECT_PATH,
    scopes,
  }
}

export const fallbackScopes = baseScopes

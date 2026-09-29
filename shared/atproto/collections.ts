import { defineCollections, defineSpace, scopesFor } from 'airspace'

import { lexicons } from './lexicons'

export const collections = defineCollections(lexicons)

const vault = defineSpace(lexicons.vault, {
  collections: {
    project: collections.project,
    session: collections.session,
    settings: collections.settings,
    task: collections.task,
    visit: collections.visit,
  },
})

export const spaces = { vault }

export const scopes = scopesFor({
  collections,
  spaces,
  manage: ['create', 'update', 'delete'],
})

export const baseScopes = scopesFor({ collections })

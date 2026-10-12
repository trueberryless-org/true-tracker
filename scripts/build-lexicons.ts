import { mkdirSync, writeFileSync } from 'node:fs'

import { toLexiconJson } from 'airspace/lexicon'

import { lexicons } from '../shared/atproto/lexicons.ts'

const docs = toLexiconJson(lexicons as unknown as Record<string, unknown>)
mkdirSync('lexicons', { recursive: true })
for (const doc of docs) {
  writeFileSync(`lexicons/${doc.id}.json`, `${JSON.stringify(doc, null, 2)}\n`)
}
console.log(`Wrote ${docs.length} lexicon document(s) to ./lexicons`)

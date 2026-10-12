import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
const result = spawnSync('pnpm', ['exec', 'supabase', 'status', '-o', 'json'], {
  encoding: 'utf8',
})
if (result.status !== 0) {
  console.error('Start the local backend with pnpm backend:start first.')
  process.exit(1)
}
const start = result.stdout.indexOf('{')
const settings = JSON.parse(result.stdout.slice(start))
writeFileSync(
  '.env.local',
  `VITE_SUPABASE_URL=${settings.API_URL}\nVITE_SUPABASE_PUBLISHABLE_KEY=${settings.PUBLISHABLE_KEY || settings.ANON_KEY}\nVITE_ENABLE_CATALOG_MOCK=true\n`,
  { mode: 0o600 },
)
writeFileSync(
  '.env.test.local',
  `SUPABASE_URL=${settings.API_URL}\nSUPABASE_ANON_KEY=${settings.ANON_KEY}\nSUPABASE_SERVICE_ROLE_KEY=${settings.SERVICE_ROLE_KEY}\n`,
  { mode: 0o600 },
)
console.log('Local environment files written. No cloud account is required.')

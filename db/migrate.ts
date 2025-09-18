import 'dotenv/config'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const runMigrate = async () => {
  if (!process.env.DATABASE_URL_ADMIN && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error('DATABASE_URL_ADMIN or POSTGRES_URL_NON_POOLING is not defined')
  }

  const connectionString = process.env.DATABASE_URL_ADMIN || process.env.POSTGRES_URL_NON_POOLING

  const sql = postgres(connectionString!, { max: 1 })
  const db = drizzle(sql)

  console.log('⏳ Running migrations...')

  const start = Date.now()

  await migrate(db, { migrationsFolder: 'drizzle' })

  const end = Date.now()

  console.log(`✅ Migrations completed in ${end - start}ms`)

  process.exit(0)
}

runMigrate().catch((err) => {
  console.error('❌ Migration failed')
  console.error(err)
  process.exit(1)
})

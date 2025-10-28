# Uptime Hermes - Slack Bot for Uptime Monitoring

## Build/Lint/Test Commands
- **Install deps**: `pnpm install`
- **Run dev**: `pnpm ts-node src/index.ts`
- **Database**: `pnpm prisma generate`, `pnpm prisma db push`
- **Seed**: `pnpm prisma db seed`
- **Single test**: No tests configured yet

## Architecture
- **Framework**: Slack Bolt app (socket mode)
- **Database**: PostgreSQL with Prisma ORM
- **Models**: User, Team, UptimeKumaTracker
- **Structure**: src/modules (event handlers), src/views (Slack UI builders)
- **Entry**: src/index.ts
- **No web UI** - Slack bot only

## Code Style Guidelines
- **Language**: TypeScript (strict mode implied)
- **Imports**: Relative imports (`../views/main`)
- **Environment**: dotenv for config
- **Error handling**: try/catch with app.logger.error()
- **Admins**: Configured in src/admins.ts as Slack user ID array
- **Formatting**: No specific linter/formatter configured yet
- **Naming**: camelCase functions, PascalCase types/classes

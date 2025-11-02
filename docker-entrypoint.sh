#!/bin/sh
set -e

echo "Running database migrations..."
pnpm prisma db push

echo "Seeding database..."
pnpm prisma db seed || echo "No seed script or seed already run"

echo "Starting application..."
exec pnpm start

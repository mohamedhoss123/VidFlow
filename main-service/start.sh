#!/bin/sh
pnpm prisma migrate deploy
pnpm run start:dev

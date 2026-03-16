import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: "standalone",
  // Fix workspace root detection — keeps Next.js scoped to the frontend dir
  // so Tailwind CSS resolves from frontend/node_modules, not the monorepo root.
  outputFileTracingRoot: path.join(__dirname, '../'),
  turbopack: {
    root: __dirname,
  },
}

export default nextConfig

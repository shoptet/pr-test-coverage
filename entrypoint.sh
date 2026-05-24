#!/bin/sh
set -e

# Run the TypeScript action directly with Node.js native TypeScript support
node --experimental-strip-types /action/src/index.ts

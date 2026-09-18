#!/usr/bin/env node
// Prints a bcrypt hash for ADMIN_PASSWORD_HASH. Usage:
//   node scripts/create-admin-hash.mjs "your-password"
import bcrypt from 'bcryptjs';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/create-admin-hash.mjs "your-password"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
console.log('\nFor .env.local, escape "$" as "\\$" (Next\'s dotenv-expand otherwise mangles it):');
console.log(hash.replaceAll('$', '\\$'));

import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

const result = await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.mjs',
  format: 'esm',
  sourcemap: !isProduction,
  minify: isProduction,
  external: [
    'pg-native',
    'sqlite3',
    'mysql2',
    'oracledb',
    'snappy',
    'kerberos',
    '@mongodb-js/zstd',
    'aws4',
    'mongodb-client-encryption',
    '@workspace/db',
    '@workspace/api-zod',
  ],
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  resolveExtensions: ['.ts', '.js', '.json'],
  mainFields: ['module', 'main'],
});

if (result.errors.length > 0) {
  console.error('❌ Build failed:', result.errors);
  process.exit(1);
}

console.log('✅ Build completed successfully');
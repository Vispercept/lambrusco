const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/index.js',
  sourcemap: true,
  tsconfig: 'tsconfig.json',
  define: {
    'process.env.NODE_ENV': 'production',
  },
}).catch(err => process.exit(1))

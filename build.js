require('esbuild').build({
  entryPoints: ['source/index.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/index.js',
  platform: 'node',
  target: 'node12',
  define: {
    'process.env.NODE_ENV': 'production',
  },
}).catch(() => process.exit(1))

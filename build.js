const esbuild = require('esbuild');

esbuild.build({
  platform: 'node',
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/index.js',
  sourcemap: true,
  tsconfig: 'tsconfig.json',
  define: {
    'process.env.NODE_ENV': 'production',
  },
  target: "node12"
}).catch(err => console.log(err) && process.exit(1))

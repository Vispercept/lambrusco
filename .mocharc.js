module.exports = {
  diff: true,
  exit: true,
  extension: ['.spec.js'],
  reporter: 'spec',
  // timeout: 2000,
  'watch-files': ['**/*.js', '**/*.json'],
  'watch-ignore': ['node_modules'],
  spec: './!(node_modules)/**/*.spec.js'
};

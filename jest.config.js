module.exports = {
  verbose: true,
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/?(*.)+(spec).+(ts)"
  ],
  "transform": {
    "^.+\\.(ts)$": "esbuild-jest-transform"
  },
  "collectCoverageFrom": ["src/**/*.ts"]
}

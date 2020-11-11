module.exports = {
  verbose: true,
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    "**/?(*.)+(spec).+(ts)"
  ],
  transform: {
    "^.+\\.(ts)$": "esbuild-jest-transform"
  },
  cacheDirectory: "./.cache",
  collectCoverageFrom: ["src/**/*.ts"]
}

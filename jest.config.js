module.exports = {
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js"
  ],
  "transform": {
    "\\.(ts|tsx)": "<rootDir>/preprocessor.js"
  },
  "testMatch": [
    "<rootDir>/test/*.(ts|tsx|js)"
  ],
  "globals": {
    "document": true
  }
}

# Lambrusco example

See implementation in index.js.

## run the example

1. Make changes in [index.js](./index.js) and the corresponding [test-event.json](./test-event.json) if you wish
2. zip and upload to your lambda-function (adjust names in [package.json](./package.json) scripts before)

- `yarn zip`
- `yarn upload`

3. Test the lambda on aws

- `yarn test:lambda`

4. See response in [response.txt](./response.txt)

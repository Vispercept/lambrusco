/* eslint-disable consistent-return */
const pathToRegexp = require('path-to-regexp');
const Ajv = require('ajv');
const Errors = require('./Errors');

const ajv = new Ajv({ allErrors: true, coerceTypes: true });
require('ajv-keywords')(ajv, 'instanceof');

const match = (pattern, uri) => pathToRegexp.match(pattern, { decode: decodeURIComponent })(uri);
const shapeErrMessage = (validator, dataVar) => `${dataVar}: ${ajv.errorsText(validator.errors, { dataVar: '' }).slice(1)}`;
const doesUriMatchPattern = (uri) => (x) => match(x.pattern, uri);
const doesPatternExist = (options) => (x) => x.pattern === options.pattern;

const ROUTES = [/* { pattern, schema, handler, onError } */];
const routeOptionsValidator = ajv.compile({
  type: 'object',
  title: 'route options schema',
  required: ['pattern', 'handler'],
  properties: {
    pattern: { type: 'string', minLength: 1 },
    schema: { type: 'object' },
    onError: { instanceof: 'Function' },
    handler: { instanceof: 'Function' },
  },
});


function validate({ validator, probe, dataVar = 'path' }) {
  // clone because ajv-validtor is modifying instance because of coerceTypes
  const clone = { ...probe };
  const isValid = validator(clone);

  if (!isValid) {
    throw new Errors.ValidationError(shapeErrMessage(validator, dataVar));
  }

  return clone;
}


function route(_opts) {
  const options = validate({ validator: routeOptionsValidator, probe: _opts, dataVar: 'options' });
  if (ROUTES.find(doesPatternExist(options))) return;
  const validator = options.schema ? ajv.compile(options.schema) : undefined;
  ROUTES.push({ ...options, validator });
}

function handle(uri) {
  if (!uri) return;
  const routeMatch = ROUTES.find(doesUriMatchPattern(uri));
  if (!routeMatch) return;

  const {
    pattern, handler, onError, validator,
  } = routeMatch;

  const parsedPath = match(pattern, uri);
  if (validator) {
    try {
      const cleanParams = validate({ validator, probe: parsedPath.params, dataVar: pattern });
      return handler(cleanParams);
    } catch (error) {
      if (onError) onError(error, uri);
      return error;
    }
  }

  return parsedPath.params;
}

module.exports = {
  route,
  handle,
};

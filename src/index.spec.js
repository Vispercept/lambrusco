const { expect } = require('chai');
const sinon = require('sinon');

const sandbox = sinon.createSandbox();
const lambrusco = require('./index');

describe('lambrusco', () => {
  afterEach(sandbox.restore);

  describe('route', () => {
    it('should validate options object', () => {
      expect(() => lambrusco.route()).to.throw('options: should have required property \'pattern\'');
      expect(() => lambrusco.route({})).to.throw('options: should have required property \'pattern\'');
      expect(() => lambrusco.route({ pattern: '' })).to.throw('options: pattern should NOT be shorter than 1 characters');
      expect(() => lambrusco.route({ pattern: '/adfa/' })).to.throw('options: should have required property \'handler\'');
      expect(() => lambrusco.route({ handler: () => { } })).to.throw('options: should have required property \'pattern\'');
      expect(() => lambrusco.route({ pattern: '/:id', handler: () => { } })).to.not.throw();
    });

    it('should throw errors if invalid schema is passed', () => {
      const options = {
        pattern: '/:id/:1234',
        schema: { type: 'object', title: 11111111 },
        handler: () => { },
      };
      expect(() => lambrusco.route(options)).to.throw('schema is invalid: data.title should be string');
    });
  });

  describe('handle', () => {
    it('should parse valid paths', () => {
      const options = {
        pattern: '/:id/:version',
        schema: {
          type: 'object',
          title: 'path schema',
          required: ['id', 'version'],
          properties: {
            id: { type: 'string' },
            version: { type: 'number' },
          },
        },
        handler: () => { },
      };
      sandbox.stub(options, 'handler');
      lambrusco.route(options);
      lambrusco.handle('/a-1234/20');
      sinon.assert.calledWith(options.handler, { id: 'a-1234', version: 20 });
    });

    it('should parse valid paths with querystrings', () => {
      const options = {
        pattern: '/:id/:version\\?update=:update',
        schema: {
          type: 'object',
          title: 'path schema',
          required: ['id', 'version'],
          properties: {
            id: { type: 'string' },
            version: { type: 'number' },
            update: { type: 'boolean' },
          },
        },
        handler: () => { },
      };
      sandbox.stub(options, 'handler');
      lambrusco.route(options);
      lambrusco.handle('/a-1234/20?update=true');
      sinon.assert.calledWith(options.handler, { id: 'a-1234', version: 20, update: true });
    });

    it('should throw errors if validation failed', () => {
      const options = {
        pattern: '/hello/:id/:version',
        schema: {
          type: 'object',
          title: 'path schema',
          required: ['id', 'version'],
          properties: {
            id: { type: 'string' },
            version: { type: 'number' },
          },
        },
        onError: () => { },
        handler: () => { },
      };
      sandbox.spy(options, 'handler');
      sandbox.stub(options, 'onError');
      lambrusco.route(options);
      lambrusco.handle('/hello/a-1234/aaaaaa');
      sinon.assert.notCalled(options.handler);

      sinon.assert.calledWithMatch(
        options.onError,
        sinon.match(sinon.match({
          name: 'ValidationError',
          message: '/hello/:id/:version: version should be number',
        })),
      );
    });
  });
});

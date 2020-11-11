import Route, { ErrorFn, HandlerFn } from './Route'
import ValidationError from './Errors/ValidationError';

test('handle validation errors', async () => {
  const opts = {
    pattern: '/test/:id/:shouldUpdate',
    schema: {
      type: 'object',
      title: 'path schema',
      required: ['id', 'shouldUpdate'],
      properties: {
        id: { type: 'number' },
        shouldUpdate: { type: 'boolean' },
      },
    },
    errorFn: jest.fn() as ErrorFn,
    handler: jest.fn() as HandlerFn,
  }
  const route = new Route(opts)

  jest.spyOn(route, 'handleError')
  route.handle('/test/abc/xyz')

  expect(route.handleError).toHaveBeenCalledWith(new ValidationError('data/id should be number, data/shouldUpdate should be boolean'))
})

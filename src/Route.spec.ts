import Route, { ErrorFn, HandlerFn } from './Route'

test('handle validation errors', async () => {
  const route = new Route({
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
  })

  expect(() => route.handle('/test/abc/xyz')).toThrow(
    'data/id should be number, data/shouldUpdate should be boolean'
  )
})

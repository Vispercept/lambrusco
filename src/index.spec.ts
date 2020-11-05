import lambrusco, {Response} from './index'

test('handles uris to correct handler', async () => {
  const route1 = {
    pattern: '/anohterhandler/:id',
    handler: async (): Promise<Response> => 'ERROR!',
  }
  const route2 = {
    pattern: '/test/:id',
    handler: async (params: {id: string}): Promise<Response> =>
      params.id,
  }
  const spy1 = jest.spyOn(route1, 'handler')
  const spy2 = jest.spyOn(route2, 'handler')

  const app = await new lambrusco({routes: [route1, route2]})
  const x = await app.handle('/test/1234')
  expect(x).toStrictEqual('1234')
  expect(spy1).not.toHaveBeenCalled
  expect(spy2).toHaveBeenCalled
})

test('validate params against a schema', () => {})

test('parse parameters against a schema', async () => {
  const route = {
    pattern: '/test/:id/:shouldUpdate',
    schema: {
      type: 'object',
      title: 'path schema',
      required: ['id', 'shouldUpdate'],
      properties: {
        id: {type: 'number'},
        shouldUpdate: {type: 'boolean'},
      },
    },
    handler: async (params: {
      id: number
      shouldUpdate: boolean
    }): Promise<Response> => ({
      id: params.id,
      shouldUpdate: params.shouldUpdate,
    }),
  }

  const app = await new lambrusco({routes: [route]})
  const x = await app.handle('/test/123/true')
  expect(x).toStrictEqual({id: 123, shouldUpdate: true})
})

test.skip('throw registration-errors if route is already defined', () => {})
test.skip('handle validation errors', () => {})
test.skip('handle handler errors', () => {})
test.skip('pass errors to default error-handler if route is missing an errorHandler', () => {})
test.skip('call default-handler if no route is matching the uri', () => {})

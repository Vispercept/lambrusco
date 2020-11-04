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
  const spy1 = jest.spyOn(route2, 'handler')
  const spy2 = jest.spyOn(route2, 'handler')

  const app = await new lambrusco({
    routes: [route1, route2],
  })
  const x = await app.handle('/test/1234')
  expect(x).toStrictEqual('1234')
  expect(spy1).not.toHaveBeenCalled
  expect(spy2).toHaveBeenCalled
})

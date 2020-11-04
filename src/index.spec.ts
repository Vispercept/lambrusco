import lambrusco from './index'

type Response = Record<string, unknown> | string

test('handles uris to correct handler', async () => {
  const app = await new lambrusco({
    routes: [
      {
        pattern: '/test/:id',
        handler: async (params: {id: string}): Promise<Response> =>
          params.id,
      },
      {
        pattern: '/test/:id',
        handler: async (params: {id: string}): Promise<Response> =>
          params.id,
      },
    ],
  })
  const x = await app.handle('/test/1234')
  expect(x).toStrictEqual('1234')
})

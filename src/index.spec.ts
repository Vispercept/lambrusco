import lambrusco from './index'

type Response = Record<string, unknown>

test('basic', async () => {
  const lam = await new lambrusco({
    routes: [
    {
      pattern: '/test/:id',
      handler: async (): Promise<Response> => ({x: 'bye bye'}),
      onError: async (): Promise<Response> => ({x: 'bye bye'})
    }
    ]
  });
  const x = await lam.handle('/test/1234');
  expect(x).toStrictEqual({ x: 'bye bye'});
});

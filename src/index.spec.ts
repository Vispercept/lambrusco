import Lambrusco from './index'
import NotFoundError from './Errors/NotFoundError'
import { Res, HandlerFn, ErrorFn } from './Route'

test('handles uris to correct handler', async () => {
  const route1 = {
    pattern: '/anohterhandler/:id',
    handler: jest.fn(),
  }
  const route2 = {
    pattern: '/test/:id',
    handler: (params: { id: string }): Res => params.id,
  }
  const spy1 = jest.spyOn(route1, 'handler')
  const spy2 = jest.spyOn(route2, 'handler')

  const app = new Lambrusco({ routes: [route1, route2] })
  const x = await app.handle('/test/1234')
  expect(x).toStrictEqual('1234')
  expect(spy1).not.toHaveBeenCalled
  expect(spy2).toHaveBeenCalled
})

test('parse parameters against a schema', async () => {
  const route = {
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
    handler: (params: { id: number; shouldUpdate: boolean }): Res => ({
      id: params.id,
      shouldUpdate: params.shouldUpdate,
    }),
  }

  const app = new Lambrusco({ routes: [route] })
  const x = await app.handle('/test/123/true')
  expect(x).toStrictEqual({ id: 123, shouldUpdate: true })
})

test('throw registration-errors if route is already defined', async () => {
  expect(
    () =>
      new Lambrusco({
        routes: [
          {
            pattern: '/abc',
            handler: jest.fn() as HandlerFn,
          },
          {
            pattern: '/abc',
            handler: jest.fn() as HandlerFn,
          },
        ],
      })
  ).toThrow('A route with pattern /abc already exists')
})

test('handle handler errors', async () => {
  const route = {
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
    handler: (() => {
      throw new Error('test')
    }) as HandlerFn,
  }

  const spy = jest.spyOn(route, 'errorFn').mockImplementation()

  const app = new Lambrusco({ routes: [route] })
  await app.handle('/test/123/true')
  expect(spy).toHaveBeenCalledWith(new Error('test'))
})
test('pass errors to default error-handler if route is missing an errorHandler', async () => {
  const route = {
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
    handler: (() => {
      throw new Error('test')
    }) as HandlerFn,
  }

  const opts = {
    onErrors: jest.fn() as ErrorFn,
    routes: [route],
  }

  const spy = jest.spyOn(opts, 'onErrors')

  const app = new Lambrusco(opts)
  await app.handle('/test/123/true')
  expect(spy).toHaveBeenCalledWith(new Error('test'))
})
test('throw an not-found-error if no route is matching the uri', async () => {
  const route = {
    pattern: '/test/:id/:shouldUpdate',
    handler: jest.fn() as HandlerFn,
  }

  const opts = {
    onErrors: jest.fn() as ErrorFn,
    routes: [route],
  }

  const spy = jest.spyOn(opts, 'onErrors')

  const app = new Lambrusco(opts)
  await app.handle('/something-different')
  expect(spy).toHaveBeenCalledWith(
    new NotFoundError('No route matching uri /something-different')
  )
})

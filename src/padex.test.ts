import * as path from 'path';
import serve = require('serve');
import delay = require('delay');
// import padex = require('./padex');
import {Padex} from './padex';

describe('padex', () => {
  let server: serve.Disposable | undefined;

  beforeAll(async () => {
    jest.setTimeout(100000);
    server = serve(path.resolve(__dirname, '../e2e'), {port: 5000});
    await delay(5000);
  });

  afterAll(() => {
    if (server !== undefined) {
      server.stop();
    }
  });

  test('process by deep 1', async () => {
    // tslint:disable-next-line no-http-string
    const padex = new Padex('http://localhost:5000', {sleep: 100, deep: 1});
    const result = await padex.process();

    expect(result).toEqual(
      expect.objectContaining({
        url: expect.any(String),
        options: expect.any(Object),
        root: expect.any(Object),
        documents: expect.any(Array)
      })
    );
    expect(result.documents.length).toBe(12);
  });

  test('called validate', async () => {
    const validate = jest.fn();
    validate
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    // tslint:disable-next-line no-http-string
    const padex = new Padex('http://localhost:5000', {
      sleep: 100,
      deep: 1,
      validate
    });

    await padex.process();

    expect(validate.mock.calls.length).toBe(11);
  });

  test('has https://facebook.github.io/jest/', async () => {
    // tslint:disable-next-line no-http-string
    const padex = new Padex('http://localhost:5000', {sleep: 100, deep: 2});
    const result = await padex.process();

    const found = result.documents.find(
      d => d.normalizedUrl === 'https://facebook.github.io/jest'
    );
    expect(!!found).toBe(true);
  });
});

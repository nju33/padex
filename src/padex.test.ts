import * as path from 'path';
import serve = require('serve');
import delay = require('delay');
import padex = require('./padex');

describe('padex', () => {
  let server: serve.Disposable | undefined;
  let result: any;

  beforeAll(async () => {
    jest.setTimeout(100000);
    // server = serve(path.resolve(__dirname, '../e2e'));
    // await delay(5000)
  });

  beforeEach(async () => {
    // tslint:disable-next-line no-http-string
    result = await padex('http://localhost:5000', {
      deep: 5
    });
  })

  test('urls that is the result keys', async () => {
    if (result === undefined) {
      return;
    }

    const urls = Object.keys(result);

    expect(urls).toEqual(
      expect.arrayContaining([
        // tslint:disable no-http-string
        'http://localhost:5000',
        'http://localhost:5000/1.html',
        'http://localhost:5000/2.html',
        'http://localhost:5000/3.html',
        'http://localhost:5000/4.html',
        'http://localhost:5000/5.html',
        'http://localhost:5000/6.html',
        'http://localhost:5000/7.html',
        'http://localhost:5000/8.html',
        'http://localhost:5000/9.html',
        'http://localhost:5000/10.html',
        // 'http://localhost:5000/11.html',
        // 'http://localhost:5000/12.html',
        // 'http://localhost:5000/13.html',
        'http://localhost:5000/14.html',
        // tslint:enable no-http-string
      ])
    );

    // expect(urls).not.toEqual(
    //   expect.arrayContaining([
    //     // tslint:disable no-http-string
    //     'http://localhost:5000/15.html',
    //     'http://localhost:5000/16.html',
    //     'http://localhost:5000/17.html',
    //     'http://localhost:5000/18.html',
    //     'http://localhost:5000/19.html',
    //     'http://localhost:5000/20.html'
    //     // tslint:enable no-http-string
    //   ])
    // );
  });

  test('urls of the result[url]', async () => {
    if (result === undefined) {
      return;
    }

    // tslint:disable-next-line no-http-string
    expect(result['http://localhost:5000/1.html'].urls).toEqual(
      expect.arrayContaining([
        // tslint:disable no-http-string
        'http://localhost:5000/1.html',
        'http://localhost:5000/1.html#hash',
        // tslint:enable no-http-string
      ])
    );

    // tslint:disable-next-line no-http-string
    expect(result['http://localhost:5000/2.html'].urls).toEqual(
      expect.arrayContaining([
        // tslint:disable no-http-string
        'http://localhost:5000/2.html',
        'http://localhost:5000/2.html?search',
        // tslint:enable no-http-string
      ])
    );
  });

  afterAll(() => {
    if (server !== undefined) {
      server.stop();
    }
  });
});

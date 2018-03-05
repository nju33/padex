import * as path from 'path';
import {Document} from './document';
import serve = require('serve');
import delay = require('delay');

describe('Document', () => {
  // @ts-ignore
  let server: any;
  // @ts-ignore
  let document: Document;
  let errDocument: Document;
  let hashDocument: Document;

  beforeAll(async () => {
    jest.setTimeout(100000);
    server = serve(path.resolve(__dirname, '../e2e'), {
      port: 5001
    });
    await delay(5000)
  });

  afterAll(async () => {
    if (server !== undefined) {
      server.stop();
    }
  });

  beforeEach(() => {
    // tslint:disable no-http-string
    document = new Document('http://localhost:5001', {head: false});
    errDocument = new Document('http://localhost:5001/err', {head: false});
    hashDocument = new Document('http://localhost:5001#test', {head: false});
    // tslint:enable no-http-string
  });

  test('success get', async () => {
    await document.get();
    expect(document.isError()).toBe(false);
  });

  test('failed get', async () => {
    await errDocument.get();
    expect(errDocument.isError()).toBe(true);
  });

  test('add url', () => {
    // tslint:disable-next-line no-http-string
    const URL = 'http://added-url.com';
    document.addUrl(URL);
    expect(document.urls).toEqual(
      expect.arrayContaining([URL])
    );
  });

  test('normalizedUrl', () => {
    // tslint:disable-next-line no-http-string
    expect(hashDocument.normalizedUrl).toBe('http://localhost:5001');
  });

  test('equal', () => {
    expect(document.equal(hashDocument)).toBe(true);
    expect(document.equal(errDocument)).toBe(false);
  });

  test('setChildren', () => {
    document.setChildren([hashDocument]);
    expect(document.children).toEqual(
      expect.arrayContaining([hashDocument])
    );
  });
});

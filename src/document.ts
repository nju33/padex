import {JSDOM} from 'jsdom';
import got = require('got');
import * as dom from './helpers/dom';
import * as ipath from './helpers/ipath';

export type DocumentSuccess = got.Response<string>;
export type DocumentResult = DocumentSuccess | got.GotError | undefined;

export interface DocumentOptions {
  head: boolean;
}

export class Document {
  readonly normalizedUrl: string;
  urls: string[];
  options: DocumentOptions;
  response: DocumentSuccess | undefined;
  error: got.GotError | undefined;
  hrefs: string[] = [];
  children: Document[] = [];

  constructor(url: string, options: DocumentOptions) {
    this.urls = [url];
    this.options = options;

    try {
      this.normalizedUrl = ipath.normalize(url);
    } catch (err) {
      throw err;
    }
  }

  static isSuccess(result: any): result is DocumentSuccess {
    return result.statusCode !== undefined;
  }

  addUrl(url: string) {
    this.urls.push(url);
  }

  getUrls(htmlString: string) {
    const {document} = new JSDOM(htmlString).window;

    let html: string;
    if (this.options.head) {
      html = document.documentElement.innerHTML;
    } else {
      html = document.body.innerHTML;
    }

    return dom.getLinks(this.normalizedUrl, html)
  }

  async get(): Promise<DocumentResult> {
    try {
      const res = await got(this.urls[0]);
      this.response = res;
      this.hrefs = this.getUrls(res.body);

      return res;
    } catch (err) {
      this.error = err;

      return err;
    }
  }

  equal(otherDocument: Document): boolean {
    return this.normalizedUrl === otherDocument.normalizedUrl;
  }

  setChildren(documents: Document[]) {
    this.children = documents;
  }
}

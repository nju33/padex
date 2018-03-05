import * as url from 'url';
import delay = require('delay');
import {Document} from './document';
import {default as chalk} from 'chalk';
import {log} from './logger';

export {Document};

export interface PadexOptions {
  head?: boolean;
  deep?: number;
  sleep?: number;
  validate?(data: {
    location: url.UrlWithStringQuery;
    url: string;
    prevUrl?: string;
  }): boolean;
}

export interface PadexProcessResult {
  url: string;
  options: PadexOptions;
  root: Document;
  documents: Document[];
}

const defaultOptions = {
  head: false,
  deep: 3,
  sleep: 400,
  validate: ({url: currentUrl, location}) => {
    const currentLocation = url.parse(currentUrl);

    return currentLocation.hostname === location.hostname;
  }
};

export class Padex {
  readonly options: PadexOptions = {...defaultOptions};
  rootDocument: Document | undefined;
  documents: Document[] = [];

  // tslint:disable-next-line no-shadowed-variable
  constructor(public readonly url: string, options?: PadexOptions) {
    if (options !== undefined) {
      this.options = {...defaultOptions, ...options};
    }
  }

  isNewDocument(document: Document): boolean {
    return this.documents.every(thisDocument => !thisDocument.equal(document));
  }

  hasDocument(document: Document): boolean {
    return this.documents.some(thisDocument => !thisDocument.equal(document));
  }

  filterInExistedDocuments(documents: Document[]): Document[] {
    return this.documents.filter(thisDocument => {
      return Boolean(
        documents.find(document => {
          return document.equal(thisDocument);
        })
      );
    });
  }

  filterInNewDocuments(documents: Document[]): Document[] {
    return documents.filter(newDocument => this.isNewDocument(newDocument));
  }

  private validate(document: Document, parent: Document | undefined): boolean {
    if (typeof this.options.validate !== 'function') {
      return true;
    }

    const urlWithStringQuery = url.parse(this.url);
    if (parent === undefined) {
      return this.options.validate({
        location: urlWithStringQuery,
        url: document.urls[0]
      });
    }

    return this.options.validate({
      location: urlWithStringQuery,
      url: document.urls[0],
      prevUrl: parent.urls[0]
    });
  }

  async record(
    document: Document,
    parent: Document | undefined,
    deep: number
  ): Promise<Document[]> {
    const result = await document.get();
    if (!Document.isSuccess(result)) {
      log('return', chalk.gray('!Document.isSuccess(result)'));
      this.documents = [...this.documents, document];

      return [document];
    }

    if (!this.validate(document, parent)) {
      log('return', chalk.gray('!this.validate(document, parent)'));
      this.documents = [...this.documents, document];

      return [document];
    }

    const childDocuments = document.hrefs
      .map(href => {
        try {
          return new Document(href, {
            head: this.options.head as boolean
          });
        } catch (err) {
          console.log(err);

          return undefined as any;
        }
      })
      .filter(d => d !== undefined);
    const provisionalNewDocuments = this.filterInNewDocuments(childDocuments);
    this.documents = [...this.documents, ...provisionalNewDocuments];

    /**
     * 新しいドキュメントを登録
     */
    await Promise.all(
      provisionalNewDocuments.map(async (newDocument, idx) => {
        await delay(idx * 400);
        log(
          `${chalk.yellow(document.normalizedUrl)} => ${chalk.blue(
            newDocument.normalizedUrl
          )}`
        );
        log(`${idx * 400}`, chalk.gray('await delay(idx * 400)'));

        if (deep === (this.options.deep as number) + 1) {
          return;
        }

        if (deep < (this.options.deep as number) + 1) {
          // await delay(idx * (this.options.sleep as number));
          const children = await this.record(newDocument, document, deep + 1);
          newDocument.setChildren(children);
        }

        return newDocument;
      })
    );

    /**
     * 既に登録済みのドキュメントに含まれていないurlが合った場合それを追加
     */
    const existedDocuments = this.filterInExistedDocuments(childDocuments);
    existedDocuments.forEach(existedDocument => {
      childDocuments.forEach(childDocument => {
        if (!existedDocument.equal(childDocument)) {
          return;
        }

        const childUrl = childDocument.urls[0];
        if (!existedDocument.urls.includes(childUrl)) {
          existedDocument.addUrl(childUrl);
        }
      });
    });

    return existedDocuments;
  }

  async process(): Promise<PadexProcessResult> {
    log('Run process');
    log(`url: ${this.url}`);
    log(`options: ${JSON.stringify(this.options)}`);

    const rootDocument = new Document(this.url, {
      head: this.options.head as boolean
    });
    this.rootDocument = rootDocument;
    this.documents.push(rootDocument);

    const children = await this.record(rootDocument, undefined, 1);
    rootDocument.setChildren(children);

    return {
      url: this.url,
      options: this.options,
      root: this.rootDocument,
      documents: this.documents
    };
  }
}

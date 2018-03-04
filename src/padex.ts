import delay = require('delay');
import {Document} from './document';

export interface PadexOptions {
  head?: boolean;
  deep?: number;
  sleep?: number;
  validate(data: {
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
  sleep: 100,
  validate: () => true,
};

export class Padex {
  readonly options: PadexOptions = {...defaultOptions};
  rootDocument: Document | undefined;
  documents: Document[] = [];

  constructor(readonly url: string, options?: PadexOptions) {
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
      return Boolean(documents.find(document => {
        return document.equal(thisDocument);
      }))
    });
  }

  filterInNewDocuments(documents: Document[]): Document[] {
    return documents.filter(newDocument => this.isNewDocument(newDocument));
  }

  async record(document: Document, parent: Document | undefined, deep: number): Promise<Document[]> {
    const result = await document.get();
    if (!Document.isSuccess(result)) {
      this.documents = [...this.documents, document];

      return [document];
    }

    const childDocuments = document.hrefs.map(href => {
      try {
        return new Document(href, {
          head: this.options.head as boolean
        })
      } catch (err) {
        console.log(err);

        return undefined as any;
      }
    }).filter(d => d !== undefined)
    const provisionalNewDocuments = this.filterInNewDocuments(childDocuments)
      .filter(newDocument => {
        if (parent === undefined) {
          return this.options.validate({
            url: newDocument.urls[0],
          });
        }

        return this.options.validate({
          url: newDocument.urls[0],
          prevUrl: parent.urls[0],
        });
      });
    this.documents = [...this.documents, ...provisionalNewDocuments];

    /**
     * 新しいドキュメントを登録
     */
    await Promise.all(
      provisionalNewDocuments.map(async (newDocument, idx) => {
        console.log(newDocument.urls[0], deep, (this.options.deep as number));

        if (deep < (this.options.deep as number)) {
          await delay(idx * (this.options.sleep as number));
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
      documents: this.documents,
    };
  }
}

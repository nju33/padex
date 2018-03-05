import  * as nodeUrl from 'url';
import {Padex} from '../src/padex';

(async () => {
  // tslint:disable-next-line no-http-string
  // const padex = new Padex('http://localhost:5000');
  // tslint:disable-next-line no-http-string
  const padex = new Padex('https://www.geek.co.jp/', {
    sleep: 400,
    deep: 2,
  });

  // tslint:disable-next-line
  const result = await padex.process();

  console.log(result)

  const documentsWithError = result.documents.filter(d => d.isError());
  const parentDocumentsHasErrorChild = documentsWithError.map(documentWithError => {
    return result.documents.filter(d => d.hasChild(documentWithError));
  });

  console.log(parentDocumentsHasErrorChild)

  debugger;
  // const result = await padex('http://localhost:5000/');
  //
  // console.log(result)
  //
  // debugger;
})()
  .catch(err => {
    console.error(err);
  })

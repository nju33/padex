import  * as nodeUrl from 'url';
import {Padex} from '../src/padex';

(async () => {
  // tslint:disable-next-line no-http-string
  // const padex = new Padex('http://localhost:5000');
  // tslint:disable-next-line no-http-string
  const padex = new Padex('https://www.geek.co.jp/', {
    sleep: 200,
    deep: 1,
    validate({prevUrl}) {

      if (prevUrl === undefined) {
        return true;
      }

      const hostname = nodeUrl.parse(prevUrl).hostname;
      if (hostname === undefined) {
        return false;
      }

      // console.log('hostname', '===============');
      // console.log(hostname, hostname === 'localhost');

      return hostname === 'www.geek.co.jp';
    }
  });

  // tslint:disable-next-line
  const result = await padex.process();

  console.log(result)
  // const result = await padex('http://localhost:5000/');
  //
  // console.log(result)
  //
  // debugger;
})()
  .catch(err => {
    console.error(err);
  })

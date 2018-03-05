# Padex

Get response of some urls among linked pages

[![npm: padex](https://img.shields.io/npm/v/padex.svg)](https://www.npmjs.com/package/padex)
[![CircleCI](https://circleci.com/gh/nju33/padex.svg?style=svg&circle-token=135d3d7d9ec35d23b0a4810585a83bf8220b8f9f)](https://circleci.com/gh/nju33/padex)
[![Coverage Status](https://coveralls.io/repos/github/nju33/padex/badge.svg?branch=master)](https://coveralls.io/github/nju33/padex?branch=master)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![license: mit](https://img.shields.io/packagist/l/doctrine/orm.svg)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

## Install

```bash
yarn add [-D] padex
```

## Example

```ts
import * as url from 'url';
import {Padex} from 'padex';

const padex = new Padex('https://example.com', {
	//# In the below, Default values.

	//## Whether takes a urls from head tag of a got html
	head: false,
	//## Sleep time between request and next request
	sleep: 400,
	//## How many times to move
	deep: 3,
	//## Whether to allow requests for current url
	//   The following examines whether the URL passed to `Padex`
	//   and the `hostname` of the current URL are together.
	validate: ({url: currentUrl, location}) => {
		const currentLocation = url.parse(currentUrl);

		return currentLocation.hostname === location.hostname;
	}
})

(async () => {
	const result = padex.process();
	// result === {
	//   url: 'https://example.com',
	//   options: {head, sleep, deep, validate},
	//   root: Document,
	//   documents: Document[],
	// }
})();
```

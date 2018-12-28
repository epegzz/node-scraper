<h1 align="center">node-scraper</h1>
<h3 align="center">Scraping websites made easy!</h3>
<p align="center">
  <a target="_blank" href="https://travis-ci.org/epegzz/node-scraper">
    <img alt="Travis" src="https://img.shields.io/travis/epegzz/node-scraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://codeclimate.com/github/epegzz/node-scraper/maintainability">
    <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/epegzz/node-scraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://codecov.io/gh/epegzz/node-scraper">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/epegzz/node-scraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://www.npmjs.com/package/@epegzz/node-scraper">
    <img alt="npm version" src="https://img.shields.io/npm/v/@epegzz/node-scraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://www.npmjs.com/package/@epegzz/node-scraper">
    <img alt="npm installs" src="https://img.shields.io/npm/dm/@epegzz/node-scraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://david-dm.org/epegzz/node-scraper">
    <img alt="dependencies" src="https://img.shields.io/david/epegzz/node-scraper.svg?style=flat-square">
  </a>
</p>

# Install

using npm
```sh
npm install @epegzz/node-scraper --save
```

using yarn
```sh
yarn add @epegzz/node-scraper --save
```


# Usage

```js
const scrape = require('@epegzz/node-scraper')

async function* parseCars({ find, follow, capture }) {
  const car = find('.car')
  for (const car of cars) {
    yield {
      brand: car.find('.brand').text(),
      model: car.find('.model').text(),
      ratings: await capture(car.find('a.ratings').attr('href'), parseCarRatings)
    }
  }
}

function* parseCarRatings({ find }) {
  const ratings = find('.rating')
  for (const rating of ratings) {
    yield {
      value: rating.find('.value'),
      comment: ratins.find('.comment').text(),
    }
  }
}

const scrapeResults = scrape('https://car-list.com', parseCars)
for await (const story of scrapeResults) {
  console.log(JSON.stringify(story))
}
/*
    prints:
    { brand: 'Ford', model: 'Focus', ratings: [{ value: 5, comment: 'Excellent car!'}]}
    { brand: 'Audi', model: 'A8', ratings: [{ value: 4.5, comment: 'I like it'}, {value: 5, comment: 'Best car I ever owned'}]}
    …
*/
```


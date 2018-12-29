<h1 align="center">node-scraper</h1>

<div align="center">
  <strong>Scraping websites made easy!</strong>
</div>
<div align="center">
  A minimalistic yet powerful tool for collecting data from websites.
</div>

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

##### Table of Contents
- [Features](#features)
- [Installing](#installing)
- [Concept](#concept)
- [Example](#example)
- [API](#api)
  - [find(selector, [node])](#findselector-node-query-and-parse-the-dom-of-the-website)
  - [follow(url, [parser])](#followurl-parser-add-another-url-to-parse)
  - [capture(url, parser)](#captureurl-parser)

# Features

- __Generator based:__ It will only scrape as fast as you can consume the results
- __Powerful HTML parsing:__ Uses the popular cheerio library under the hood
- __Easy to test:__ Uses Axios to make network requests, which can be easily mocked

# Installing

using npm
```sh
npm install @epegzz/node-scraper --save
```

using yarn
```sh
yarn add @epegzz/node-scraper --save
```

<a name="concept" />
# Concept

node-scraper is very minimalistic: You provide the URL of the website you want
to scrape and a parser function that converts HTML into a Javascript object.

The parser functions are generators, which means you will `yield` your results
 instead of returning them. That guarantees that we will make requests only
 as fast as we can consume it. And if you have enough results, simply stop consuming
 the results, and `node-scraper` will stop making network requests ✨

# Example

```js
const scrape = require('@epegzz/node-scraper')

// Start scraping our made-up website `https://car-list.com` and console log the results
// This will print:
//   { brand: 'Ford', model: 'Focus', ratings: [{ value: 5, comment: 'Excellent car!'}]}
//   { brand: 'Audi', model: 'A8', ratings: [{ value: 4.5, comment: 'I like it'}, {value: 5, comment: 'Best car I ever owned'}]}
//   ...
(async function() {
  const scrapeResults = scrape('https://car-list.com', parseCars)
  for await (const story of scrapeResults) {
    console.log(JSON.stringify(story))
  }
})();

/**
 * https://car-list.com
 *
 * <body>
 *   <ul>
 *     <li class="car">
 *       <span class="brand">Ford</span>
 *       <span class="model">Focus</span>
 *       <a class="ratings" href="/ratings/ford-focus">show ratings</a>
 *     </li>
 *     ...
 *   </ul>
 * </body>
 */
async function* parseCars({ find, follow, capture }) {
  const cars = find('.car')
  for (const car of cars) {
    yield {
      brand: car.find('.brand').text(),
      model: car.find('.model').text(),
      ratings: await capture(car.find('a.ratings').attr('href'), parseCarRatings)
    }
  }
  follow(find('.next-page'))
}

/**
 * https://car-list.com/ratings/ford-focus
 *
 * <body>
 *   <ul>
 *     <li class="rating">
 *       <span class="value">5</span>
 *       <span class="comment">Excellent car!</span>
 *     </li>
 *     ...
 *   </ul>
 * </body>
 */
function* parseCarRatings({ find }) {
  const ratings = find('.rating')
  for (const rating of ratings) {
    yield {
      value: rating.find('.value').text(),
      comment: ratins.find('.comment').text(),
    }
  }
}

```

# API

## Creating a parser

A parser is a synchronous or asynchronous generator function, that receives
three utility functions as argument: `find`, `capture` and `follow`.

Whatever is `yield`ed by the generator function, can be consumed as scrape result.

```js
async function* parseCars({ find, follow, capture }) {
  const cars = find('.car')
  for (const car of cars) {
    yield {
      brand: car.find('.brand').text(),
      model: car.find('.model').text(),
      ratings: await capture(car.find('a.ratings').attr('href'), parseCarRatings)
    }
  }
  follow(find('.next-page'))
}

(async function() {
  const scrapeResults = scrape('https://car-list.com', parseCars)
  for await (const story of scrapeResults) {
    // whatever is yielded by the parser, ends up here
    console.log(JSON.stringify(story))
  }
})();
```

### `find(selector, [node])` Query and parse the DOM of the website

The `find` function allows you to find and extract the information from the website.
It's compatible to [Cheerio](https://cheerio.js.org), so check out their
[documentation](https://github.com/cheeriojs/cheerio) for details on how to use it.

Think of `find` as the `$` in their documentation, loaded with the content of the
website.

The major difference between cheerio's `$` and `find` is, that the results of `find`
are iterable. So you can do `for (element in find(selector)) { … }` instead of having
to use a `.each` callback, which is important if we want to yield results.

The other difference is, that you can pass an optional `node` argument to `find`. This
will not search the whole document, but instead limits the search to that particular node's
inner HTML.


### `follow(url, [parser])` Add another URL to parse

The main use-case for the `follow` function is probably if you are scraping
a paginated website. You would then `find` the `next` button, and follow
its link:

```js
async function* parser({ find, follow }) {
  ...
  follow(find('.next-page'))
}
```

The `follow` function will by default use the current parser to parse the
results of the new URL. You can, however, provide a different parser if you like.


### `capture(url, parser)` Parse URLs without yielding the results

The `capture` function is somewhat similar to the `follow` function: It takes
a new URL and a parser function to scrape data. But instead of yielding it,
it captures them and returns them as array.
This is useful if you want add more details to a scraped object, which requires
an additional page load:

```js
async function* parseCars({ find, follow, capture }) {
  const cars = find('.car')
  for (const car of cars) {
    yield {
      brand: car.find('.brand').text(),
      model: car.find('.model').text(),
      ratings: await capture(car.find('a.ratings').attr('href'), parseCarRatings)
    }
  }
}
```

In the example above the comments for each car are located on a nested car
details page. We are therefore making a `capture` call. All `yield`s from the
`parseCarRatings` parser will be added to the resulting array that we're
assigning to the `ratings` property.

Note that we have to use `await`, because network requests are always asynchronous.

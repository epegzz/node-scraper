<h1 align="center">SuperScraper</h1>
<h3 align="center">Scraping websites made easy!</h3>
<p align="center">
  <a target="_blank" href="https://travis-ci.org/epegzz/superscraper">
    <img alt="Travis" src="https://img.shields.io/travis/epegzz/superscraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://codeclimate.com/github/epegzz/superscraper/maintainability">
    <img alt="Maintainability" src="https://img.shields.io/codeclimate/maintainability/epegzz/superscraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://codecov.io/gh/epegzz/superscraper">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/epegzz/superscraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://www.npmjs.com/package/@epegzz/superscraper">
    <img alt="npm version" src="https://img.shields.io/npm/v/@epegzz/superscraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://www.npmjs.com/package/@epegzz/superscraper">
    <img alt="npm installs" src="https://img.shields.io/npm/dm/@epegzz/superscraper.svg?style=flat-square">
  </a>
  <a target="_blank" href="https://david-dm.org/epegzz/superscraper">
    <img alt="dependencies" src="https://img.shields.io/david/epegzz/superscraper.svg?style=flat-square">
  </a>
</p>


# Usage

```js
import scrape from 'superscraper'

const carDetailsPageParser = ({ getText }) => ({
  brand: getText('.car-brand'),
  model: getText('.car-model'),
  color: getText('.car-color'),
})

const carIndexPageParser = ({ follow, getLinks }) => {
  // parse all linked car details pages
  const carDetailsPageLinks = getLinks('.car-details > a')
  for (link of carDetailsPageLinks) {
    follow(link, carDetailsPageParser)
  }

  // parse next page
  const nextCarIndexPageLink = getLink('nav a.next-page');
  if (nextCarIndexPageLink) {
    follow(nextCarIndexPageLink, carIndexPageParser)
  }
}


const scrapeResults = scrape('http://example.com', carIndexPageParser)

for await (carInfo of scrapeResults) {
  console.log(carInfo)
}
// logs:
// { brand: 'BMW', model: '3', color: 'black' }
// { brand: 'BMW', model: '3', color: 'black' }
// { brand: 'BMW', model: '3', color: 'black' }
```


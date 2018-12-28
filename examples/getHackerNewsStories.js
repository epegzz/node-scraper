const scrape = require('../src/node-scraper')

// Parse comments page
function* parseCommentsPage({ find }) {
  const comments = find('.athing.comtr')
  for (const comment of comments) {
    yield {
      id: comment.attr('id'),
      text: comment.find('.comment').text(),
    }
  }
}

// Parse index page:
// - get title and link of all entries
// - follow the comments link to capture all comments
// - follow the link of the `more` button to scrape next page
async function* parseIndexPage({ find, follow, capture }) {
  const links = find('.athing .title:last-child > a')
  for (const link of links) {
    const subtext = link
      .parent()
      .parent()
      .next()
    const commentsLink = subtext.find(':nth-child(6)')
    yield {
      title: link.text(),
      link: link.attr('href'),
      comments: await capture(commentsLink.attr('href'), parseCommentsPage),
    }
  }

  // scrape next page
  const moreLink = find('a.morelink')
  if (moreLink) {
    console.log('> scraping next page')
    follow(moreLink.attr('href'))
  }
}

// start scraping the hacker news website
;(async function main() {
  const scrapeResults = scrape('https://news.ycombinator.com', parseIndexPage)
  for await (const story of scrapeResults) {
    console.log(JSON.stringify(story))
  }
})()

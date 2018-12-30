const resolve = require('url').resolve
const request = require('axios')
const cheerio = require('cheerio')

async function* scrape(requestUrl, parserFunction, context) {
  const res = await request.get(requestUrl)

  const $ = cheerio.load(res.data)

  const find = (queryString, node) => {
    const find = node ? node.find.bind(node) : $
    const result = find(queryString)

    // make result iterable using for ... of statement
    result[Symbol.iterator] = function*() {
      const elements = []
      result.each((i, element) => elements.push($(element)))
      for (const element of elements) {
        yield element
      }
    }

    return result
  }

  const followUpRequests = []
  const follow = (url, parser, context) => {
    followUpRequests.push({ url: resolve(requestUrl, url), parser, context })
  }

  // follows a link but collects all results and returns them as an array
  const capture = async function(url, parserFunction, newContext) {
    const iterator = scrape(
      resolve(requestUrl, url),
      parserFunction,
      newContext || context
    )
    const collectResults = []
    for await (const collectResult of iterator) {
      collectResults.push(collectResult)
    }
    return collectResults
  }

  yield* parserFunction({
    request: {
      url: requestUrl,
    },
    response: {
      body: res.body,
      status: res.status,
    },
    find,
    follow,
    capture,
    context,
  })

  if (followUpRequests.length) {
    for (const followUpRequest of followUpRequests) {
      yield* scrape(
        followUpRequest.url,
        followUpRequest.parser || parserFunction,
        followUpRequest.context || context
      )
    }
  }
}

module.exports = scrape

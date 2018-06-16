import url from 'url'
import request from 'superagent'
import cheerio from 'cheerio'

const makeRequest = requestUrl =>
  new Promise((resolve, reject) => {
    request.get(requestUrl).end((err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
    })
  })

async function* scrape(requestUrl, parser) {
  const res = await makeRequest(requestUrl)

  if (res.status === 200) {
    const html = res.body

    const $ = cheerio.load(html)

    const getText = query =>
      $(query)
        .first()
        .text()
        .trim()

    const getLinkUrls = query => {
      const urls = []
      $(query).each((index, link) => {
        urls.push(url.resolve(requestUrl, $(link).attr('href')))
      })
      return urls
    }

    const followUpRequests = []
    const follow = function follow(url, parser) {
      followUpRequests.push({ url, parser })
    }

    const data = parser({
      request: {
        url: requestUrl,
      },
      response: {
        body: res.body,
        status: res.status,
      },
      getText,
      getLinkUrls,
      follow,
    })

    if (followUpRequests.length) {
      for (const followUpRequest of followUpRequests) {
        yield* scrape(followUpRequest.url, followUpRequest.parser)
      }
    }

    if (data) {
      yield {
        url: requestUrl,
        status: res.status,
        data,
      }
    }
  }
}

export default scrape

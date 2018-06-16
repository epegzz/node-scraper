import request from 'superagent'
import cheerio from 'cheerio'

const makeRequest = url =>
  new Promise((resolve, reject) => {
    request.get(url).end((err, res) => {
      if (err) {
        reject(err)
        return
      }
      resolve(res)
    })
  })

async function* scrape(url, parser) {
  const res = await makeRequest(url)

  if (res.status === 200) {
    const html = res.body

    const $ = cheerio.load(html)

    const getText = query =>
      $(query)
        .first()
        .text()
        .trim()

    const followRequests = []
    const follow = function* follow(url, parser) {
      followRequests.push({ url, parser })
    }

    const data = parser({
      url,
      data,
      getText,
      follow,
    })


    if (followRequests.length) {
      for (const followRequest of followRequests) {
        yield* scrape(followRequest.url, followRequest.parser)
      }
    }

    if (data) {
      yield {
        url,
        status: res.status,
        data,
      }
    }
  }
}

export default scrape

import scrape from './superscraper'
import createSuperagentMock from 'superagent-mock'
import request from 'superagent'

let superagentMock

const parseArtistPage = ({ getText }) => ({
  firstName: getText('.first-name'),
  lastName: getText('.last-name'),
})

const parseIndexPage = ({ getLinkUrls, follow }) => {
  getLinkUrls('a').forEach(url => follow(url, parseArtistPage))
}

describe('superscraper', () => {
  beforeAll(() => {
    superagentMock = createSuperagentMock(request, [
      {
        pattern: 'https://www.example.com/index.html',
        fixtures: () => `
          <h1>Pop Legends</h1>   
          <a href="/michael-jackson.html">Michael Jakson</a>
          <a href="/elvis-presley.html">Elvis Presley</a>
        `,
        get: (match, data) => ({
          status: 200,
          body: data,
        }),
      },
      {
        pattern: 'https://www.example.com/elvis-presley.html',
        fixtures: () => `
          <span class="first-name">Elvis</span>
          <span class="last-name">Presley</span>
        `,
        get: (match, data) => ({
          status: 200,
          body: data,
        }),
      },
      {
        pattern: 'https://www.example.com/michael-jackson.html',
        fixtures: () => `
          <span class="first-name">Michael</span>
          <span class="last-name">Jackson</span>
        `,
        get: (match, data) => ({
          status: 200,
          body: data,
        }),
      },
    ])
  })

  afterAll(() => {
    superagentMock.unset()
  })

  it('scrapes a single url', async () => {
    const generator = scrape('https://www.example.com/michael-jackson.html', parseArtistPage)
    expect((await generator.next()).value).toMatchSnapshot()
    expect((await generator.next()).done).toEqual(true)
  })

  it('follows a link', async () => {
    const generator = scrape('https://www.example.com/index.html', parseIndexPage)
    expect((await generator.next()).value).toMatchSnapshot('first result')
    expect((await generator.next()).value).toMatchSnapshot('second result')
    expect((await generator.next()).done).toEqual(true)
  })
})

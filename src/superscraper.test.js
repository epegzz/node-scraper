import scrape from './superscraper'
import createSuperagentMock from 'superagent-mock'
import request from 'superagent'

let superagentMock

describe('superscraper', () => {
  beforeAll(() => {
    superagentMock = createSuperagentMock(request, [
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
    const parseFullName = ({ getText }) => ({
      firstName: getText('.first-name'),
      lastName: getText('.last-name'),
    })
    const generator = scrape('https://www.example.com/michael-jackson.html', parseFullName)
    const next = await generator.next()

    expect(next.value).toEqual({
      data: { firstName: 'Michael', lastName: 'Jackson' },
      status: 200,
      url: 'https://www.example.com/michael-jackson.html',
    })
    expect(next.done).toEqual(false)
    expect((await generator.next()).done).toEqual(true)
  })
})

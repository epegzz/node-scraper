const scrape = require('./node-scraper')
const axios = require('axios')

jest.mock('axios')

const MOCK_URL = 'http://localhost/'
const MOCK_RESULT = `
  <html>
    <ul>
      <li>one</li>
      <li>two</li>
      <li>three</li>
    </ul>
  </html>
`

const SCENARIOS = {
  'with parser which uses the `find` function': {
    html: MOCK_RESULT,
    parser: function*({ find }) {
      for (const li of find('li')) {
        yield li.text()
      }
    },
    expected: ['one', `two`, `three`],
  },

  'with parser which uses the `find` function with node param': {
    html: MOCK_RESULT,
    parser: function*({ find }) {
      const node = find('ul')
      for (const li of find('li', node)) {
        yield li.text()
      }
    },
    expected: ['one', `two`, `three`],
  },

  'with parser which invokes the `follow` function': {
    parser: function* parserWhichInvokesTheFollowFunction({ follow }) {
      follow(MOCK_URL, function* simpleParser() {
        yield 'success'
      })
    },
    expected: ['success'],
  },

  'with parser which invokes the `follow` function without parser param': {
    parser: async function*({ follow }) {
      if (!this.calledSecondTime) {
        yield 'one'
        follow(MOCK_URL)
        this.calledSecondTime = true
      } else {
        yield 'two'
      }
    },
    expected: ['one', 'two'],
  },

  'with parser which invokes the `capture` function': {
    parser: async function*({ capture }) {
      yield* await capture(MOCK_URL, function* simpleParser() {
        yield 'success'
      })
    },
    expected: ['success'],
  },

  'with global context in `capture` function': {
    context: { test: 'works' },
    parser: async function*({ capture, context }) {
      yield* await capture(MOCK_URL, function* simpleParser({ context }) {
        yield context.test
      })
    },
    expected: ['works'],
  },

  'with custom context in `capture` function': {
    context: { test: 'wrong' },
    parser: async function*({ capture, context }) {
      yield* await capture(
        MOCK_URL,
        function* simpleParser({ context }) {
          yield context.test
        },
        { test: 'works' }
      )
    },
    expected: ['works'],
  },

  'with global context in `follow` function': {
    context: { test: 'works' },
    parser: async function*({ follow }) {
      follow(MOCK_URL, function* simpleParser({ context }) {
        yield context.test
      })
    },
    expected: ['works'],
  },

  'with custom context in `follow` function': {
    context: { test: 'wrong' },
    parser: async function*({ follow }) {
      follow(
        MOCK_URL,
        function* simpleParser({ context }) {
          yield context.test
        },
        { test: 'works' }
      )
    },
    expected: ['works'],
  },

  'with custom request args': {
    requestArgs: { url: MOCK_URL, timeout: 10000 },
    parser: async function*() {
      yield 'works'
    },
    expected: ['works'],
    assert: () =>
      expect(axios).toHaveBeenCalledWith({
        method: 'get',
        url: MOCK_URL,
        timeout: 10000,
      }),
  },
}

describe('node-scraper', () => {
  Object.keys(SCENARIOS).forEach(scenarioName => {
    const scenario = SCENARIOS[scenarioName]
    test(scenarioName, async () => {
      axios.mockImplementation(() =>
        Promise.resolve({ data: scenario.html || '' })
      )

      const scrapeResults = scrape(
        scenario.requestArgs || MOCK_URL,
        scenario.parser,
        scenario.context
      )

      const items = []
      for await (const item of scrapeResults) {
        items.push(item)
      }

      expect(items).toEqual(scenario.expected)
      scenario.assert && scenario.assert()
    })
  })
})

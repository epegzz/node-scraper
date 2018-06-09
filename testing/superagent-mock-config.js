import path from 'path'
import { readFileSync, existsSync } from 'fs'

export default [
  {
    pattern: 'https://www.cars.com(.*)',

    fixtures: match => {
      const filename = path.resolve(__dirname, `.${match[1]}`)
      if (existsSync(filename)) {
        return readFileSync(filename, 'utf8')
      }

      throw new Error(404)
    },

    get: function(match, data) {
      return {
        status: 200,
        body: data,
      }
    },
  },
]

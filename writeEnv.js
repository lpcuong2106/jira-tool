import { resolve, dirname } from 'path'
import { readFile, writeFileSync } from 'fs'
import * as envfile from 'envfile'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

export const writeEnvToFile = (
  envVariables
) => {
  // get `.env` from path of current directory
  const path = resolve(__dirname, '.env')
  readFile(path, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }

    const parsedFile = envfile.parse(data)
    envVariables.forEach((envVar) => {
      if (envVar.key && envVar.value) {
        parsedFile[envVar.key] = envVar.value
      }
    })
    writeFileSync(path, envfile.stringify(parsedFile))
  })
}

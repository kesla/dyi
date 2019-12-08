import yargs from 'yargs'
import { execSync } from 'child_process'
import getPkgJson from 'get-pkg-json'
import sortJson from 'sort-json'
import fs from 'fs'

const pkg = require(`${process.cwd()}/package.json`)

const { argv } = yargs.array(['a', 'd', 'r'])

const add = (argv.a ?? []) as string[]
const dev = (argv.d ?? []) as string[]
const remove = (argv.r ?? []) as string[]

const exec = (script: string) => {
  const t = `> ${script}`
  console.time(t)
  execSync(script)
  console.timeEnd(t)
}

const name = `$ ${process.argv.slice(2).join(' ')}`

console.time(name)

const removeDependency = async (pkgName: string) => {
  const metadata = await getPkgJson(pkgName)

  if (pkg.devDependencies) {
    delete pkg.devDependencies[metadata.name]
  }

  if (pkg.dependencies) {
    delete pkg.dependencies[metadata.name]
  }

  return metadata
}

const addDependency = (dependencyKey: string) => async (pkgName: string) => {
  const metadata = await removeDependency(pkgName)

  pkg[dependencyKey] = pkg[dependencyKey] || {}
  pkg[dependencyKey][metadata.name] = `^${metadata.version}`
  pkg[dependencyKey] = sortJson(pkg[dependencyKey])
}
;(async () => {
  await Promise.all([
    ...add.map(addDependency('dependencies')),
    ...dev.map(addDependency('devDependencies')),
    ...remove.map(removeDependency)
  ])

  fs.writeFileSync(
    `${process.cwd()}/package.json`,
    JSON.stringify(pkg, null, 2)
  )

  exec('yarn')
  exec('yarn-dedupe')
  exec('yarn')

  console.timeEnd(name)
})()

#!/usr/bin/env node
// @ts-check

const yargs = require('yargs')
const { execSync } = require('child_process')
const getPkgJson = require('get-pkg-json')
const sortJson = require('sort-json')
const fs = require('fs')

const pkg = require(`${process.cwd()}/package.json`)

const { argv } = yargs.array(['a', 'd', 'r'])

const { a: add = [], d: dev = [], r: remove = [] } = argv

/**
 *
 * @param {string} script
 */
const exec = (script) => {
  const t = `> ${script}`
  console.time(t)
  execSync(script)
  console.timeEnd(t)
}

const name = `$ ${process.argv.slice(2).join(' ')}`

console.time(name)

const removeDependency = async (pkgName) => {
  const metadata = await getPkgJson(pkgName)

  if (pkg.devDependencies) {
    delete pkg.devDependencies[metadata.name]
  }

  if (pkg.dependencies) {
    delete pkg.dependencies[metadata.name]
  }

  return metadata
}

const addDependency = (dependencyKey) => async (pkgName) => {
  const metadata = await removeDependency(pkgName)

  pkg[dependencyKey] = pkg[dependencyKey] || {}
  pkg[dependencyKey][metadata.name] = `^${metadata.version}`
  pkg[dependencyKey] = sortJson(pkg[dependencyKey])
}

;(async () => {
  await Promise.all([
    ...add.map(addDependency('dependencies')),
    ...dev.map(addDependency('devDependencies')),
    ...remove.map(removeDependency),
  ])

  fs.writeFileSync(
    `${process.cwd()}/package.json`,
    JSON.stringify(pkg, null, 2),
  )

  exec('yarn')
  exec('yarn-dedupe')
  exec('yarn')

  console.timeEnd(name)
})()

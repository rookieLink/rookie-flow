const fs = require('fs')
const os = require('os')
const path = require('path')
const fse = require('fs-extra')
const cp = require('child_process')

const cwd = process.cwd()

const paths = [
  {
    src: path.join(cwd, 'packages/graph-lib/style'),
    file: path.join(cwd, 'packages/graph-lib/style/index.less'),
  }
  
]

function compile(source, target) {
  let cmd = 'node_modules/.bin/lessc'
  if (os.type() === 'Windows_NT') {
    cmd = path.join(cwd, `${cmd}.cmd`)
  }
  cp.execFileSync(cmd, [source, target])
}

function makeStyleModule(index) {
  const dir = index.src
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  const source = path.join(dir, 'index.css')
  const target = path.join(dir, 'raw.js')
  const content = fs.readFileSync(source, { encoding: 'utf8' })
  const prev = fs.existsSync(target)
    ? fs.readFileSync(target, { encoding: 'utf8' })
    : null
  const curr = `/* eslint-disable */

/**
 * Auto generated file, do not modify it!
 */

export const content = \`${content}\`
`

  if (prev !== curr) {
    fs.writeFileSync(target, curr)
  }
  fse.unlinkSync(source)
}

paths.forEach((index) => {
  compile(index.file, path.join(index.src, 'index.css'))
  // processLessInDir(index.src)
  makeStyleModule(index)
})
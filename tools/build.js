'use strict'

const del = require('del')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const pkg = require('../package.json')

let promise = Promise.resolve()

let dependencies = Object.assign({}, pkg.dependencies || {}, pkg.peerDependencies || {})

// Clean up the output directory
promise = promise.then(() => del(['dist/*']))

function build (input, outputName) {
  promise = promise.then(() => rollup.rollup({
    input: `src/${input}`,
    external: Object.keys(dependencies),
    plugins: [babel({
      exclude: 'node_modules/**'
    })]
  }).then(bundle => bundle.write({
    file: `dist/${outputName}.js`,
    format: 'es',
    sourcemap: true
  })))
}

build('index.js', 'wc-context')

promise.catch(err => {
  console.error(err.stack) // eslint-disable-line no-console
  process.exit(1)
})

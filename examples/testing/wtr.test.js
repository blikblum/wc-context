import { html, fixture, expect } from '@open-wc/testing'
import { contextProvider } from 'wc-context/lit.js'
import { registerContext } from 'wc-context'

import './test-controller.js'
import './test-property.js'

function createContextNode(contexts) {
  const el = document.createElement('div')
  for (const [context, value] of Object.entries(contexts)) {
    registerContext(el, context, value)
  }
  return el
}

describe('test-property', () => {
  it('set property', async () => {
    const el = await fixture(html`
      <test-property .foo=${'bar'}></test-property>
    `)

    expect(el.foo).to.equal('bar')
  })

  it('parentNode', async () => {
    const el = await fixture(html` <test-property></test-property> `, {
      parentNode: createContextNode({ fooContext: 'bar' }),
    })

    expect(el.foo).to.equal('bar')
  })

  it('directive', async () => {
    const el = await fixture(html`
      <test-property ${contextProvider('fooContext', 'bar')}></test-property>
    `)

    expect(el.foo).to.equal('bar')
  })
})

describe('test-controller', () => {
  it('parentNode', async () => {
    const el = await fixture(html` <test-controller></test-controller> `, {
      parentNode: createContextNode({ fooContext: 'bar' }),
    })

    expect(el).shadowDom.to.equal('<div>fooContext: bar</div>')
  })

  it('directive', async () => {
    const el = await fixture(html`
      <test-controller
        ${contextProvider('fooContext', 'bar')}
      ></test-controller>
    `)

    expect(el).shadowDom.to.equal('<div>fooContext: bar</div>')
  })
})

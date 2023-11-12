# Testing

Components that use contexts can be tested with minimal, if none, adaptations when compared with standard ones.

## TLDR

Check [Vitest](https://vitest.dev/) and [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/) test suites at [testing example folder](../examples/testing/). The library itself is [tested](../test/) with [Jest](https://jestjs.io/).

> The examples use @open-wc/testing that provides time saving utilities

## Context consumed with class mixins

Testing a component with a context consumed using the class mixins (both Lit or generic) is no different of testing a simple property.

Component to be tested definition

```js
import { LitElement } from 'lit'
import { withContext } from 'wc-context/lit.js'

class MyEl extends withContext(LitElement) {
  static properties = {
    foo: { type: String, context: 'fooContext' },
  }
}

customElements.define('my-el', MyEl)
```

Test code

```js
import { html, fixture } from '@open-wc/testing'

it('test foo property that consumes a context', async () => {
  const el = await fixture(html` <my-el .foo=${'bar'}></my-el> `)
  expect(el.foo).to.equal('bar')
})
```

## Context consumed with controller/dedicated elements

Testing a component whose context value is not reflected in a property, e.g., when using `ContextConsumer` controller, requires that the context be provided explicitly.

Component to be tested definition

```js
import { LitElement } from 'lit'
import { ContextConsumer } from 'wc-context/controllers.js'

class MyEl extends LitElement {
  fooContextConsumer = new ContextConsumer(this, 'fooContext')

  render() {
    return html`<div>fooContext: ${this.fooContextConsumer.value}</div>`
  }
}

customElements.define('my-el', MyEl)
```

Provide context with lit provider directive

```js
import { html, fixture } from '@open-wc/testing'
import { contextProvider } from 'wc-context/lit.js'

it('test foo property that consumes a context', async () => {
  const el = await fixture(
    html`<my-el ${contextProvider('fooContext', 'bar')}></my-el> `
  )
  expect(el).shadowDom.to.equal('<div>fooContext: bar</div>')
})
```


Provide context using `registerContext` in a parent node

```js
import { expect, fixture, html } from '@open-wc/testing'
import { registerContext } from 'wc-context'

function createContextNode(contexts) {
  const el = document.createElement('div')
  for (const [context, value] of Object.entries(contexts)) {
    registerContext(el, context, value)
  }
  return el
}

it('test foo property that consumes a context', async () => {
  const el = await fixture(html`<my-el></my-el>`, {
    parentNode: createContextNode({ fooContext: 'bar' }),
  })
  expect(el).shadowDom.to.equal('<div>fooContext: bar</div>')
})
```

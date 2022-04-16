# wc-context

> A context implementation for web components

### Features

&nbsp; &nbsp; ✓ Small and fast. No Internet Explorer support<br>
&nbsp; &nbsp; ✓ Flexible ways to define context providers and consumers<br>
&nbsp; &nbsp; ✓ Ability to provide or consume one or more contexts per element<br>
&nbsp; &nbsp; ✓ Context can be provided or consumed by any HTML element<br>
&nbsp; &nbsp; ✓ Context can be identified by string or unique identifier<br>
&nbsp; &nbsp; ✓ Easy to implement unit tests (same as components without context)<br>
&nbsp; &nbsp; ✓ Builtin integration with LitElement<br>
&nbsp; &nbsp; ✓ Builtin ContextProvider ([Reactive Controller](https://lit.dev/docs/composition/controllers/)) with primitives for lazy loading<br>
&nbsp; &nbsp; ✓ Builtin context-provider and context-consumer elements<br>

### Live examples

- Lit integration: [version 1](https://codesandbox.io/s/8n89qz95q2) /
  [version 2](https://codesandbox.io/s/wq6jyo3jvw)

### Usage

Context can be identified by string or an unique identifier returned by a call to `createContext`

```javascript
import { createContext } from 'wc-context'

const themeContext = createContext('theme') // or just a string like 'theme'
```

To define how a context is provided or consumed, use one of the methods described below. It is possible to mix different methods. For example, a context provided using Lit integration can be consumed by a dedicated custom element and vice versa.

### Lit integration

The easiest way to use `wc-context` is with the Lit integration exported in the lit namespace (`wc-context/lit`). It provides a `withContext` class mixin that hooks into the property reactivity system allowing to define context using the property declaration. The context is automatically propagated when the property is updated.

#### Providing a context

To provide a context add `providedContext` to the property declaration

```javascript
import { withContext } from 'wc-context/lit'
import { LitElement } from 'lit'

class Provider extends withContext(LitElement) {
  static properties = {
    value: { type: String, providedContext: 'theme' },
    activeTitle: { type: String, providedContext: 'title' },
  }

  toggleTheme() {
    this.value = 'newtheme'
  }

  toggleTitle() {
    this.activeTitle = 'New title'
  }
}
```

#### Consuming a context

To consume a context add `context` to the property declaration

```javascript
import { withContext } from 'wc-context/lit'
import { LitElement, html } from 'lit'

class Consumer extends withContext(LitElement) {
  static properties = {
    theme: { type: String, context: 'theme' },
    titleProp: { type: String, context: 'title' },
  }

  render() {
    return html`<div>Theme is ${this.theme}, title is ${this.titleProp}</div>`
  }
}
```

### Custom elements integration

The `withContext` class mixin exported in the root namespace, implements an API similar to DOM `observedAttributes`/`attributeChangedCallback`.

Contexts are defined in an custom element through static `providedContexts` field where the key is the context name and value holds a configuration object. The configuration can have a `value` property defining the default context value or a `property` one defining from what component property the context will retrieve its value.

> This mixin can be used in any web component including the created with Lit or other libraries

#### Providing a context

```javascript
import { withContext } from 'wc-context'

class Provider extends withContext(HTMLElement) {
  static providedContexts = {
    theme: { value: 'blue' },
    title: 'activeTitle', // shorthand for { property: 'activeTitle' }
  }

  get activeTitle() {
    return this._activeTitle
  }

  set activeTitle(value) {
    this._activeTitle = value
    this.updateContext('title')
  }

  toggleTheme() {
    this.updateContext('theme', 'newtheme')
  }

  toggleTitle() {
    this.activeTitle = 'New title'
  }
}
```

#### Consuming a context

```javascript
import { withContext } from 'wc-context'

class Consumer extends withContext(HTMLElement) {
  static observedContexts = ['theme', ['title', 'titleProp']]

  contextChangedCallback(name, oldValue, value) {
    console.log(`theme changed from "${oldValue}" to "${value}"`)
    // updates el accordingly
  }

  connectedCallback() {
    super.connectedCallback()
    this.innerHTML = `<div>Theme is ${this.theme}, title is ${this.titleProp}</div>`
  }
}
```

### Dedicated custom elements

The `context-provider` and `context-consumer` custom elements allows to provide and consume contexts declaratively.

In both elements, the `key` attribute / property defines the context. Setting the `value` property of `context-provider` will change the context value propagating to `context-consumer` `value` property (or any other context consumer)

An `context-update` event is triggered on `context-consumer` when context value changes

```javascript
import 'wc-context/context-provider.js'
import 'wc-context/context-consumer.js'

document.body.innerHTML = `
<context-provider key="theme" value="light">
  <div>
    <context-consumer key="theme"></context-consumer>
  </div>
</context-provider>`

const provider = document.querySelector('context-provider')
const consumer = document.querySelector('context-consumer')

consumer.addEventListener('context-update', ({ context, value }) => {
  console.log(`Context ${context}:${value}`)
})

provider.value = 'dark'
```

### Low level API

The low level functions are exported in `wc-context/core` and can be used to handle specific cases or create a new interface / integration.

For example, is possible to provide a context in body element to be consumed anywhere in the page.

```javascript
import { registerContext, updateContext } from 'wc-context/core'

registerContext(document.body, 'theme', 'light')

document.querySelector('#theme-toggle-button').addEventListener('click', () => {
  updateContext(document.body, 'theme', 'dark')
})
```

### License

MIT
Copyright © 2022 Luiz Américo Pereira Câmara

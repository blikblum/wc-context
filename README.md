# wc-context

> A context implementation for web components

### Features

&nbsp; &nbsp; ✓ Small, fast and flexible<br>
&nbsp; &nbsp; ✓ No need to dedicated "provider" or "consumer" elements<br>
&nbsp; &nbsp; ✓ Ability to provide or consume one or more contexts per element<br>
&nbsp; &nbsp; ✓ Context can be provided or consumed by any HTML element<br>
&nbsp; &nbsp; ✓ Context can be identified by string or unique identifier<br>
&nbsp; &nbsp; ✓ Easy to implement unit tests (same as components without context)<br>
&nbsp; &nbsp; ✓ Builtin integration with LitElement<br>
&nbsp; &nbsp; ✓ Builtin ContextProvider class with primitives for lazy loading<br>
&nbsp; &nbsp; ✓ No Internet Explorer support<br>

### Live examples

- lit: [version 1](https://codesandbox.io/s/8n89qz95q2) /
  [version 2](https://codesandbox.io/s/wq6jyo3jvw)

### Lit integration

The easiest way to use `wc-context` is with the Lit integration exported in the lit namespace (`wc-context/lit`). It provides a `withContext` class mixin that hooks into the property reactivity system allowing to define context using the property declaration. The context is automatically propagated when the property is updated.

See below for the generic implementation that works with any web component, declared with library or not.

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

### Generic implementation

The `withContext` class mixin exported in the root namespace, implements an API similar to DOM `observedAttributes`/`attributeChangedCallback`.

Contexts are defined in an custom element through static `providedContexts` field where the key is the context name and value holds a configuration object. The configuration can have a `value` property defining the default context value or a `property` one defining from what component property the context will retrieve its value.

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

#### Low level API

`wc-context` also exports its low level functions that can be used to handle specific cases or create a new interface as for example generic provider and consumer elements implemented below.

```javascript
import {
  registerContext,
  updateContext,
  observeContext,
  unobserveContext,
} from 'wc-context/core'

// custom element that publishes an arbitrary context name and value

function getFromProperty(provider, prop) {
  return provider[prop]
}

class ContextProvider extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'value']
  }

  get name() {
    return this._name
  }

  set name(value) {
    if (!this._name && value) {
      // register context once
      registerContext(this, this.name, 'value', getFromProperty)
    }
    this._name = value
  }

  attributeChangedCallback(name, oldValue, value) {
    this[name] = value
  }

  set value(val) {
    this._value = val
    if (this.name) {
      updateContext(this, this.name)
    }
  }

  get value() {
    return this._value
  }
}

customElements.define('context-provider', ContextProvider)

class ContextUpdateEvent extends Event {
  constructor(context, value) {
    super('context-update', { bubbles: true })
    this.context = context
    this.value = value
  }
}

function setValueDispatchEvent(consumer, value, context) {
  consumer.value = value
  consumer.dispatchEvent(new ContextUpdateEvent(context, value))
}

class ContextConsumer extends HTMLElement {
  static get observedAttributes() {
    return ['name']
  }

  attributeChangedCallback(name, oldValue, value) {
    this[name] = value
  }

  connectedCallback() {
    this._context = this.name
    if (this._context) {
      observeContext(this, this._context, this._context, setValueDispatchEvent)
    }
  }

  disconnectedCallback() {
    if (this._context) {
      unobserveContext(this, this._context)
    }
  }
}

customElements.define('context-consumer', ContextConsumer)

// later
document.body.innerHTML = `
<context-provider name="theme" value="light">
  <div>
    <context-consumer name="theme"></context-consumer>
  </div>
</context-provider>`

const provider = document.querySelector('context-provider')
const consumer = document.querySelector('context-consumer')

consumer.addEventListener('context-update', ({ context, value }) => {
  console.log(`Context ${context}:${value}`)
})

provider.value = 'dark'
```

### License

MIT
Copyright © 2021 Luiz Américo Pereira Câmara

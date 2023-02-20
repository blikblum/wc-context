# Reactive controllers

wc-context comes with [Reactive controllers](https://lit.dev/docs/composition/controllers/) to provide or consume a context

## ContextProvider

With `ContextProvider` controller is possible to define and update a context

The constructor first parameter is the element where the context will be bound, the second parameter is the context id / name and
the third is the default value

The `context` instance property identifies the context

To update the context value set the `value` property of controller instance

> For basic usage (provide and update context), `ContextProvider` does not require that the component implements [ReactiveControllerHost](https://lit.dev/docs/api/controllers/#ReactiveControllerHost) interface

```js
import { ContextProvider } from 'wc-context/controllers.js'

// ContextProvider can be used with any custom element for basic usage
class RootElement extends HTMLElement {
  themeProvider = new ContextProvider(this, 'theme', 'light')

  setDarkTheme() {
    this.themeProvider.value = 'dark'
  }
}
```

### Subclassing ContextProvider

By subclassing `ContextProvider` is possible detect when context is first requested / not needed anymore with `initialize` and `finalize` methods. It allows, e.g., to load and dispose data on demand or subscribe to a realtime API.

::: code-group

```js [Lazy data]
import { ContextProvider } from 'wc-context/controllers.js'
import { fetchData } from './dataService.js'

export class LazyDataProvider extends ContextProvider {
  async initialize() {
    // the context value will be updated asynchronously
    this.value = await fetchData({ key: this.context })
  }
}
```

```js [Lazy data+]
import { ContextProvider } from 'wc-context/controllers.js'
import { fetchData } from './dataService.js'

export class LazyDataPlusProvider extends ContextProvider {
  async initialize() {
    // initialize with a loading flag
    this.value = { loading: true }
    // the context value will be updated asynchronously
    try {
      const data = await fetchData({ key: this.context })
      this.value = { data, loading: false }
    } catch (error) {
      // set the error
      this.value = { error, loading: false }
    }
  }
}
```

```js [Realtime]
import { ContextProvider } from 'wc-context/controllers.js'
import { observeData } from './dataService.js'

export class RealTimeProvider extends ContextProvider {
  initialize() {
    // observeData is a real time api
    this.unsubscribe = observeData((value) => {
      this.value = value
    })
  }

  finalize() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
  }
}
```

:::

## ContextConsumer

With `ContextConsumer` controller is possible to consume a context

The constructor first parameter is the element, the second parameter is the context id / name.

Optionally is possible to pass a third parameter, an callback called when context value changes

> When the callback parameter is omitted, the controller calls `requestUpdate` method when context changes.
> If a callback is passed, `requestUpdate` method is not called. If necessary to trigger a new render,
> `requestUpdate` should be called manually or a reactive property should be updated

::: code-group

```js [No callback]
import { LitElement } from 'lit'
import { ContextConsumer } from 'wc-context/controllers.js'

class ConsumerElement extends LitElement {
  themeConsumer = new ContextConsumer(this, 'theme')

  render() {
    return html`<div>Theme: ${this.themeConsumer.value}</div>`
  }
}
```

```js [With callback]
import { LitElement } from 'lit'
import { ContextConsumer } from 'wc-context/controllers.js'

class ConsumerElement extends LitElement {
  themeConsumer = new ContextConsumer(this, 'theme', (value) => {
    // if theme was declared as a reactive property, no manual request update would be necessary
    this.theme = value
    this.requestUpdate()
  })

  render() {
    return html`<div>Theme: ${this.theme}</div>`
  }
}
```

:::

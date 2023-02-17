# Generic Custom Element Mixin

The `withContext` class mixin exported in the root namespace, implements an API similar to DOM `observedAttributes`/`attributeChangedCallback`.

> This mixin can be used in any custom element / web component regardless of library / framework.

## Providing a context

Contexts are provided in an custom element through static `providedContexts` field where the key is the context name and value holds a configuration object. The configuration can have a `value` property defining the default context value or a `property` one defining from what component property the context will retrieve its value.

The `updateContext` method updates the context value. It accepts the context name / id as first argument and value as second. If it was configured to read the value from a property the second argument should be omitted.

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

## Consuming a context

To consume a context, is necessary to define a static property `observedContexts` with an array of context names / ids.

When a observed context value changes, the `contextChangedCallback` is called with arguments context (name or id), oldValue, newValue

Optionally is possible to define the observed context with an array where the first item is the context name / id and the second a property name to be updated with the context value each time a context change occurs

> When overriding `connectedCallback` or `disconnectedCallback` is necessary to call the respective super methods.

```javascript
import { withContext } from 'wc-context'

class Consumer extends withContext(HTMLElement) {
  static observedContexts = ['theme', ['title', 'titleProp']]

  contextChangedCallback(name, oldValue, value) {
    console.log(`theme changed from "${oldValue}" to "${value}"`)
    // updates el accordingly
  }

  get titleProp() {
    return this._titleProp
  }

  set titleProp(value) {
    // this setter is called when theme context changes
    this._titleProp = value
  }

  connectedCallback() {
    super.connectedCallback()
    this.innerHTML = `<div>Theme is ${this.theme}, title is ${this.titleProp}</div>`
  }
}
```

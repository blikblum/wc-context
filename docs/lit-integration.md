# Lit Integration

wc-context provides out of box [Lit](https://lit.dev/) integration.

Live example: [version 1](https://codesandbox.io/s/8n89qz95q2) /
[version 2](https://codesandbox.io/s/wq6jyo3jvw)

## Class mixin

The `withContext` class mixin / decorator augments Lit components allowing to connect reactive properties to contexts as a consumer or a provider.

> The Lit class mixin is exported by 'wc-context/lit.js'. Do not confuse with the generic class mixin exported by 'wc-context' root entry point.

### Providing a context

To provide a context add `providedContext` to the property declaration. Changes to the property are reflected in the related context.

```javascript
import { withContext } from 'wc-context/lit.js'
import { LitElement } from 'lit'

class ThemeTitleProvider extends withContext(LitElement) {
  static properties = {
    appTheme: { type: String, providedContext: 'theme' },
    activeTitle: { type: String, providedContext: 'title' },
  }

  toggleTheme() {
    this.appTheme = 'newtheme'
  }

  toggleTitle() {
    this.activeTitle = 'New title'
  }
}
```

#### Consuming a context

To consume a context add `context` to the property declaration. When the related context value changes, the property is updated triggering the component reactivity.

```javascript
import { withContext } from 'wc-context/lit.js'
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

> The property name does not need to match the context name / id

## Directive

The `contextProvider` [directive](https://lit.dev/docs/templates/custom-directives/) defines a context provider linked to the element in which is declared. It accepts as parameters the context name / id and the value.

> This directive, updates the context value when the component render method is called. Since Lit renders asynchronously, is possible to have a delay between setting the context provider value and the consumers being notified.

```javascript
import { contextProvider } from 'wc-context/lit.js'
import { LitElement, html } from 'lit'

class Consumer extends withContext(LitElement) {
  static properties = {
    theme: { type: String },
  }

  render() {
    return html`
      <div ${contextProvider('theme', this.theme)}>
        <theme-consumer></theme-consumer>
      </div>
      <div ${contextProvider('theme', 'yellow')}>
        <theme-consumer></theme-consumer>
      </div>
    `
  }
}
```

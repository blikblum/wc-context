# Lit Integration

wc-context provides out of box [Lit](https://lit.dev/) integration.

## Class mixin

The `withContext` class mixin / decorator augments Lit components allowing to connect reactive properties to contexts which can act as a context consumer or provider.

> The Lit class mixin is exported by 'wc-context/lit.js' unlike the generic class mixin exported by root entry point: 'wc-context'

### Providing a context

To provide a context add `providedContext` to the property declaration

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

To consume a context add `context` to the property declaration

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

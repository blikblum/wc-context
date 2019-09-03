# wc-context

> A context implementation for web components


### Features

&nbsp; &nbsp; ✓ Small, fast and flexible<br>
&nbsp; &nbsp; ✓ No need to dedicated "provider" or "consumer" elements<br>
&nbsp; &nbsp; ✓ Ability to provide one or more contexts per element<br>
&nbsp; &nbsp; ✓ Integrates with lit-element and skatejs<br>
&nbsp; &nbsp; ✓ No Internet Explorer support<br>


### Usage

> Warning: the public interface may change in future

The simplest way to use `wc-context` is through the `withContext` class mixin

Live examples: 
* lit-element: [version 1](https://codesandbox.io/s/8n89qz95q2) /
 [version 2](https://codesandbox.io/s/wq6jyo3jvw)
* skatejs: [version 1](https://codesandbox.io/s/xj1k8x936w) / 
 [version 2](https://codesandbox.io/s/82q46lo3x8)

#### Publishes a context

```javascript
import { withContext } from 'wc-context'

class Provider extends withContext(HTMLElement) {
  static get providedContexts () {
    return {
      theme: { value: 'blue' }
    }
  }  
  
  toggleTheme () {
    this.updateProvidedContext('theme', 'newtheme')    
  }
}
```

#### Consumes a context

```javascript
import { withContext } from 'wc-context'

class Consumer extends withContext(HTMLElement) {
  static get observedContexts () {
    return ['theme']
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      `theme changed from "${oldValue}" to "${value}"`
    );
    // updates el accordingly
  }

  connectedCallback () {
    super.connectedCallback()
    this.innerHTML = `<div>Theme is ${this.context.theme}</div>`
  }  
}
```

#### lit-element and skatejs integration

Along side the generic class mixin, `wc-context` provides specialized mixins that hooks into lit-element / skatejs reactivity system

```javascript
// @polymer/lit-element
import { withContext } from 'wc-context/lit-element'
import { LitElement } from 'lit-element'

const Component = withContext(LitElement)

class Provider extends Component {
  static get properties () {
    return {
      value: {type: String}
    }
  }

  static get providedContexts () {
    return {
      theme: {property: 'value'}
    }
  }
  
  toggleTheme () {
    this.value = 'newtheme'
  }
}
```

```javascript
// skatejs
import Element from '@skatejs/element-lit-html'
import { withContext } from 'wc-context/skatejs'

const Component = withContext(Element)

class Provider extends Component {
  static get props () {
    return {
      altTheme: String,
      theme: String
    }
  }

  static get providedContexts () {
    return {
      theme: {property: 'theme'}
      altTheme: {property: 'altTheme'}
    }
  }  

  constructor () {
    super()    
    this.theme = 'blue'
    this.altTheme = 'yellow'
  }
  
  toggleTheme () {
    this.theme = 'newtheme'
    this.altTheme = 'newalttheme'
  }
}
```

#### Low level API

`wc-context` also exports its low level functions that can be used to handle specific cases or create a new interface

```javascript
import  { registerProvidedContext, notifyContextChange } from 'wc-context/core'

// custom element that publishes an arbitrary context key and value
class ContextProvider extends HTMLElement {
  connnectedCallback () {
    const providedContexts = this.__providedContexts || (this.__providedContexts = {})
    providedContexts[this.key] = this.value    
    registerProvidedContext(this, this.key, providedContexts)
  }
  
  set value (val) {
    const providedContexts = this.__providedContexts || (this.__providedContexts = {})
    providedContexts[this.key] = val
    this.__value = val
    notifyContextChange(this, this.key, val)
  }

  get value () {
    return this.__value
  }
}

customElements.define('context-provider', ContextProvider)

// later
import { html } from 'lit-html'
let theme = 'blue' 
html`<context-provider .key="theme" .value=${theme}>
   <div>
     <my-theme-consumer></my-theme-consumer>
   </div>
</context-provider>`
```


### License

MIT
Copyright © 2018 Luiz Américo

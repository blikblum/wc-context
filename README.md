# wc-context

> A context implementation for web components


### Features

&nbsp; &nbsp; ✓ Small and fast<br>
&nbsp; &nbsp; ✓ Integrates with lit-element or skatejs<br>


### Usage

> Warning: the interface may change in future

The simplest way to use `wc-context` is through the `withContext` class mixin 

#### Publishes a context

```javascript
import { withContext } from 'wc-context'

class Provider extends withContext(HTMLElement) {
  constructor () {
    super()
    this.childContext = {
      theme: 'blue'
    }
  }
  
  toggleTheme () {
    this.childContext = {
      theme: 'newtheme'
    }
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
import { withContext, fromProp } from 'wc-context/lit-element'
import { LitElement } from '@polymer/lit-element'

const Component = withContext(LitElement)

class Provider extends  {
  static get properties () {
    return {
      value: {type: String}
    }
  }
  constructor () {
    super()
    this.childContext = {
      theme: fromProp('value')
    }
  }
  
  toggleTheme () {
    this.value = 'newtheme'
  }
}
```

```javascript
// skatejs
import withLit from '@skatejs/renderer-lit-html/dist/esnext'
import { withUpdate, withRenderer } from 'skatejs/dist/esnext'
import { withContext, fromProp, fromStateProp } from 'wc-context/skatejs'

const Component = withLit(withContext(withUpdate(withRenderer(HTMLElement))))

class Provider extends  {
  static get props () {
    return {
      altTheme: String
    }
  }
  constructor () {
    super()
    this.childContext = {
      theme: fromStateProp('value')
      altTheme: fromProp('altTheme')
    }
    this.state = {value: 'blue'}
    this.altTheme = 'yellow'
  }
  
  toggleTheme () {
    this.state = {value: 'newtheme'}
    this.altTheme = 'newalttheme'
  }
}
```

#### Low level API

`wc-context` also exports its low level functions that can be used to handle specific cases or create a new interface

```javascript
import  { addChildContext, notifyContextChange } from 'wc-context/core'

// custom element that publishes an arbitrary context key and value
class DynamicProvider extends HTMLElement {
  connnectedCallback () {
    this.__wcChildContext[this.key] = this.value    
    addChildContext(this, this.key)
  }
  
  set value (val) {
    this.__value = val
    this.__wcChildContext[this.key] = val
    notifyContextChange(this, this.key, val)
  }

  get value () {
    return this.__value
  }
}

customElements.define('context-provider', DynamicProvider)

// later
import { html } from 'lit-html'
let theme = 'blue' 
html`<context-provider .key="theme" .value=${theme}>
   <div>
     <my-theme-consumer/>
   </div>
</context-provider>`
```


### License

MIT
Copyright © 2018 Luiz Américo

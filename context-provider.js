import { registerContext, updateContext } from './core.js'

// custom element that publishes an arbitrary context key and value

function getFromProperty(provider, prop) {
  return provider[prop]
}

class ContextProvider extends HTMLElement {
  static get observedAttributes() {
    return ['context', 'value']
  }

  get context() {
    return this._context
  }

  set context(context) {
    if (!this._context && context) {
      // register context once
      this._context = context
      registerContext(this, this._context, 'value', getFromProperty)
    }
  }

  attributeChangedCallback(name, oldValue, value) {
    this[name] = value
  }

  set value(value) {
    this._value = value
    if (this._context) {
      updateContext(this, this._context)
    }
  }

  get value() {
    return this._value
  }
}

customElements.define('context-provider', ContextProvider)

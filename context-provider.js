import { registerContext, updateContext } from './core.js'

// custom element that publishes an arbitrary context key and value

function getFromProperty(provider, prop) {
  return provider[prop]
}

class ContextProvider extends HTMLElement {
  static get observedAttributes() {
    return ['key', 'value']
  }

  get key() {
    return this._key
  }

  set key(key) {
    if (!this._key && key) {
      // register context once
      this._key = key
      registerContext(this, this._key, 'value', getFromProperty)
    }
  }

  attributeChangedCallback(name, oldValue, value) {
    this[name] = value
  }

  set value(value) {
    this._value = value
    if (this._key) {
      updateContext(this, this._key)
    }
  }

  get value() {
    return this._value
  }
}

customElements.define('context-provider', ContextProvider)

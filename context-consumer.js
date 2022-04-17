import { observeContext, unobserveContext } from './core.js'

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
    return ['context']
  }

  attributeChangedCallback(name, oldValue, value) {
    this[name] = value
  }

  connectedCallback() {
    this._context = this.context
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

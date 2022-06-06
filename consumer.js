import { observeContext, unobserveContext } from './core.js'

function setValue(host, value, instance) {
  instance._value = value
  if (typeof instance.callback === 'function') {
    instance.callback.call(host, value)
  } else {
    host.requestUpdate()
  }
}

class ContextConsumer {
  constructor(host, context, callback) {
    host.addController(this)
    this.host = host
    this.context = context
    this.callback = callback
    this._value = undefined
  }

  get value() {
    return this._value
  }

  hostConnected() {
    observeContext(this.host, this.context, this, setValue)
  }

  hostDisconnected() {
    unobserveContext(this.host, this.context)
  }
}

export { ContextConsumer }

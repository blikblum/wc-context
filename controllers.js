import {
  observeContext,
  unobserveContext,
  onContextObserve,
  registerContext,
  updateContext,
} from './core.js'

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

function getFromValue(host, instance) {
  return instance._value
}

class ContextProvider {
  constructor(host, context, initialValue) {
    if (typeof host.addController === 'function') {
      host.addController(this)
    }
    this.host = host
    this.context = context
    this._value = initialValue
    this._initialized = false
    this._finalized = false
    registerContext(host, context, this, getFromValue)
    onContextObserve(host, context, () => {
      if (!this._initialized) {
        this._initialized = true
        this.initialize()
      }
    })
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = value
    updateContext(this.host, this.context)
  }

  connect() {
    if (this._finalized) {
      this.initialize()
      this._finalized = false
      this._initialized = true
    }
  }

  disconnect() {
    if (this._initialized) {
      this._initialized = false
      this._finalized = true
      this.finalize()
    }
  }

  hostConnected() {
    this.connect()
  }

  hostDisconnected() {
    this.disconnect()
  }

  initialize() {}

  finalize() {}
}

export { ContextConsumer, ContextProvider }

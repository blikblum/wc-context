import { registerContext, updateContext } from './core.js'

function getInstanceValue(provider, instance) {
  if (!instance._initialized) {
    instance.initialize()
    instance._initialized = true
  }
  return instance._value
}

export class ContextProvider {
  constructor(provider, context, initialValue) {
    this.provider = provider
    this.context = context
    this._value = initialValue
    this._initialized = false
    registerContext(provider, context, this, getInstanceValue)
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = value
    updateContext(this.provider, this.context)
  }

  dispose() {
    if (this._initialized) {
      this._initialized = false
      this.finalize()
    }
  }

  initialize() {}

  finalize() {}
}

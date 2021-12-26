import { registerContext, updateContext } from './core.js'

export class ContextProvider {
  constructor(provider, context, initialValue) {
    this.provider = provider
    this.context = context
    this._value = initialValue
    this._initialized = false
    registerContext(provider, context, initialValue)
  }

  get value() {
    return this._value
  }

  set value(value) {
    this._value = value
    updateContext(this.provider, this.context, value)
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

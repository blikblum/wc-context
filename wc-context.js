import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
  createContext,
} from './core.js'

function getWithConfig(provider, config) {
  const property = typeof config === 'string' ? config : config.property
  if (property) return provider[property]
  return config.value
}

const withContext = (Base) => {
  return class extends Base {
    constructor() {
      super()
      const providedContexts = this.constructor.providedContexts
      if (providedContexts) {
        Object.keys(providedContexts).forEach((name) => {
          const config = providedContexts[name]
          registerContext(this, name, config, getWithConfig)
        })
      }
    }

    updateContext(name, value) {
      const providedContexts = this.constructor.providedContexts
      if (providedContexts) {
        const config = providedContexts[name]
        const property = typeof config === 'string' ? config : config.property
        updateContext(this, name, property || { value })
      }
    }

    connectedCallback() {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => {
          if (Array.isArray(context)) {
            observeContext(this, context[0], context[1])
          } else {
            observeContext(this, context)
          }
        })
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => {
          if (Array.isArray(context)) {
            unobserveContext(this, context[0])
          } else {
            unobserveContext(this, context)
          }
        })
      }
    }
  }
}

export { withContext, createContext }

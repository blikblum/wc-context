import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
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

    updateProvidedContext(name, value) {
      const config = value !== undefined ? { value } : undefined
      updateContext(this, name, config)
    }

    connectedCallback() {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => observeContext(this, context))
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => unobserveContext(this, context))
      }
    }
  }
}

export { withContext }

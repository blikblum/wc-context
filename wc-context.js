import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
} from './core.js'

const initializedElements = new WeakSet()

const withContext = (Base) => {
  return class extends Base {
    get context() {
      return this.__wcContext || (this.__wcContext = {})
    }

    updateProvidedContext(name, value) {
      const providedContexts =
        this.__wcProvidedContexts || (this.__wcProvidedContexts = {})
      providedContexts[name] = value
      updateContext(this, name, value)
    }

    connectedCallback() {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => observeContext(this, context))
      }

      if (!initializedElements.has(this)) {
        const providedContextConfigs = this.constructor.providedContexts
        if (providedContextConfigs) {
          const providedContexts =
            this.__wcProvidedContexts || (this.__wcProvidedContexts = {})
          Object.keys(providedContextConfigs).forEach((name) => {
            const config = providedContextConfigs[name]
            const property =
              typeof config === 'string' ? config : config.property
            providedContexts[name] = property ? this[property] : config.value
            registerContext(this, name, providedContexts)
          })
        }
        initializedElements.add(this)
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

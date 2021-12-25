import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
} from './core.js'

const initializedElements = new WeakSet()

const withContext = (Base) => {
  return class extends Base {
    connectedCallback() {
      super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => observeContext(this, context))
      }

      if (!initializedElements.has(this)) {
        const providedContextConfigs = this.constructor.providedContexts
        if (providedContextConfigs) {
          const providedContexts =
            this.__wcProvidedContexts || (this.__wcProvidedContexts = {})
          const mappedProps =
            this.__wcMappedProps || (this.__wcMappedProps = {})
          Object.keys(providedContextConfigs).forEach((name) => {
            const config = providedContextConfigs[name]
            const property =
              typeof config === 'string' ? config : config.property
            providedContexts[name] = property ? this[property] : config.value
            if (property) {
              mappedProps[name] = property
            }
            registerContext(this, name, providedContexts)
          })
        }
        initializedElements.add(this)
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => unobserveContext(this, context))
      }
    }

    shouldUpdate(changedProperties) {
      const shouldChange = super.shouldUpdate(changedProperties)
      const mappedProps = this.__wcMappedProps
      if (mappedProps) {
        const providedContexts =
          this.__wcProvidedContexts || (this.__wcProvidedContexts = {})
        Object.keys(mappedProps).forEach((contextName) => {
          const property = mappedProps[contextName]
          if (changedProperties.has(property)) {
            const value = this[property]
            providedContexts[contextName] = value
            updateContext(this, contextName, value)
          }
        })
      }
      return shouldChange
    }
  }
}

export { withContext }

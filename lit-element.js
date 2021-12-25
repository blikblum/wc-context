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
        const providedContexts = this.constructor.providedContexts
        if (providedContexts) {
          const mappedProps =
            this.__wcMappedProps || (this.__wcMappedProps = {})
          Object.keys(providedContexts).forEach((name) => {
            const config = providedContexts[name]
            const property =
              typeof config === 'string' ? config : config.property

            if (property) {
              mappedProps[name] = property
            }
            registerContext(
              this,
              name,
              property ? this[property] : config.value
            )
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
        Object.keys(mappedProps).forEach((contextName) => {
          const property = mappedProps[contextName]
          if (changedProperties.has(property)) {
            const value = this[property]
            updateContext(this, contextName, value)
          }
        })
      }
      return shouldChange
    }
  }
}

export { withContext }

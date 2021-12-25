import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
} from './core.js'

const initializedElements = new WeakSet()

const withContext = (Base) => {
  return class extends Base {
    updateProvidedContext(name, value) {
      updateContext(this, name, value)
    }

    connectedCallback() {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => observeContext(this, context))
      }

      if (!initializedElements.has(this)) {
        const providedContexts = this.constructor.providedContexts
        if (providedContexts) {
          Object.keys(providedContexts).forEach((name) => {
            const config = providedContexts[name]
            const property =
              typeof config === 'string' ? config : config.property

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
      super.disconnectedCallback && super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => unobserveContext(this, context))
      }
    }
  }
}

export { withContext }

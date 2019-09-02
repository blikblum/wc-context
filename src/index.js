
import { observeContext, unobserveContext, addChildContext } from './core'

const withContext = (Base) => {
  return class extends Base {    
    __wcContext = {}    
    __wcChildContextInitialized = false

    get context () {
      return this.__wcContext
    }

    connectedCallback () {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach(context => observeContext(this, context))
      }

      if (!this.__wcChildContextInitialized) {
        const providedContexts = this.constructor.providedContexts
        if (providedContexts) {
          const instanceContexts = this.__wcProvidedContexts || (this.__wcProvidedContexts = {})
          Object.keys(providedContexts).forEach(name => {
            const contextInfo = providedContexts[name]
            const property = typeof contextInfo === 'string' ? contextInfo : contextInfo.property
            instanceContexts[name] = property ? this[property] : contextInfo.value
            addChildContext(this, name, instanceContexts)
          })
        }
        this.__wcChildContextInitialized = true
      }
    }

    disconnectedCallback () {
      super.disconnectedCallback && super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach(context => unobserveContext(this, context))
      }
    }
  }
}

export { withContext }

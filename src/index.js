
import { observeContext, unobserveContext, addChildContext, updateChildContext } from './core'

const withContext = (Base) => {
  return class extends Base {    
    __wcContext = {}
    __wcChildContext = {}
    __wcChildContextInitialized = false

    get context () {
      return this.__wcContext
    }

    get childContext () {
      return this.__wcChildContext
    }

    set childContext (value) {
      updateChildContext(this, value)
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
          Object.keys(providedContexts).forEach(name => {
            const contextInfo = providedContexts[name]
            this.__wcChildContext[name] = contextInfo.property ? this[contextInfo.property] : contextInfo.value
            addChildContext(this, name)
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

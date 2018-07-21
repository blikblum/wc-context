
import { defineContextProp, observeContext, unobserveContext, defineChildContextProp, addChildContext } from './core'

const withContext = (Base) => {
  return class extends Base {
    constructor () {
      super()
      defineContextProp(this, 'context')
      defineChildContextProp(this, 'childContext')
      this.__wcChildContextInitialized = false
    }

    connectedCallback () {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach(context => observeContext(this, context))
      }

      if (!this.__wcChildContextInitialized) {
        const childContext = this.childContext
        Object.keys(childContext).forEach(key => {
          addChildContext(this, key)
        })
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

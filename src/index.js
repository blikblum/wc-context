
import { defineContextProp, addChildContext, removeChildContext, observeContext, defineChildContextProp } from './core'

const withContext = (Base) => {
  return class extends Base {
    constructor () {
      super()
      defineContextProp(this, 'context')
      defineChildContextProp(this, 'childContext')
    }

    connectedCallback () {
      super.connectedCallback && super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach(context => observeContext(this, context))
      }

      const childContext = this.childContext
      Object.keys(childContext).forEach(key => {
        addChildContext(this, key, childContext[key])
      })
    }

    disconnectedCallback () {
      super.disconnectedCallback && super.disconnectedCallback()
      const childContext = this.childContext
      Object.keys(childContext).forEach(key => {
        removeChildContext(this, key)
      })
    }
  }
}

export { withContext }

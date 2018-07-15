
import { defineContextProp, addContext, removeContext } from './context'

const withContext = (Base) => {
  return class extends Base {
    constructor () {
      super()
      defineContextProp(this, 'context')
    }

    connectedCallback () {
      super.connectedCallback && super.connectedCallback()
      const childContext = this.constructor.childContext
      if (childContext) {
        Object.keys(childContext).forEach(key => {
          addContext(this, key, childContext[key])
        })
      }
    }

    disconnectedCallback () {
      super.disconnectedCallback && super.disconnectedCallback()
      const childContext = this.constructor.childContext
      if (childContext) {
        Object.keys(childContext).forEach(key => {
          removeContext(this, key)
        })
      }
    }
  }
}

export { withContext }

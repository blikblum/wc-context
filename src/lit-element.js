
import { observeContext, unobserveContext, addChildContext, updateChildContext } from './core'

class PropMapper {
  constructor (property) {
    this.property = property    
  }
}

function fromProp (property) {
  return new PropMapper(property)
}

const withContext = (Base) => {
  return class extends Base {    
    __wcContext = {}
    __wcChildContext = {}
    __wcChildContextInitialized = false
    __wcMappedProps = {}

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
      super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach(context => observeContext(this, context))
      }

      if (!this.__wcChildContextInitialized) {
        const childContext = this.childContext        
        Object.keys(childContext).forEach(key => {
          const value = childContext[key]          
          if (value instanceof PropMapper) {            
            this.__wcMappedProps[key] = value
            childContext[key] = this[value.property]
          }          
          addChildContext(this, key)
        })
        this.__wcChildContextInitialized = true
      }
    }

    disconnectedCallback () {
      super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach(context => unobserveContext(this, context))
      }
    }

    _shouldPropertyChange(property, value, old) {
      const shouldChange = super._shouldPropertyChange(property, value, old)
      if (shouldChange) {
        Object.keys(this.__wcMappedProps).some(contextKey => {
          const mapper = this.__wcMappedProps[contextKey]
          if (mapper.property === property) {
            updateChildContext(this, {[contextKey]: value})
            return true
          }
        })
      }
      return shouldChange
    }
  }
}

export { withContext, fromProp }

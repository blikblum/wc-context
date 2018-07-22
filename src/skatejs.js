
import { observeContext, unobserveContext, addChildContext, updateChildContext } from './core'

class PropMapper {
  constructor (property) {
    this.property = property
  }

  getValue (el) {
    return el[this.property]
  }

  propertyChanged (el, prevProps, prevState) {
    return el[this.property] !== prevProps[this.property]
  }
}

class StatePropMapper extends PropMapper {
  getValue (el) {
    return el.state[this.property]
  }

  propertyChanged (el, prevProps, prevState) {
    return el.state[this.property] !== prevState[this.property]
  }
}

function fromProp (property) {
  return new PropMapper(property)
}

function fromStateProp (property) {
  return new StatePropMapper(property)
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
            childContext[key] = value.getValue(this)
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

    updating (prevProps, prevState) {
      super.updating && super.updating(prevProps, prevState)      
      let changed
      Object.keys(this.__wcMappedProps).forEach(contextKey => {
        const mapper = this.__wcMappedProps[contextKey]
        if (mapper.propertyChanged(this, prevProps, prevState)) {
          changed = changed || {}
          changed[contextKey] = mapper.getValue(this)
        }
      })
      if (changed) {
        updateChildContext(this, changed)
      }
    }
  }
}

export { withContext, fromProp, fromStateProp }

import { noChange } from 'lit'
import { Directive, directive } from 'lit/directive.js'

import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
  createContext,
} from './core.js'

function getFromProperty(provider, property) {
  return provider[property]
}

const withContext = (Base) => {
  return class extends Base {
    static getPropertyDescriptor(name, key, options) {
      const defaultDescriptor = super.getPropertyDescriptor(name, key, options)

      if (!options.providedContext) return defaultDescriptor

      const setter = defaultDescriptor.set
      return {
        get: defaultDescriptor.get,
        set(value) {
          setter.call(this, value)

          updateContext(this, options.providedContext)
        },
        configurable: true,
        enumerable: true,
      }
    }

    static finalize() {
      const result = super.finalize()

      // const observedContexts = this.observedContexts || (this.observedContexts = [])

      const contexts = []

      this.elementProperties.forEach(({ context }, name) => {
        // todo: build also providedContext ?
        if (context) {
          contexts.push([context, name])
        }
      })

      if (contexts.length) {
        const observedContexts =
          this.observedContexts || (this.observedContexts = [])
        observedContexts.push(...contexts)
      }

      return result
    }

    constructor() {
      super()
      this.constructor.elementProperties.forEach(
        ({ providedContext }, name) => {
          if (providedContext) {
            registerContext(this, providedContext, name, getFromProperty)
          }
        }
      )
    }

    connectedCallback() {
      super.connectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => {
          if (Array.isArray(context)) {
            observeContext(this, context[0], context[1])
          } else {
            observeContext(this, context)
          }
        })
      }
    }

    disconnectedCallback() {
      super.disconnectedCallback()
      const observedContexts = this.constructor.observedContexts
      if (observedContexts) {
        observedContexts.forEach((context) => {
          if (Array.isArray(context)) {
            unobserveContext(this, context[0])
          } else {
            unobserveContext(this, context)
          }
        })
      }
    }
  }
}

class ContextProviderDirective extends Directive {
  context

  value

  update(part, [context, value]) {
    if (!this.context) {
      registerContext(part.element, context, value)
      this.context = context
    } else if (this.value !== value) {
      updateContext(part.element, this.context, value)
    }
    return noChange
  }
}

const contextProvider = directive(ContextProviderDirective)

export { withContext, contextProvider, createContext }

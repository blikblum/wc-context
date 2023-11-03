import { ElementPart, noChange } from 'lit'
import { Directive, directive } from 'lit/directive.js'

import {
  observeContext,
  unobserveContext,
  registerContext,
  updateContext,
  createContext,
} from './core.js'

/**
 * @typedef { import('./core.js').Context } Context
 **/

function getFromProperty(provider, property) {
  return provider[property]
}

function createClass(Base) {
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

/**
 * @typedef {import('@lit/reactive-element/decorators/base.js').ClassDescriptor} ClassDescriptor
 */

// currently add type only for class mixin usage

/**
 * @template {typeof HTMLElement } BaseClass
 * @param {BaseClass} classOrDescriptor - Base element class
 * @returns {BaseClass}
 */

function withContext(classOrDescriptor) {
  // current state of decorators sucks. Lets abuse of duck typing
  if (typeof classOrDescriptor === 'function') {
    // constructor -> typescript decorator
    return createClass(classOrDescriptor)
  }
  if (classOrDescriptor.kind === 'class') {
    // descriptor -> spec decorator
    const { kind, elements } = classOrDescriptor
    return {
      kind,
      elements,
      finisher(ctor) {
        return createClass(ctor)
      },
    }
  }
}

class ContextProviderDirective extends Directive {
  /**
   * @type {string | Context}
   */
  context

  /**
   * @type {any}
   * @memberof ContextProviderDirective
   */
  value

  /**
   * @param {ElementPart} part
   * @param {[Context | string, *]} [context, value] directive arguments
   * @return {*}
   * @memberof ContextProviderDirective
   */
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

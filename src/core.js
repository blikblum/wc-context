const contextProxyHandler = {
  get: function (target, propName) {
    return target.__wcContext[propName]
  }
}

function defineContextProp (el, name) {
  el.__wcContext = {}
  Object.defineProperty(el, name, {
    get () {
      return this.__wcContextProxy || (this.__wcContextProxy = new Proxy(this, contextProxyHandler))
    }
  })
}

function defineChildContextProp (el, name) {
  el.__wcChildContext = {}
  Object.defineProperty(el, name, {
    get () {
      return this.__wcChildContext
    },
    set (value) {
      const childContext = this.__wcChildContext
      Object.keys(value).forEach(propName => {
        const propValue = value[propName]
        if (childContext[propName] !== propValue) {
          updateContext(this, propName, propValue)
        }
        childContext[propName] = propValue
      })
    }
  })
}

function addChildContext (el, name, value) {
  const observerMap = el.__wcContextObserverMap || (el.__wcContextObserverMap = {})
  const observers = observerMap[name] || (observerMap[name] = [])
  el.addEventListener(`context-request-${name}`, (event) => {
    event.stopPropagation()
    event.detail.value = value
    observers.push(event.target)
  })
}

function removeChildContext (el, name) {
  // todo: is removeContext necessary? Probably not
  // removeEventListener expects the listener as argument
  // el.removeEventListener(`context-request-${name}`)
  const observerMap = el.__wcContextObserverMap
  const observers = observerMap && observerMap[name]
  if (observers) {
    observers.forEach(observer => {
      observer.__wcContext[name] = undefined
    })
  }
  observerMap[name] = []
}

function observeContext (el, name) {
  const event = new CustomEvent(`context-request-${name}`, {
    detail: {},
    bubbles: true,
    cancelable: true,
    composed: true
  })

  el.dispatchEvent(event)
  el.__wcContext[name] = event.detail.value
}

function updateContext (el, name, value) {
  const observerMap = el.__wcContextObserverMap
  const observers = observerMap && observerMap[name]
  if (observers) {
    observers.forEach(observer => {
      const oldValue = observer.__wcContext[name]
      observer.__wcContext[name] = value
      if (observer.contextChangedCallback) {
        observer.contextChangedCallback(name, oldValue, value)
      }
    })
  }
}

export {defineContextProp, defineChildContextProp, removeChildContext, addChildContext, observeContext, updateContext}

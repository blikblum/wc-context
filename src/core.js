const orphanMap = {}

const resolved = Promise.resolve()

const orphanResolveQueue = {
  contexts: new Set(),
  running: false,
  add (context) {
    this.contexts.add(context)
    if (!this.running) {
      this.running = true
      resolved.then(() => {
        this.contexts.forEach(context => {
          const orphans = orphanMap[context]
          orphans.forEach(orphan => {
            const event = sendContextEvent(orphan, context)
            if (event.detail.handled) {
              orphans.delete(orphan)
            }
          })
        })
        this.contexts.clear()
        this.running = false
      })
    }
  }
}

function addOrphan (el, name) {
  const orphans = orphanMap[name] || (orphanMap[name] = new Set())
  orphans.add(el)
}

function removeOrphan (el, name) {
  const orphans = orphanMap[name]
  if (orphans) {
    orphans.delete(el)
  }
}

function sendContextEvent (el, name) {
  const event = new CustomEvent(`context-request-${name}`, {
    detail: {},
    bubbles: true,
    cancelable: true,
    composed: true
  })
  el.dispatchEvent(event)
  return event
}

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

function addChildContext (el, name) {
  const observerMap = el.__wcContextObserverMap || (el.__wcContextObserverMap = {})
  const observers = observerMap[name] || (observerMap[name] = [])
  const orphans = orphanMap[name]
  el.addEventListener(`context-request-${name}`, (event) => {
    event.stopPropagation()
    const targetEl = event.target
    const value = el.__wcChildContext[name]
    const oldValue = targetEl.__wcContext[name]
    if (oldValue !== value) {
      targetEl.__wcContext[name] = value
      if (targetEl.contextChangedCallback) {
        targetEl.contextChangedCallback(name, oldValue, value)
      }
    }
    observers.push(targetEl)
    event.detail.handled = true
  })
  if (orphans && orphans.size) {
    orphanResolveQueue.add(name)
  }
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
  const event = sendContextEvent(el, name)
  if (!event.detail.handled) {
    addOrphan(el, name)
  }
}

function unobserveContext (el, name) {
  removeOrphan(el, name)
}

function updateContext (el, name, value) {
  const observerMap = el.__wcContextObserverMap
  const observers = observerMap && observerMap[name]
  if (observers) {
    observers.forEach(observer => {
      const oldValue = observer.__wcContext[name]
      if (oldValue !== value) {
        observer.__wcContext[name] = value
        if (observer.contextChangedCallback) {
          observer.contextChangedCallback(name, oldValue, value)
        }
      }
    })
  }
}

export {defineContextProp, defineChildContextProp, removeChildContext, addChildContext, observeContext, unobserveContext, updateContext}

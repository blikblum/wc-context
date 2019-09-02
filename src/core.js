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

function addChildContext (el, name, contexts) {
  const observerMap = el.__wcContextObserverMap || (el.__wcContextObserverMap = {})
  const observers = observerMap[name] || (observerMap[name] = [])
  const orphans = orphanMap[name]
  el.addEventListener(`context-request-${name}`, (event) => {
    event.stopPropagation()
    const targetEl = event.target
    const value = contexts[name]
    const context = targetEl.context
    const oldValue = context[name]
    if (oldValue !== value) {
      context[name] = value
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

function updateChildContext (el, value) {
  const childContext = el.__wcChildContext
  Object.keys(value).forEach(propName => {
    const propValue = value[propName]
    if (childContext[propName] !== propValue) {
      notifyContextChange(el, propName, propValue)
    }
    childContext[propName] = propValue
  })
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

function notifyContextChange (el, name, value) {
  const observerMap = el.__wcContextObserverMap
  const observers = observerMap && observerMap[name]
  if (observers) {
    observers.forEach(observer => {
      const context = observer.context
      const oldValue = context[name]
      if (oldValue !== value) {
        context[name] = value
        if (observer.contextChangedCallback) {
          observer.contextChangedCallback(name, oldValue, value)
        }
      }
    })
  }
}

export {addChildContext, updateChildContext, observeContext, unobserveContext, notifyContextChange}

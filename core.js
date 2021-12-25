const orphanMap = {}

const resolved = Promise.resolve()

const orphanResolveQueue = {
  contexts: new Set(),
  running: false,
  add(context) {
    this.contexts.add(context)
    if (!this.running) {
      this.running = true
      resolved.then(() => {
        this.contexts.forEach((context) => {
          const orphans = orphanMap[context]
          orphans.forEach(({ setter, arg }, orphan) => {
            const event = sendContextEvent(orphan, context, setter, arg)
            if (event.detail.handled) {
              orphans.delete(orphan)
            }
          })
        })
        this.contexts.clear()
        this.running = false
      })
    }
  },
}

function addOrphan(el, name, setter, arg) {
  const orphans = orphanMap[name] || (orphanMap[name] = new Map())
  orphans.set(el, { setter, arg })
}

function removeOrphan(el, name) {
  const orphans = orphanMap[name]
  if (orphans) {
    orphans.delete(el)
  }
}

function sendContextEvent(el, name, setter, arg) {
  const event = new CustomEvent(`context-request-${name}`, {
    detail: { setter, arg },
    bubbles: true,
    cancelable: true,
    composed: true,
  })
  el.dispatchEvent(event)
  return event
}

function registerContext(el, name, initialValue) {
  const observerMap =
    el.__wcContextObserverMap || (el.__wcContextObserverMap = {})
  const providedContexts =
    el.__wcContextProvided || (el.__wcContextProvided = {})
  providedContexts[name] = initialValue
  const observers = observerMap[name] || (observerMap[name] = [])
  const orphans = orphanMap[name]
  el.addEventListener(`context-request-${name}`, (event) => {
    event.stopPropagation()
    const targetEl = event.target
    const value = providedContexts[name]
    const { setter, arg } = event.detail
    setter(targetEl, value, arg)
    observers.push({ targetEl, setter, arg })
    event.detail.handled = true
  })
  if (orphans && orphans.size) {
    orphanResolveQueue.add(name)
  }
}

function contextSetter(targetEl, value, name) {
  const oldValue = targetEl[name]
  if (oldValue !== value) {
    targetEl[name] = value
    if (typeof targetEl.contextChangedCallback === 'function') {
      targetEl.contextChangedCallback(name, oldValue, value)
    }
  }
}

function observeContext(el, name, setter = contextSetter, setterArg = name) {
  const event = sendContextEvent(el, name, setter, setterArg)
  if (!event.detail.handled) {
    addOrphan(el, name, setter, setterArg)
  }
}

function unobserveContext(el, name) {
  removeOrphan(el, name)
}

function updateContext(el, name, value) {
  const observerMap = el.__wcContextObserverMap
  const providedContexts = el.__wcContextProvided
  if (providedContexts) {
    providedContexts[name] = value
  }

  const observers = observerMap && observerMap[name]
  if (observers) {
    observers.forEach(({ targetEl, setter, arg }) => {
      setter(targetEl, value, arg)
    })
  }
}

export { registerContext, observeContext, unobserveContext, updateContext }

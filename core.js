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

let contextCount = 0

function createContext(name) {
  return {
    id: `${name}${++contextCount}`,
    name,
    toString() {
      return this.id
    },
  }
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
    event.detail.provider = el
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
  const provider = event.detail.provider
  if (provider) {
    const providerMap =
      el.__wcContextProviderMap || (el.__wcContextProviderMap = {})
    providerMap[name] = provider
  } else {
    addOrphan(el, name, setter, setterArg)
  }
}

function removeObserver(provider, name, consumer) {
  if (provider) {
    const observerMap = provider.__wcContextObserverMap
    if (observerMap) {
      const observers = observerMap[name]
      const consumerIndex = observers.findIndex(
        (observer) => observer.targetEl === consumer
      )
      if (consumerIndex !== -1) {
        observers.splice(consumerIndex, 1)
      }
    }
  }
}

function unobserveContext(el, name) {
  const providerMap = el.__wcContextProviderMap
  if (providerMap) {
    removeObserver(providerMap[name], name, el)
  }

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

export {
  createContext,
  registerContext,
  observeContext,
  unobserveContext,
  updateContext,
  contextSetter,
}

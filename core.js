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

function sendContextEvent(consumer, context, setter, arg) {
  const event = new CustomEvent(`context-request-${context}`, {
    detail: { setter, arg },
    bubbles: true,
    cancelable: true,
    composed: true,
  })
  consumer.dispatchEvent(event)
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

function registerContext(provider, context, initialValue) {
  const observerMap =
    provider.__wcContextObserverMap || (provider.__wcContextObserverMap = {})
  const providedContexts =
    provider.__wcContextProvided || (provider.__wcContextProvided = {})
  providedContexts[context] = initialValue
  const observers = observerMap[context] || (observerMap[context] = [])
  const orphans = orphanMap[context]
  provider.addEventListener(`context-request-${context}`, (event) => {
    event.stopPropagation()
    const consumer = event.target
    const value = providedContexts[context]
    const { setter, arg } = event.detail
    setter(consumer, value, arg)
    observers.push({ consumer, setter, arg })
    event.detail.provider = provider
  })
  if (orphans && orphans.size) {
    orphanResolveQueue.add(context)
  }
}

function updateContext(provider, context, value) {
  const observerMap = provider.__wcContextObserverMap
  const providedContexts = provider.__wcContextProvided
  if (providedContexts) {
    providedContexts[context] = value
  }

  const observers = observerMap && observerMap[context]
  if (observers) {
    observers.forEach(({ consumer, setter, arg }) => {
      setter(consumer, value, arg)
    })
  }
}

function contextSetter(consumer, value, name) {
  const oldValue = consumer[name]
  if (oldValue !== value) {
    consumer[name] = value
    if (typeof consumer.contextChangedCallback === 'function') {
      consumer.contextChangedCallback(name, oldValue, value)
    }
  }
}

function observeContext(
  consumer,
  context,
  setter = contextSetter,
  setterArg = context
) {
  const event = sendContextEvent(consumer, context, setter, setterArg)
  const provider = event.detail.provider
  if (provider) {
    const providerMap =
      consumer.__wcContextProviderMap || (consumer.__wcContextProviderMap = {})
    providerMap[context] = provider
  } else {
    addOrphan(consumer, context, setter, setterArg)
  }
}

function removeObserver(provider, context, consumer) {
  if (provider) {
    const observerMap = provider.__wcContextObserverMap
    if (observerMap) {
      const observers = observerMap[context]
      const consumerIndex = observers.findIndex(
        (observer) => observer.consumer === consumer
      )
      if (consumerIndex !== -1) {
        observers.splice(consumerIndex, 1)
      }
    }
  }
}

function unobserveContext(consumer, context) {
  const providerMap = consumer.__wcContextProviderMap
  if (providerMap) {
    removeObserver(providerMap[context], context, consumer)
  }

  removeOrphan(consumer, context)
}

export {
  createContext,
  registerContext,
  updateContext,
  observeContext,
  unobserveContext,
  contextSetter,
}

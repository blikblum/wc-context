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
            const provider = event.detail.provider
            if (provider) {
              orphans.delete(orphan)
              registerProvider(orphan, context, provider)
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

function getProviderValue(provider, { getter, payload }) {
  return getter(provider, payload)
}

function providerGetter(provider, payload) {
  return payload
}

function registerContext(provider, context, payload, getter = providerGetter) {
  const observerMap =
    provider.__wcContextObserverMap || (provider.__wcContextObserverMap = {})
  const providedContexts =
    provider.__wcContextProvided || (provider.__wcContextProvided = {})
  providedContexts[context] = { getter, payload }
  const observers = observerMap[context] || (observerMap[context] = [])
  const orphans = orphanMap[context]
  provider.addEventListener(`context-request-${context}`, (event) => {
    event.stopPropagation()
    const consumer = event.target
    const value = getProviderValue(provider, providedContexts[context])
    const { setter, arg } = event.detail
    setter(consumer, value, arg)
    observers.push({ consumer, setter, arg })
    event.detail.provider = provider
  })
  if (orphans && orphans.size) {
    orphanResolveQueue.add(context)
  }
}

function updateContext(provider, context, payload) {
  const observerMap = provider.__wcContextObserverMap
  const providedContexts = provider.__wcContextProvided
  const providedContext = providedContexts && providedContexts[context]

  if (!providedContext) {
    throw new Error(
      `updateContext: "${context.name || context}" is not registered`
    )
  }

  if (payload !== undefined) {
    providedContext.payload = payload
  }

  const value = getProviderValue(provider, providedContext)

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

function registerProvider(consumer, context, provider) {
  const providerMap =
    consumer.__wcContextProviderMap || (consumer.__wcContextProviderMap = {})
  providerMap[context] = provider
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
    registerProvider(consumer, context, provider)
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

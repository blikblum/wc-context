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
          orphans.forEach(({ setter, payload }, orphan) => {
            const handled = sendContextEvent(orphan, context, payload, setter)
            if (handled) {
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

function addOrphan(el, name, payload, setter) {
  const orphans = orphanMap[name] || (orphanMap[name] = new Map())
  orphans.set(el, { setter, payload })
}

function removeOrphan(el, name) {
  const orphans = orphanMap[name]
  if (orphans) {
    orphans.delete(el)
  }
}

export class ContextRequestEvent extends Event {
  constructor(context, callback, subscribe) {
    super('context-request', {
      bubbles: true,
      cancelable: true,
      composed: true,
    })
    this.context = context
    this.callback = callback
    this.subscribe = subscribe
  }
}

function sendContextEvent(consumer, context, payload, setter) {
  let handled
  const callback = (value, unsubscribe) => {
    if (!handled) {
      registerProvider(consumer, context, unsubscribe)
    }
    setter(consumer, value, payload)
    handled = true
  }
  const event = new ContextRequestEvent(context, callback, true)
  consumer.dispatchEvent(event)
  return handled
}

function createContext(key) {
  return {
    key,
    toString() {
      return this.key
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
  provider.addEventListener(`context-request`, (event) => {
    const { target, callback, subscribe } = event
    if (event.context !== context || typeof callback !== 'function') {
      return
    }
    event.stopPropagation()
    const value = getProviderValue(provider, providedContexts[context])
    if (subscribe) {
      const unsubscribe = () => {
        removeObserver(provider, context, target)
      }
      callback(value, unsubscribe)
      observers.push({ consumer: target, callback, unsubscribe })
      runListeners(provider, context, 'observe', observers.length)
    } else {
      callback(value)
    }
  })
  if (orphans && orphans.size) {
    orphanResolveQueue.add(context)
  }
}

function getProvidedContext(provider, context, caller) {
  const providedContexts = provider.__wcContextProvided
  const providedContext = providedContexts && providedContexts[context]

  if (!providedContext) {
    throw new Error(`${caller}: "${context.name || context}" is not registered`)
  }

  return providedContext
}

function updateContext(provider, context, payload) {
  const observerMap = provider.__wcContextObserverMap
  const providedContext = getProvidedContext(provider, context, 'updateContext')

  if (payload !== undefined) {
    providedContext.payload = payload
  }

  const value = getProviderValue(provider, providedContext)

  const observers = observerMap && observerMap[context]
  if (observers) {
    observers.forEach(({ consumer, callback, unsubscribe }) => {
      callback.call(consumer, value, unsubscribe)
    })
  }
}
function consumerSetter(consumer, value, name) {
  const oldValue = consumer[name]
  if (oldValue !== value) {
    consumer[name] = value
    if (typeof consumer.contextChangedCallback === 'function') {
      consumer.contextChangedCallback(name, oldValue, value)
    }
  }
}

function runListeners(provider, context, type, count) {
  const providedContext = getProvidedContext(provider, context, 'runListeners')

  const listeners = providedContext.listeners
  if (listeners) {
    for (const listener of listeners) {
      if (listener.type === type) {
        listener.callback.call(provider, { count })
      }
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
  payload = context,
  setter = consumerSetter
) {
  const handled = sendContextEvent(consumer, context, payload, setter)
  if (!handled) {
    addOrphan(consumer, context, payload, setter)
  }
}

function removeObserver(provider, context, consumer) {
  const observerMap = provider.__wcContextObserverMap
  if (observerMap) {
    const observers = observerMap[context]
    const consumerIndex = observers.findIndex(
      (observer) => observer.consumer === consumer
    )
    if (consumerIndex !== -1) {
      observers.splice(consumerIndex, 1)
    }
    runListeners(provider, context, 'unobserve', observers.length)
  }
}

function unobserveContext(consumer, context) {
  const providerMap = consumer.__wcContextProviderMap
  if (providerMap) {
    const unsubscribe = providerMap[context]
    if (unsubscribe) {
      unsubscribe()
      providerMap[context] = undefined
    }
  }

  removeOrphan(consumer, context)
}

function onContextObserve(provider, context, callback) {
  const providedContext = getProvidedContext(
    provider,
    context,
    'onContextObserve'
  )
  const listeners =
    providedContext.listeners || (providedContext.listeners = [])
  listeners.push({ callback, type: 'observe' })
}

function onContextUnobserve(provider, context, callback) {
  const providedContext = getProvidedContext(
    provider,
    context,
    'onContextUnobserve'
  )

  const listeners =
    providedContext.listeners || (providedContext.listeners = [])
  listeners.push({ callback, type: 'unobserve' })
}

export {
  createContext,
  registerContext,
  updateContext,
  observeContext,
  unobserveContext,
  consumerSetter,
  providerGetter,
  onContextObserve,
  onContextUnobserve,
}

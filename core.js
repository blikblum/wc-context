const noContext = Symbol('noContext')

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

/**
 * @typedef {Object} Context
 */

/**
 * @typedef {Object} ContextGetter
 * @property {Function} getter Function that is called in provider
 * @property {any} [payload] Payload passed to getter
 */

/**
 * @param {string} key Identify the context
 * @return {Context}
 */
function createContext(key) {
  return {
    key,
    toString() {
      return this.key
    },
  }
}

/**
 * @param {HTMLElement} provider HTMLElement acting as a context provider
 * @param {Object} options
 * @param {Function} options.getter
 * @param {*} [options.payload]
 * @return {*}
 */
function getProviderValue(provider, { getter, payload }) {
  return getter(provider, payload)
}

/**
 * @description Default context getter implementation. Just returns the payload
 * @param {HTMLElement} provider HTMLElement acting as a context provider
 * @param {*} payload Options passed to the callback
 * @return {*}
 */
function providerGetter(provider, payload) {
  return payload
}

/**
 * @param {HTMLElement} provider HTMLElement acting as a context provider
 * @param {string | Context} context  Context identifier
 * @param {*} payload Value passed to getter
 * @param {Function} [getter=providerGetter]
 */
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
    if (subscribe || value === noContext) {
      const unsubscribe = () => {
        removeObserver(provider, context, target)
      }
      observers.push({
        consumer: target,
        callback,
        unsubscribe,
        once: !subscribe,
      })
      if (value !== noContext) {
        callback(value, unsubscribe)
      }
      runListeners(provider, context, 'observe', observers.length)
    } else {
      callback(value)
    }
  })
  if (orphans && orphans.size) {
    orphanResolveQueue.add(context)
  }
}

/**
 * @param {HTMLElement} provider HTMLElement that provides a context
 * @param {string | Context} context Context identifier
 * @param {string} caller Function caller identifier
 * @return {ContextGetter}
 */
function getProvidedContext(provider, context, caller) {
  const providedContexts = provider.__wcContextProvided
  const providedContext = providedContexts && providedContexts[context]

  if (!providedContext) {
    throw new Error(`${caller}: "${context.name || context}" is not registered`)
  }

  return providedContext
}

/**
 * @param {HTMLElement} provider HTMLElement that provides a context
 * @param {string | Context} context Context identifier
 * @param {*} [payload=context] Value passed to provider context getter
 */
function updateContext(provider, context, payload) {
  const observerMap = provider.__wcContextObserverMap
  const providedContext = getProvidedContext(provider, context, 'updateContext')

  if (payload !== undefined) {
    providedContext.payload = payload
  }

  const value = getProviderValue(provider, providedContext)

  if (value === noContext) {
    return
  }

  const observers = observerMap && observerMap[context]
  // if we got here, observers is necessarily defined
  observers.forEach(({ consumer, callback, unsubscribe, once }) => {
    if (once) {
      unsubscribe()
      unsubscribe = undefined
    }
    callback.call(consumer, value, unsubscribe)
  })
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

/**
 * @description Observes a context in a consumer. Optionally define how the context value is set
 * @param {HTMLElement} consumer HTMLElement that consumes a context
 * @param {string | Context} context Context identifier
 * @param {*} [payload=context] Value passed to setter
 * @param {Function} [setter=consumerSetter]
 */
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
  const observers = observerMap[context]
  const consumerIndex = observers.findIndex(
    (observer) => observer.consumer === consumer
  )
  if (consumerIndex !== -1) {
    observers.splice(consumerIndex, 1)
  }
  runListeners(provider, context, 'unobserve', observers.length)
}

/**
 * @description Unobserves a context in a consumer
 * @param {HTMLElement} consumer HTMLElement that consumes a context
 * @param {string | Context} context Context identifier
 */
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

async function getContext(consumer, context) {
  return new Promise((resolve) => {
    const event = new ContextRequestEvent(context, resolve, false)
    consumer.dispatchEvent(event)
  })
}

export {
  noContext,
  createContext,
  registerContext,
  updateContext,
  observeContext,
  unobserveContext,
  consumerSetter,
  providerGetter,
  onContextObserve,
  onContextUnobserve,
  getContext,
}

const contextMap = Object.create(null)

function findContextEntry (el, name) {
  const entries = contextMap[name]
  if (entries) {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i]
      if (entry.el.contains(el)) {
        return entry
      }
    }
  }
}

function getContextValue (el, name) {
  const entry = findContextEntry(el, name)
  if (entry) {
    return typeof entry.value === 'function' ? entry.value.call(entry.el) : entry.value
  }
}

const proxyHandler = {
  get: function (target, property) {
    return getContextValue(target, property)
  }
}

function getter () {
  return this.__wcContextProxy || (this.__wcContextProxy = new Proxy(this, proxyHandler))
}

function defineContextProp (el, propName) {
  Object.defineProperty(el, propName, {
    get: getter
  })
}

function addContext (el, name, value) {
  const entries = contextMap[name] || (contextMap[name] = [])
  entries.push({el, value, observers: []})
}

function removeContext (el, name) {
  const entries = contextMap[name]
  if (entries) {
    const index = entries.findIndex((mapping) => mapping.el === el)
    if (index !== -1) entries.splice(index, 1)
  }
}

function observeContext (el, name) {
  const entry = findContextEntry(el, name)
  if (entry) {
    entry.observers.push(el)
  }
}

function invalidateContext (el, name) {
  const entries = contextMap[name]
  if (entries) {
    const entry = entries.find(item => item.el === el)
    if (entry) {
      entry.observers.forEach(observer => {
        if (observer.contextChangedCallback) {
          observer.contextChangedCallback(name)
        }
      })
    }
  }
}

export {defineContextProp, removeContext, addContext, observeContext, invalidateContext}

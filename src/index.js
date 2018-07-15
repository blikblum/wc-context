const contextMap = Object.create(null)

function findContext (el, name) {
  const contexts = contextMap[name]
  if (contexts) {
    for (let i = contexts.length - 1; i >= 0; i--) {
      const mapping = contexts[i]
      if (mapping.el.contains(el)) {
        return typeof mapping.value === 'function' ? mapping.value.call(mapping.el) : mapping.value
      }
    }
  }
}

const proxyHandler = {
  get: function (target, property, receiver) {
    return findContext(target, property)
  }
}

function getter () {
  return new Proxy(this, proxyHandler)
}

function defineContextProp (obj, propName) {
  Object.defineProperty(obj, propName, {
    get: getter
  })
}

function addContext (el, name, value) {
  const entries = contextMap[name] || (contextMap[name] = [])
  entries.push({el, value})
}

function removeContext (el, name) {
  const contexts = contextMap[name]
  if (contexts) {
    const index = contexts.findIndex((mapping) => mapping.el === el)
    if (index !== -1) contexts.splice(index, 1)
  }
}

export {defineContextProp, removeContext, addContext}

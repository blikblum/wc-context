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
  get: function (target, property) {
    return findContext(target, property)
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

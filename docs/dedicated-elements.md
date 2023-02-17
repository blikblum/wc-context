# Dedicated custom elements

wc-context comes with two built in components that can be used to provide or consume a context declaratively.

## context-provider

The `context-provider` component is exported in 'wc-context/context-provider.js'

It accepts the attribute `context` that identifies the context to be provided and the attribute / property `value` that defines the context value

> The `context` attribute cannot be modified. Setting its value after initial name / id definition has no effect.

## context-consumer

The `context-consumer` component is exported in 'wc-context/context-consumer.js'

It accepts the attribute `context` that identifies the context to be consumed

An `context-update` event is triggered on `context-consumer` when context value changes. The event has `context` and `value` properties

## Example

```javascript
import 'wc-context/context-provider.js'
import 'wc-context/context-consumer.js'

document.body.innerHTML = `
<context-provider context="theme" value="light">
  <div>
    <context-consumer context="theme"></context-consumer>
  </div>
</context-provider>`

const provider = document.querySelector('context-provider')
const consumer = document.querySelector('context-consumer')

consumer.addEventListener('context-update', ({ context, value }) => {
  console.log(`Context ${context}:${value}`)
})

provider.value = 'dark'
```

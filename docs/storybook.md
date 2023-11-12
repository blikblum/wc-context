# Storybook

Demoing components that uses contexts is not different from standard ones in most cases.

## Context consumed with class mixins

If the context is consumed using class mixins, i.e., reflected in a property, just pass the value using `args`:

```js
export default {
  title: 'Components/MyComponent',
  component: 'my-component',  
  // my-component consumes a context reflected in foo property
  args: {
    foo: 'bar',
  },
}

export const Default = {
  args: {},
}
```

## Context consumed with controller/dedicated elements

For contexts of child components, consumed with `ContextConsumer` controller or `context-consumer` element, is necessary to provide the contexts in the root component. This can be accomplished using a [custom render function](https://storybook.js.org/docs/web-components/api/csf#custom-render-functions) and same techniques described in [testing guide](./testing.md#context-consumed-with-controllerdedicated-elements).

While it works, it makes harder to create stories. Using wc-context low level API is possible to create a story decorator that accepts a `contexts` hash parameter and provides the respective contexts:

```js
import { registerContext } from 'wc-context'

export function withContexts = (story, context) => {
  const el = story()

  const contexts = context.parameters.contexts
  if (contexts) {
    for (const [context, value] of Object.entries(contexts)) {
      registerContext(el, context, value)
    }
  }

  return el
}
```

To use, register the decorator for each story or globally in storybook 'preview.js'

```js
import { withContexts } from './withContexts.js'

export default {
  title: 'Components/MyComponent',
  component: 'my-component',
  decorators: [withContexts],
  // my-component consumes the "foo" context using controller or has a child element that consumes it
  parameters: {
    contexts: {
      foo: 'bar'
    }
  },
}

export const Default = {
  args: {},
}

```
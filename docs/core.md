# Core (low level) API

The low level functions are exported in `wc-context` and can be used to handle specific cases or create a new interface / integration, like [the one for storybook](./storybook.md#context-consumed-with-controllerdedicated-elements).

For example, is possible to provide a context in body element to be consumed anywhere in the page.

```javascript
import { registerContext, updateContext } from 'wc-context'

registerContext(document.body, 'theme', 'light')

document.querySelector('#theme-toggle-button').addEventListener('click', () => {
  updateContext(document.body, 'theme', 'dark')
})
```

> TBD: properly document the functions, how to customize setting / getting context values
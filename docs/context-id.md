# Context identification

Its possible to identify the context either by a string or an unique identifier, with different in functionality 

## String

A context can be identified by a string value

```js
import { LitElement } from 'lit'
import { ContextProvider, ContextConsumer } from 'wc-context/controllers.js'


// provides "theme" context
class RootElement extends HTMLElement {  
  themeProvider = new ContextProvider(this, 'theme', 'light')  
}

// consumes "theme" context
class ConsumerElement extends LitElement {
  themeConsumer = new ContextConsumer(this, 'theme') 
}
```

## Unique identifier

Use `createContext` function to create a unique context identifier

```js
import { LitElement } from 'lit'
import { ContextProvider, ContextConsumer } from 'wc-context/controllers.js'
import { createContext } from 'wc-context'

const themeContext = createContext()

// provides `themeContext` context
class RootElement extends HTMLElement {  
  themeProvider = new ContextProvider(this, themeContext, 'light')  
}

// consumes `themeContext` context
class ConsumerElement extends LitElement {
  themeConsumer = new ContextConsumer(this, themeContext) 
}
```
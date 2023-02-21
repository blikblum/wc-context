import { LitElement, html } from 'lit'
import { createContext } from 'wc-context'
import 'wc-context/context-provider.js'
import 'wc-context/context-consumer.js'

const numCtx = createContext('num') // context could be also a string

class MyApp extends LitElement {
  static properties = {
    providedNumber: {},
    consumedNumber: {},
  }

  toggleNumberClick() {
    this.providedNumber = Math.random()
  }

  numContextUpdate(e) {
    console.log(
      `Context value updated | context: ${e.context} | value: ${e.value}`
    )
    this.consumedNumber = e.value
  }

  render() {
    return html`<button @click=${this.toggleNumberClick}>
        Toggle provided number
      </button>
      <context-provider context=${numCtx} .value=${this.providedNumber}>
        <div>Provided number: ${this.providedNumber}</div>
        <div>
          <context-consumer
            context=${numCtx}
            @context-update=${this.numContextUpdate}
          ></context-consumer>
          <div>Consumed number ${this.consumedNumber}</div>
        </div>
      </context-provider> `
  }
}

customElements.define('my-app', MyApp)

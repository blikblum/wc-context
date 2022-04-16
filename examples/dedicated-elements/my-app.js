import { LitElement, html } from 'lit'
import '../../context-provider.js'
import '../../context-consumer.js'
import { createContext } from '../../core.js'

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
      <context-provider key=${numCtx} .value=${this.providedNumber}>
        <div>Provided number: ${this.providedNumber}</div>
        <div>
          <context-consumer
            key=${numCtx}
            @context-update=${this.numContextUpdate}
          ></context-consumer>
          <div>Consumed number ${this.consumedNumber}</div>
        </div>
      </context-provider> `
  }
}

customElements.define('my-app', MyApp)

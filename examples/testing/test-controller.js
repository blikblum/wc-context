import { LitElement, html } from 'lit'
import { ContextConsumer } from 'wc-context/controllers.js'

class TestController extends LitElement {
  fooContextConsumer = new ContextConsumer(this, 'fooContext')

  render() {
    return html`<div>fooContext: ${this.fooContextConsumer.value}</div>`
  }
}

customElements.define('test-controller', TestController)
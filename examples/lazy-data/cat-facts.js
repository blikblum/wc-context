import { LitElement, html } from 'lit'
import { ContextConsumer } from 'wc-context/controllers.js'

// no need to use withContext mixin when using reactive controller
class CatFacts extends LitElement {
  // using controller
  catFactContext = new ContextConsumer(this, 'catFact')

  render() {
    if (!this.catFactContext.value) {
      return html`<div>No fact defined. Wait 10 seconds</div>`
    }

    const { error, data, loading } = this.catFactContext.value

    if (error) {
      return html`<div>Error: ${error}</div>`
    }

    if (loading) {
      return html`<div>Loading ...</div>`
    }

    return html`<div>Fact: ${data.fact}</div>`
  }
}

customElements.define('cat-facts', CatFacts)

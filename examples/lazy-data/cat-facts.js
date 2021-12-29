import { LitElement, html } from 'lit'
import { withContext } from '../../lit.js'

class CatFacts extends withContext(LitElement) {
  static properties = {
    fact: { attribute: false, context: 'catFact' },
  }

  render() {
    if (!this.fact) {
      return html`<div>No fact defined. Wait 10 seconds</div>`
    }

    const { error, data, loading } = this.fact

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

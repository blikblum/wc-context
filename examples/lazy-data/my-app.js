import { LitElement, html } from 'lit'
import { DataProvider } from './dataProvider.js'
import './cat-facts.js'
import { queueError } from './dataService.js'

class MyApp extends LitElement {
  dataProvider = new DataProvider(this, 'catFact')

  addCatFactsClick(e) {
    e.preventDefault()
    this.renderRoot.appendChild(document.createElement('cat-facts'))
  }

  queueErrorClick(e) {
    e.preventDefault()
    queueError()
  }

  render() {
    return html`<button @click=${this.addCatFactsClick}>
        Add cat facts element</button
      ><button @click=${this.queueErrorClick}>Queue error</button>`
  }
}

customElements.define('my-app', MyApp)

import { html, LitElement, css } from 'lit'
import { withContext } from 'wc-context/lit.js'

import './theme-switcher.js'
import './theme-consumer.js'

const alternateThemes = ['blue', 'yellow', 'red']

class ShadowDomExample extends withContext(LitElement) {
  static get styles() {
    return [
      css`
        .margin-top {
          margin-top: 8px;
        }
      `,
    ]
  }

  render() {
    return html`
      <div>
        <div class="margin-top">
          Provider in shadow dom and consumer in light dom
        </div>
        <div>
          This poses some challenge because the consumer is connected to the DOM
          earlier thus requesting the context before is available / provider
          element is connected
        </div>
        <theme-switcher id="p1">
          <theme-consumer id="c1"></theme-consumer>
        </theme-switcher>

        <div class="margin-top">Nested providers</div>
        <theme-switcher id="p2">
          <theme-switcher id="p3" .themes=${alternateThemes}>
            <theme-consumer id="c2"></theme-consumer>
          </theme-switcher>
        </theme-switcher>
      </div>
    `
  }
}

customElements.define('shadow-dom-example', ShadowDomExample)

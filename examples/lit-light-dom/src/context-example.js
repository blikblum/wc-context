import { css, html, LitElement } from 'lit'
import { withContext, contextProvider } from 'wc-context/lit.js'
import { ContextProvider } from 'wc-context/controllers.js'

import './theme-provider.js'
import './theme-consumer.js'
import './title-theme-consumer.js'

const alternateThemes = ['blue', 'yellow', 'red']

class ContextExample extends withContext(LitElement) {
  static styles = [
    css`
      .subtitle {
        margin-top: 8px;
      }
    `,
  ]

  titleProvider = new ContextProvider(this, 'title', 'one title')

  toggleTitle() {
    const currentTitle = this.titleProvider.value
    this.titleProvider.value =
      currentTitle === 'one title' ? 'another title' : 'one title'
  }

  render() {
    return html`
      <div>
        <theme-provider>
          <theme-consumer></theme-consumer>
        </theme-provider>
        <div class="subtitle">
          Nested providers (the closest provider is used)
        </div>
        <theme-provider>
          <theme-provider .themes=${alternateThemes}>
            <theme-consumer></theme-consumer>
          </theme-provider>
        </theme-provider>
        <div class="subtitle">
          Consume two contexts (one provided by Lit property other by
          controller)
        </div>
        <theme-provider>
          <button @click=${this.toggleTitle}>Toggle title</button>
          <titletheme-consumer></titletheme-consumer>
        </theme-provider>
        <div class="subtitle">Using directive</div>
        <div ${contextProvider('theme', 'blue')}>
          <theme-consumer></theme-consumer>
        </div>
        <div ${contextProvider('theme', 'yellow')}>
          <theme-consumer></theme-consumer>
        </div>
      </div>
    `
  }
}

customElements.define('context-example', ContextExample)

import { css, html, LitElement } from 'lit'
import { styles } from './styles.js'
import { withContext, contextProvider } from 'wc-context/lit.js'

class ThemeProvider extends withContext(LitElement) {
  static get properties() {
    return {
      theme: { type: String },
      alttheme: { type: String },
      activeTheme: { type: String, providedContext: 'theme' },
    }
  }

  toggleTheme() {
    const primaryTheme = this.theme || 'light'
    const altTheme = this.alttheme || 'dark'
    this.activeTheme =
      this.activeTheme === primaryTheme ? altTheme : primaryTheme
  }

  connectedCallback() {
    super.connectedCallback()
    this.activeTheme = this.theme || 'light'
  }

  render() {
    return html`
      <button @click=${this.toggleTheme}>toggle theme</button>
      <slot></slot>
    `
  }
}

class ThemeConsumer extends withContext(LitElement) {
  static properties = {
    theme: { type: String, context: 'theme' },
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    )
  }

  render() {
    return html`<div style=${styles[this.theme]}>${this.theme}</div>`
  }
}

class TitleProvider extends withContext(LitElement) {
  static get properties() {
    return {
      value: { type: String, providedContext: 'title' },
    }
  }

  render() {
    return html`<slot></slot>`
  }
}

class TitleThemeConsumer extends withContext(LitElement) {
  static properties = {
    title: { context: 'title' },
    theme: { context: 'theme' },
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    )
  }

  render() {
    return html`
      <div>${this.title}</div>
      <div style=${styles[this.theme]}>${this.theme}</div>
    `
  }
}

class App extends withContext(LitElement) {
  static get properties() {
    return {
      state: { type: Object },
    }
  }

  static get styles() {
    return [
      css`
        .subtitle {
          margin-top: 8px;
        }
      `,
    ]
  }

  constructor() {
    super()
    this.state = { title: 'one title' }
    this.toggleTitle = () => {
      this.state = {
        ...this.state,
        ...{
          title:
            this.state.title === 'one title' ? 'another title' : 'one title',
        },
      }
    }
  }

  render() {
    return html`
      <div>
        <theme-provider>
          <theme-consumer></theme-consumer>
        </theme-provider>
        <div class="subtitle">Nested providers</div>
        <theme-provider>
          <theme-provider theme="blue" alttheme="yellow">
            <theme-consumer></theme-consumer>
          </theme-provider>
        </theme-provider>
        <div class="subtitle">Consume two contexts</div>
        <theme-provider>
          <button @click=${this.toggleTitle}>Toggle title</button>
          <title-provider value=${this.state.title}>
            <titletheme-consumer></titletheme-consumer>
          </title-provider>
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

customElements.define('theme-provider', ThemeProvider)
customElements.define('theme-consumer', ThemeConsumer)
customElements.define('title-provider', TitleProvider)
customElements.define('titletheme-consumer', TitleThemeConsumer)
customElements.define('context-example', App)

import { html, LitElement, css } from 'lit'
import { withContext, contextProvider } from 'wc-context/lit'
import { styles } from './styles.js'

class ThemeSwitcher extends withContext(LitElement) {
  static properties = {
    theme: { type: String },
    alttheme: { type: String },
    activeTheme: { type: String },
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
      <theme-provider id=${this.id} theme=${this.activeTheme}>
        <button @click=${this.toggleTheme}>toggle theme</button>
        <slot />
      </theme-provider>
    `
  }
}

class ThemeProvider extends withContext(LitElement) {
  static properties = {
    theme: { type: String, providedContext: 'theme' },
  }

  render() {
    return html`<slot />`
  }
}

class ThemeConsumer extends withContext(LitElement) {
  static observedContexts = ['theme']

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `(${this.id}) `,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    )
    this.requestUpdate()
  }

  render() {
    return html`<div style=${styles[this.theme]}>${this.theme}</div>`
  }
}

class TitleProvider extends withContext(LitElement) {
  static properties = {
    value: { type: String, providedContext: 'title' },
  }

  render() {
    return html`<slot />`
  }
}

class TitleThemeConsumer extends withContext(LitElement) {
  static observedContexts = ['title', 'theme']

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    )
    this.requestUpdate()
  }

  render() {
    return html`
      <div>${this.title}</div>
      <div style=${styles[this.theme]}>${this.theme}</div>
    `
  }
}

class App extends withContext(LitElement) {
  static get styles() {
    return [
      css`
        .subtitle {
          margin-top: 8px;
        }
      `,
    ]
  }

  static properties = {
    state: { type: Object },
  }

  constructor() {
    super()
    this.state = { title: 'one title' }
  }

  toggleTitle() {
    this.state = {
      ...this.state,
      ...{
        title: this.state.title === 'one title' ? 'another title' : 'one title',
      },
    }
  }
  render() {
    return html`
      <div>
        <div class="subtitle">Consumer on light dom</div>
        <theme-switcher id="p1">
          <theme-consumer id="c1"></theme-consumer>
        </theme-switcher>

        <div class="subtitle">Nested providers</div>
        <theme-switcher id="p2">
          <theme-switcher id="p3" theme="blue" alttheme="yellow">
            <theme-consumer id="c2"></theme-consumer>
          </theme-switcher>
        </theme-switcher>
        <div class="subtitle">Consume two contexts</div>
        <theme-switcher id="p4">
          <title-provider value=${this.state.title}>
            <titletheme-consumer></titletheme-consumer>
          </title-provider>
        </theme-switcher>
        <button @click=${this.toggleTitle}>Toggle title</button>
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

customElements.define('theme-switcher', ThemeSwitcher)
customElements.define('theme-provider', ThemeProvider)
customElements.define('theme-consumer', ThemeConsumer)
customElements.define('title-provider', TitleProvider)
customElements.define('titletheme-consumer', TitleThemeConsumer)
customElements.define('context-example', App)

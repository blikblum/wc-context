import { fromProp } from 'wc-context/lit-element'
import { html } from '@polymer/lit-element'
import { styles } from './styles'
import { Component } from './component'

class ThemeSwitcher extends Component {
  static get properties () {
    return {
      theme: { type: String },
      alttheme: { type: String },
      activeTheme: { type: String }
    }
  }

  toggleTheme = () => {
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
      <slot/>
    </theme-provider>
    `
  }
}

class ThemeProvider extends Component {
  static properties = {
    theme: {type: String}
  }

  childContext = {
    theme: fromProp('theme')
  }

  render() {
    return html`<slot/>`
  }
}

class ThemeConsumer extends Component {
  static get observedContexts() {
    return ['theme']
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `(${this.id}) `,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    )
    this.requestUpdate()
  }

  render() {
    return html`<div style=${styles[this.context.theme]}>${
      this.context.theme
    }</div>`
  }
}

class TitleProvider extends Component {
  static properties = {
    value: {type: String}
  }

  childContext = {
    title: fromProp('value')
  }

  render() {
    return html`<slot/>`
  }
}

class TitleThemeConsumer extends Component {
  static get observedContexts() {
    return ['title', 'theme']
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    )
    this.requestUpdate()
  }

  render() {
    return html`
    <div>${this.context.title}</div>
    <div style=${styles[this.context.theme]}>${this.context.theme}</div>
    `
  }
}

class App extends Component {
  
  static get properties () {
    return {
      state: { type: Object }
    }
  }

  state = { title: 'one title' }
  
  toggleTitle = () => {
    this.state = {
      ...this.state,
      ...{
        title: this.state.title === 'one title' ? 'another title' : 'one title'
      }
    }
  }
  render() {
    return html`
      <div>
        <theme-switcher id="p1">
          <theme-consumer id="c1"></theme-consumer>
        </theme-switcher>
        <theme-switcher id="p2">
          <theme-switcher id="p3" theme="blue" alttheme="yellow">
            <theme-consumer id="c2"></theme-consumer>
          </theme-switcher>
        </theme-switcher>
        <theme-switcher id="p4">
          <title-provider value=${this.state.title}>
            <titletheme-consumer></titletheme-consumer>
          </title-provider>
        </theme-switcher>        
        <button @click=${this.toggleTitle}>Toggle title</button>
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


const appEl = document.createElement('context-example')

document.body.appendChild(appEl)

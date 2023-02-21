import { html, LitElement } from 'lit'

import 'wc-context/context-provider.js'

class ThemeSwitcher extends LitElement {
  static properties = {
    themes: { type: Array },
    theme: { type: String, providedContext: 'theme' },
  }

  constructor() {
    super()
    this.themes = ['light', 'dark']
  }

  toggleTheme() {
    let newIndex = this.themes.indexOf(this.theme) + 1
    if (newIndex >= this.themes.length) {
      newIndex = 0
    }
    this.theme = this.themes[newIndex]
  }

  willUpdate(changed) {
    if (changed.has('themes')) {
      this.toggleTheme()
    }
  }

  render() {
    return html`
      <context-provider id=${this.id} context="theme" value=${this.theme}>
        <button @click=${this.toggleTheme}>Toggle theme</button>
        <slot></slot>
      </context-provider>
    `
  }
}

customElements.define('theme-switcher', ThemeSwitcher)

import { html, LitElement } from 'lit'
import { withContext } from 'wc-context/lit.js'

class ThemeProvider extends withContext(LitElement) {
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
      <button @click=${this.toggleTheme}>Toggle theme</button>
      <slot></slot>
    `
  }
}

customElements.define('theme-provider', ThemeProvider)

import { html, LitElement } from 'lit'
import { withContext } from 'wc-context/lit.js'
import { styles } from './styles.js'

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

customElements.define('theme-consumer', ThemeConsumer)

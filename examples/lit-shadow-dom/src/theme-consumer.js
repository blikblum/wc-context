import { html, LitElement } from 'lit'
import { withContext } from 'wc-context/lit.js'
import { styles } from './styles.js'

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

customElements.define('theme-consumer', ThemeConsumer)

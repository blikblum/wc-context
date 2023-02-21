import { html, LitElement } from 'lit'
import { withContext } from 'wc-context/lit.js'
import { styles } from './styles.js'

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

customElements.define('titletheme-consumer', TitleThemeConsumer)

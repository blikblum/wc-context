import { html } from 'lit-html';
import { styles } from './styles';
import { Component } from './component';

class ThemeProvider extends Component {
  static props = {
    theme: String,
    alttheme: String,
    activeTheme: String
  };

  static providedContexts = {
    theme: { property: 'activeTheme' }
  };

  toggleTheme = () => {
    const primaryTheme = this.theme || 'light';
    const altTheme = this.alttheme || 'dark';
    this.activeTheme =
      this.activeTheme === primaryTheme ? altTheme : primaryTheme;
  };

  connectedCallback() {
    this.activeTheme = this.theme || 'light';
    super.connectedCallback();    
  }

  render() {
    return html`
      <button @click=${this.toggleTheme}>toggle theme</button>
      <slot></slot>
    `;
  }
}

class ThemeConsumer extends Component {
  static get observedContexts() {
    return ['theme'];
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    );
    this.forceUpdate();
  }

  render() {
    return html`<div style=${styles[this.context.theme]}>${
      this.context.theme
    }</div>`;
  }
}

class TitleProvider extends Component {
  static props = {
    value: String
  };

  static providedContexts = {
    title: { property: 'value' }
  };

  render() {
    return html`<slot></slot>`;
  }
}

class TitleThemeConsumer extends Component {
  static get observedContexts() {
    return ['title', 'theme'];
  }

  contextChangedCallback(name, oldValue, value) {
    console.log(
      this.constructor.name,
      `context "${name}" changed from "${oldValue}" to "${value}"`
    );
    this.forceUpdate();
  }

  render() {
    return html`
    <div>${this.context.title}</div>
    <div style=${styles[this.context.theme]}>${this.context.theme}</div>
    `;
  }
}

class App extends Component {
  static props = {
    state: Object
  }

  state = { title: 'one title' };

  toggleTitle = () => {
    this.state = {
      ...this.state,
      ...{
        title: this.state.title === 'one title' ? 'another title' : 'one title'
      }
    };
  };

  render() {
    return html`
      <div>
        <theme-provider>
          <theme-consumer></theme-consumer>
        </theme-provider>
        <theme-provider>
          <theme-provider theme="blue" alttheme="yellow">
            <theme-consumer></theme-consumer>
          </theme-provider>
        </theme-provider>
        <theme-provider>
          <title-provider .value=${this.state.title}>
            <titletheme-consumer></titletheme-consumer>
          </title-provider>
        </theme-provider>        
        <button @click=${this.toggleTitle}>Toggle title</button>
      </div>
    `;
  }
}

customElements.define('theme-provider', ThemeProvider);
customElements.define('theme-consumer', ThemeConsumer);
customElements.define('title-provider', TitleProvider);
customElements.define('titletheme-consumer', TitleThemeConsumer);
customElements.define('context-example', App);

const appEl = document.createElement('context-example')

document.body.appendChild(appEl)

import { LitElement } from 'lit'
import { withContext } from 'wc-context/lit.js'

class TestProperty extends withContext(LitElement) {
  static properties = {
    foo: { type: String, context: 'fooContext' },
  }
}

customElements.define('test-property', TestProperty)
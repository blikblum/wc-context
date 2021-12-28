/* eslint-env jest */
import { withContext } from '../lit.js'
import { LitElement } from 'lit'

const Component = withContext(LitElement)

const ProviderComponent = class extends Component {
  static properties = {
    myProp: { providedContext: 'propertyContext' },
    myOtherProp: { providedContext: 'otherContext' },
  }

  constructor() {
    super()
    this.myProp = 'test'
    this.myOtherProp = 'xxx'
  }
}

const ConsumerComponent = class extends Component {
  static properties = {
    myProp: { context: 'otherContext' },
  }

  static observedContexts = ['propertyContext']
}

customElements.define('lit-component', Component)
customElements.define('lit-provider', ProviderComponent)
customElements.define('lit-consumer', ConsumerComponent)

// unable to create custom elements with jsdom
describe('withContext', () => {
  let grandfatherEl
  let parentEl
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <lit-provider id="grandfather">
          <lit-consumer id="parent"></lit-consumer>
          <div id="parent2"></div>
        </lit-provider>
      </div>
    `
    grandfatherEl = document.getElementById('grandfather')
    parentEl = document.getElementById('parent')
  })

  describe('with providedContext property declaration', () => {
    test('should provide contexts to child element', async () => {
      expect(parentEl.propertyContext).toBe('test')
      expect(parentEl.myProp).toBe('xxx')
    })

    test('should update contexts in child element when updating providedContext property', async () => {
      grandfatherEl.myProp = 2
      grandfatherEl.myOtherProp = 'zzz'
      expect(parentEl.propertyContext).toBe(2)
      expect(parentEl.myProp).toBe('zzz')
    })
  })
})

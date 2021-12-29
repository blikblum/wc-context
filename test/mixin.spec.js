/* eslint-env jest */
import { LitElement } from 'lit'
import { withContext } from '../wc-context'

const Component = withContext(HTMLElement)
const LitComponent = withContext(LitElement)

class ProviderComponent extends Component {
  static providedContexts = {
    valueContext: { value: 'value' },
    propertyContext: { property: 'myProp' },
    shorthandContext: 'myOtherProp',
  }

  myProp = 'test'
  myOtherProp = 'xxx'
}

class ConsumerComponent extends Component {
  static observedContexts = [
    'valueContext',
    'propertyContext',
    'shorthandContext',
    ['propertyContext', 'localPropertyContext'],
  ]
}

class LitConsumerComponent extends LitComponent {
  static observedContexts = [
    'valueContext',
    'propertyContext',
    'shorthandContext',
    ['propertyContext', 'localPropertyContext'],
  ]
}

customElements.define('vanilla-component', Component)
customElements.define('vanilla-provider', ProviderComponent)
customElements.define('vanilla-consumer', ConsumerComponent)
customElements.define('lit-vanilla-consumer', LitConsumerComponent)

// unable to create custom elements with jsdom
describe('withContext', () => {
  let grandfatherEl
  let parentEl
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <vanilla-provider id="grandfather">
          <vanilla-consumer id="parent"></vanilla-consumer>
          <div id="parent2"></div>
          <lit-vanilla-consumer></lit-vanilla-consumer>
        </vanilla-provider>
      </div>
    `
    grandfatherEl = document.getElementById('grandfather')
    parentEl = document.getElementById('parent')
  })

  test('should define a updatContext method in element', () => {
    const el = new Component()
    expect(el.updateContext).toBeInstanceOf(Function)
  })

  describe('with providedContexts static property', () => {
    test('should provide contexts to child vanilla component', async () => {
      expect(parentEl.valueContext).toBe('value')
      expect(parentEl.propertyContext).toBe('test')
      expect(parentEl.shorthandContext).toBe('xxx')
      expect(parentEl.localPropertyContext).toBe('test')
    })

    test('should provide contexts to child LitElement component', async () => {
      const litEl = document.querySelector('lit-vanilla-consumer')
      expect(litEl.valueContext).toBe('value')
      expect(litEl.propertyContext).toBe('test')
      expect(litEl.shorthandContext).toBe('xxx')
      expect(litEl.localPropertyContext).toBe('test')
    })

    test('should update contexts in child element when calling updateContext', async () => {
      grandfatherEl.updateContext('valueContext', 1)
      expect(parentEl.valueContext).toBe(1)
      grandfatherEl.myOtherProp = 3
      grandfatherEl.updateContext('shorthandContext')
      expect(parentEl.shorthandContext).toBe(3)
    })
  })
})

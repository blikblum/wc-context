/* eslint-env jest */
import { withContext } from '../wc-context'

const Component = withContext(HTMLElement)

const ProviderComponent = class extends Component {
  static providedContexts = {
    valueContext: { value: 'value' },
    propertyContext: { property: 'myProp' },
    shorthandContext: 'myOtherProp',
  }

  myProp = 'test'
  myOtherProp = 'xxx'
}

const ConsumerComponent = class extends Component {
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
        </vanilla-provider>
      </div>
    `
    grandfatherEl = document.getElementById('grandfather')
    parentEl = document.getElementById('parent')
  })

  test('should define a updateProvidedContext method in element', () => {
    const el = new Component()
    expect(el.updateProvidedContext).toBeInstanceOf(Function)
  })

  describe('with providedContexts static property', () => {
    test('should provide contexts to child element', async () => {
      expect(parentEl.valueContext).toBe('value')
      expect(parentEl.propertyContext).toBe('test')
      expect(parentEl.shorthandContext).toBe('xxx')
      expect(parentEl.localPropertyContext).toBe('test')
    })

    test('should update contexts in child element when calling updateProvidedContext', async () => {
      grandfatherEl.updateProvidedContext('valueContext', 1)
      expect(parentEl.valueContext).toBe(1)
    })
  })
})

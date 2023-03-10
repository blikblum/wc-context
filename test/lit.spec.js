/* eslint-env jest */
import { withContext, contextProvider } from 'wc-context/lit'
import { LitElement, html, render } from 'lit'

const Component = withContext(LitElement)

class ProviderComponent extends Component {
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

class ConsumerComponent extends Component {
  static properties = {
    myProp: { context: 'otherContext' },
  }

  static observedContexts = ['propertyContext']
}

class ConsumerOnlyDecoratorComponent extends Component {
  static properties = {
    myProp: { context: 'otherContext' },
  }
}

class NestedComponent extends Component {
  static properties = {
    myProp: { providedContext: 'propertyContext' },
  }

  constructor() {
    super()
    this.myProp = 'test'
  }

  get consumerEl() {
    return this.renderRoot.querySelector('lit-consumer')
  }

  render() {
    return html`<lit-consumer></lit-consumer>`
  }
}

customElements.define('lit-component', Component)
customElements.define('lit-provider', ProviderComponent)
customElements.define('lit-consumer', ConsumerComponent)
customElements.define('lit-consumer2', ConsumerOnlyDecoratorComponent)
customElements.define('lit-nested', NestedComponent)

// unable to create custom elements with jsdom
describe('withContext', () => {
  let grandfatherEl
  let parentEl
  let parent3El
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <lit-provider id="grandfather">
          <lit-consumer id="parent"></lit-consumer>
          <lit-consumer2 id="parent3"></lit-consumer2>
          <div id="parent2"></div>
        </lit-provider>
        <lit-nested></lit-nested>
      </div>
      <div id="lit-root"></div>
    `
    grandfatherEl = document.getElementById('grandfather')
    parentEl = document.getElementById('parent')
    parent3El = document.getElementById('parent3')
  })

  describe('with providedContext property declaration', () => {
    test('should provide contexts to child element', async () => {
      expect(parentEl.propertyContext).toBe('test')
      expect(parentEl.myProp).toBe('xxx')
      expect(parent3El.myProp).toBe('xxx')
    })

    test('should provide contexts to child element inside shadow dom', async () => {
      const nestedEl = document.querySelector('lit-nested')
      await nestedEl.updateComplete
      expect(nestedEl.consumerEl.propertyContext).toBe('test')
    })

    test('should update contexts in child element when updating providedContext property', async () => {
      grandfatherEl.myProp = 2
      grandfatherEl.myOtherProp = 'zzz'
      expect(parentEl.propertyContext).toBe(2)
      expect(parentEl.myProp).toBe('zzz')
    })
  })
})

function contextProviderTemplate(value) {
  return html`<div ${contextProvider(
    'propertyContext',
    value
  )}><div><lit-consumer></lit-consumer></div></div></div>`
}

describe('contextProvider', () => {
  it('should provide context to child nodes', () => {
    const litRoot = document.getElementById('lit-root')
    render(contextProviderTemplate(2), litRoot)
    const consumer = litRoot.querySelector('lit-consumer')
    expect(consumer.propertyContext).toBe(2)
    expect(consumer.myProp).toBe(undefined)

    // update with same value
    render(contextProviderTemplate(2), litRoot)
    expect(consumer.propertyContext).toBe(2)

    render(contextProviderTemplate(10), litRoot)
    expect(consumer.propertyContext).toBe(10)
  })
})

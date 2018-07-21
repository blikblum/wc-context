/* eslint-env jest */
import { withContext } from '../src/index'
import { defineContextProp, addContext, unobserveContext } from '../src/core'

const Component = withContext(HTMLElement)

// unable to create custom elements with jsdom
describe.skip('withContext', () => {
  let rootEl
  let grandfatherEl
  let childEl
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <div id="grandfather">
          <div id="parent">
            <div id="child"></div>
          </div>
          <div id="parent2">
            <div id="child2"></div>
          </div>
        </div>
      </div>
    `
    rootEl = document.getElementById('root')
    grandfatherEl = document.getElementById('grandfather')
    childEl = document.getElementById('child')
  })

  test('should define a context property in element', () => {
    const el = new Component()
    expect(el.context).toBeDefined()
  })

  describe('with childContext static property', () => {
    let el
    const WithChildContext = class extends Component {}
    WithChildContext.childContext = {
      key: 'value'
    }

    beforeEach(() => {
      el = new WithChildContext()
      el.appendChild(grandfatherEl)
      rootEl.appendChild(el)
    })

    test('should configure a context', () => {
      defineContextProp(childEl, 'context')
      expect(childEl.context.key).toBe('value')
    })
  })
})

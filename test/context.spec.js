/* eslint-env jest */
import { defineContextProp, addContext, removeContext } from '../src/context'

describe('context', () => {
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
        <div id="grandfather2">
          <div id="parent3">
            <div id="child3"></div>
          </div>
        </div>
      </div>
    `
  })

  describe('when added to a node', () => {
    let rootEl
    let grandfatherEl
    let grandfather2El
    let parentEl
    let childEl
    let child3El

    beforeEach(() => {
      rootEl = document.getElementById('root')
      grandfatherEl = document.getElementById('grandfather')
      grandfather2El = document.getElementById('grandfather2')
      parentEl = document.getElementById('parent')
      childEl = document.getElementById('child')
      child3El = document.getElementById('child3')
      addContext(grandfatherEl, 'key', 'value')
    })

    afterEach(() => {
      removeContext(grandfatherEl, 'key')
    })

    test('should be acessible in all children nodes', () => {
      defineContextProp(parentEl, 'context')
      defineContextProp(childEl, 'context')
      expect(parentEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
    })

    test('should not be acessible after removed', () => {
      defineContextProp(childEl, 'context')
      removeContext(grandfatherEl, 'key')
      expect(childEl.context.key).toBeUndefined()
    })

    test('should not be acessible in parent nodes', () => {
      defineContextProp(rootEl, 'context')
      expect(rootEl.context.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      defineContextProp(grandfather2El, 'context')
      defineContextProp(child3El, 'context')
      expect(grandfather2El.context.key).toBeUndefined()
      expect(child3El.context.key).toBeUndefined()
    })

    test('should return same value when called repeatedly', () => {
      defineContextProp(childEl, 'context')
      expect(childEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
    })

    describe('and when added to a child node', () => {
      beforeEach(() => {
        addContext(parentEl, 'key', 'value2')
      })

      afterEach(() => {
        removeContext(parentEl, 'key')
      })

      test('should override parent context', () => {
        defineContextProp(childEl, 'context')
        expect(childEl.context.key).toBe('value2')
      })
    })

    describe('and when added to a child node with different key', () => {
      beforeEach(() => {
        addContext(parentEl, 'key2', 'value2')
      })

      afterEach(() => {
        removeContext(parentEl, 'key2')
      })

      test('should not override parent context', () => {
        defineContextProp(childEl, 'context')
        expect(childEl.context.key).toBe('value')
      })
    })

    describe('and when added to a sibling node', () => {
      beforeEach(() => {
        addContext(grandfather2El, 'key', 'value2')
      })

      afterEach(() => {
        removeContext(grandfather2El, 'key')
      })

      test('should keep independent values', () => {
        defineContextProp(childEl, 'context')
        defineContextProp(child3El, 'context')
        expect(childEl.context.key).toBe('value')
        expect(child3El.context.key).toBe('value2')
      })
    })

    describe('with a function as value', () => {
      let fn = jest.fn().mockReturnThis()
      beforeEach(() => {
        addContext(parentEl, 'key2', fn)
      })

      afterEach(() => {
        removeContext(parentEl, 'key2')
      })

      test('should call the function with el as this', () => {
        defineContextProp(childEl, 'context')
        expect(childEl.context.key2).toBe(parentEl)
        expect(fn).toHaveBeenCalledTimes(1)
      })
    })
  })
})

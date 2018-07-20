/* eslint-env jest */
import { defineContextProp, addChildContext, removeChildContext, observeContext, updateContext, defineChildContextProp } from '../src/context'

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
      defineChildContextProp(grandfatherEl, 'childContext')
      addChildContext(grandfatherEl, 'key', 'value')
    })

    afterEach(() => {
      removeChildContext(grandfatherEl, 'key')
    })

    test('should be acessible in all children nodes', () => {
      defineContextProp(parentEl, 'context')
      observeContext(parentEl, 'key')
      defineContextProp(childEl, 'context')
      observeContext(childEl, 'key')
      expect(parentEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
    })

    test('should not be acessible after removed', () => {
      defineContextProp(childEl, 'context')
      observeContext(childEl, 'key')
      removeChildContext(grandfatherEl, 'key')
      expect(childEl.context.key).toBeUndefined()
    })

    test('should not be acessible in parent nodes', () => {
      defineContextProp(rootEl, 'context')
      observeContext(rootEl, 'key')
      expect(rootEl.context.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      defineContextProp(grandfather2El, 'context')
      observeContext(grandfather2El, 'key')
      defineContextProp(child3El, 'context')
      observeContext(child3El, 'key')
      expect(grandfather2El.context.key).toBeUndefined()
      expect(child3El.context.key).toBeUndefined()
    })

    test('should return same value when called repeatedly', () => {
      defineContextProp(childEl, 'context')
      observeContext(childEl, 'key')
      expect(childEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
      expect(childEl.context.key).toBe('value')
    })

    describe('and when added to a child node', () => {
      beforeEach(() => {
        defineChildContextProp(parentEl, 'childContext')
        addChildContext(parentEl, 'key', 'value2')
      })

      afterEach(() => {
        removeChildContext(parentEl, 'key')
      })

      test('should override parent context', () => {
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
        expect(childEl.context.key).toBe('value2')
      })
    })

    describe('and when added to a child node with different key', () => {
      beforeEach(() => {
        defineChildContextProp(parentEl, 'childContext')
        addChildContext(parentEl, 'key2', 'value2')
      })

      afterEach(() => {
        removeChildContext(parentEl, 'key2')
      })

      test('should not override parent context', () => {
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
        expect(childEl.context.key).toBe('value')
      })
    })

    describe('and when added to a sibling node', () => {
      beforeEach(() => {
        defineChildContextProp(grandfather2El, 'childContext')
        addChildContext(grandfather2El, 'key', 'value2')
      })

      afterEach(() => {
        removeChildContext(grandfather2El, 'key')
      })

      test('should keep independent values', () => {
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
        defineContextProp(child3El, 'context')
        observeContext(child3El, 'key')
        expect(childEl.context.key).toBe('value')
        expect(child3El.context.key).toBe('value2')
      })
    })

    describe('and observed by a child node', () => {
      let callback
      beforeEach(() => {
        callback = jest.fn()
        childEl.contextChangedCallback = callback
        defineContextProp(childEl, 'context')
        observeContext(childEl, 'key')
      })

      test('should notify the observer when context is updated', () => {
        updateContext(grandfatherEl, 'key', 'value2')
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('key', 'value', 'value2')
      })
    })
  })
})

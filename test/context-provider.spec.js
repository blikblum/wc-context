/* eslint-env jest */
import {
  registerContext,
  observeContext,
  unobserveContext,
  createContext,
} from '../core'

import '../context-provider.js'

describe('context-provider', () => {
  let rootEl
  let grandfatherEl
  let grandfather2El
  let grandfather3El
  let parentEl
  let childEl
  let child3El
  let child4El

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <context-provider id="grandfather">
          <div id="parent">
            <div id="child"></div>
          </div>
          <div id="parent2">
            <div id="child2"></div>
          </div>
        </context-provider>
        <context-provider id="grandfather2" context="key" value="value2">
          <div id="parent3">
            <div id="child3"></div>
          </div>
        </context-provider>
        <div id="grandfather3">
          <div id="parent4">
            <div id="child4"></div>
          </div>
        </div>
      </div>
    `
    rootEl = document.getElementById('root')
    grandfatherEl = document.getElementById('grandfather')
    grandfather2El = document.getElementById('grandfather2')
    grandfather3El = document.getElementById('grandfather3')
    parentEl = document.getElementById('parent')
    childEl = document.getElementById('child')
    child3El = document.getElementById('child3')
    child4El = document.getElementById('child4')
  })

  describe('when using a string as context key', () => {
    beforeEach(() => {
      grandfatherEl.context = 'key'
      grandfatherEl.value = 'value'
    })

    test('should be acessible in all children nodes', () => {
      observeContext(parentEl, 'key')
      observeContext(childEl, 'key')
      expect(parentEl.key).toBe('value')
      expect(childEl.key).toBe('value')
    })

    test('should not be acessible in parent nodes', () => {
      observeContext(rootEl, 'key')
      expect(rootEl.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      observeContext(grandfather2El, 'key')
      observeContext(child3El, 'key')
      expect(grandfather3El.key).toBeUndefined()
      expect(child4El.key).toBeUndefined()
    })

    test('should return same value when called repeatedly', () => {
      observeContext(childEl, 'key')
      expect(childEl.key).toBe('value')
      expect(childEl.key).toBe('value')
      expect(childEl.key).toBe('value')
    })

    it('should allow to update the context using value property', () => {
      observeContext(parentEl, 'key')
      grandfatherEl.value = 'value2'
      expect(parentEl.key).toBe('value2')
    })

    describe('and have a sibling component ', () => {
      test('should keep independent values', () => {
        observeContext(childEl, 'key')
        observeContext(child3El, 'key')
        expect(childEl.key).toBe('value')
        expect(child3El.key).toBe('value2')
      })
    })

    describe('and context is updated after unobserved', () => {
      beforeEach(() => {
        observeContext(parentEl, 'key')
        unobserveContext(parentEl, 'key')
        parentEl.key = 'none'
        grandfatherEl.value = 'value2'
      })
      it('should not update the observer context value', () => {
        expect(parentEl.key).toBe('none')
      })
    })

    describe('and observed by a child node after context is updated', () => {
      beforeEach(() => {
        grandfatherEl.value = 'value2'
        observeContext(parentEl, 'key')
      })
      it('should provide updated value', () => {
        expect(parentEl.key).toBe('value2')
      })
    })

    describe('and observed by a child node', () => {
      let callback
      beforeEach(() => {
        callback = jest.fn()
        childEl.contextChangedCallback = callback
        observeContext(childEl, 'key')
      })

      test('should call contextChangedCallback in the observer', () => {
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('key', undefined, 'value')
      })

      test('should call contextChangedCallback when context is updated', () => {
        callback.mockClear()
        grandfatherEl.value = 'value2'
        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenCalledWith('key', 'value', 'value2')
      })

      test('should not call contextChangedCallback when context is updated with same value', () => {
        callback.mockClear()
        grandfatherEl.value = 'value'
        expect(callback).not.toHaveBeenCalled()
      })
    })
  })

  describe('when using identifier returned by createContext as key', () => {
    let ctx
    beforeEach(() => {
      ctx = createContext('myContext')
      grandfatherEl.context = ctx
      grandfatherEl.value = 'value'
    })

    test('should be acessible in all children nodes', () => {
      observeContext(parentEl, ctx, 'key')
      observeContext(childEl, ctx, 'key')
      expect(parentEl.key).toBe('value')
      expect(childEl.key).toBe('value')
    })

    test('should not be acessible in parent nodes', () => {
      observeContext(rootEl, ctx, 'key')

      expect(rootEl.key).toBeUndefined()
    })

    test('should not be acessible in sibling nodes', () => {
      observeContext(grandfather2El, ctx, 'key')

      observeContext(child3El, ctx, 'key')
      expect(grandfather2El.key).toBeUndefined()
      expect(child3El.key).toBeUndefined()
    })

    describe('and registered to a child node with different identifier', () => {
      let ctx2
      beforeEach(() => {
        ctx2 = createContext('myContext')
        registerContext(parentEl, ctx2, 'value2')
      })

      test('should not override parent context', () => {
        observeContext(childEl, ctx, 'key')
        expect(childEl.key).toBe('value')
      })
    })
  })
})

import withLit from '@skatejs/renderer-lit-html/dist/esnext'
import { withUpdate, withRenderer } from 'skatejs/dist/esnext'
import { withContext } from 'wc-context/skatejs'

const Component = withLit(withContext(withUpdate(withRenderer(HTMLElement))))

export { Component }

import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter'
import Element from '@skatejs/element-lit-html'
import { withContext } from 'wc-context/skatejs'

const Component = withContext(Element)

export { Component }

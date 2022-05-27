# wc-context

wc-context is a Javascript library that implements a way to share data between Web Components (in fact, between any HTMLElement). While is inspired by React Context, hence the name, it is designed to fit the most common usage patterns in Web Components ecosystem.

## Features

### Small and fast

The code base is small and fast, just a thin layer on top of native events. No Internet Explorer support, avoiding meaningless extra code.

### Flexible and comprehensive

It is possible to define context providers and consumers in many ways: Lit integration, Web Component mixin, Reactive Controllers, Dedicated elements and Core API. All compatible with each other, allowing to mix and match in same project.

Also, does not limit how can be used:

- Ability to provide or consume one or more contexts per element
- Context can be provided or consumed by any HTML element
- Context can be identified by string or unique identifier

### Works with Shadow DOM

&nbsp; &nbsp; ✓ Works with shadow dom and slotted content (handles timing issues)<br>
&nbsp; &nbsp; ✓ Easy to implement unit tests. Most of the time, same as components without context<br>
&nbsp; &nbsp; ✓ Builtin integration with LitElement<br>
&nbsp; &nbsp; ✓ Builtin ContextProvider ([Reactive Controller](https://lit.dev/docs/composition/controllers/)) with primitives for lazy loading<br>
&nbsp; &nbsp; ✓ Builtin context-provider and context-consumer elements<br>

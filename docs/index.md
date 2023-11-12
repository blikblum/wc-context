# wc-context

wc-context is a Javascript library that implements a way to share data between Web Components (in fact, between any HTMLElement). While is inspired by React Context, hence the name, it is designed to fit the most common usage patterns in Web Components ecosystem.

## Features

### Small and fast

The code base is small and fast, just a thin layer on top of native events. No Internet Explorer support, avoiding meaningless extra code.

### Flexible and comprehensive

It is possible to define context providers and consumers in many ways: Lit integration, Web Component mixin, Reactive Controllers, Dedicated elements and core API. All compatible with each other, allowing to mix and match in same project.

Also, does not limit how can be used:

- Ability to provide or consume one or more contexts per element
- Context can be provided or consumed by any HTML element
- Context can be identified by string or unique identifier

### Compatible

Conforms with the [Context protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md)

### Works with Shadow DOM

The context can ben consumed in any level of child node tree regardless of shadow dom boundaries.

It also handles the timing issue when consuming a context inside a slotted content

### Easy to implement unit tests

Most of the time there's no need of special handling to write unit tests. Just set the property that should receive the context value.

When the context is deep in the node tree or are not linked to a property use Lit `contextProvider` directive or the [core API](./testing.md#context-consumed-with-controllerdedicated-elements)

### Lazy loading context data

With `ContextProvider` ([Reactive Controller](https://lit.dev/docs/composition/controllers/)) is possible to implement [data lazy loading](./controllers.md#subclassing-contextprovider).

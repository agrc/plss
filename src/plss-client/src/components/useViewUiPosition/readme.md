# @agrc/use-view-ui-position

[![NPM version](https://badgen.net/npm/v/@agrc/use-view-ui-position)](https://www.npmjs.com/package/@agrc/use-view-ui-position)

React hook for positioning a component in an esri view.

Install with [npm](https://www.npmjs.com/)

```bash
# via npm
npm install @agrc/use-view-ui-position --save
```

## Component properties

```js
{
  view: PropTypes.object.isRequired,
  position: PropTypes.oneOf(['bottom-leading','bottom-left','bottom-right','bottom-trailing','top-leading','top-left','top-right','top-trailing','manual']),
};
```

### Defaults

```js
{
  position: 'top-right'
}
```

## Usage

```js
import * as React from 'react';
import useViewUiPosition from '@agrc/use-view-ui-position';

export default function PlacedInViewUi({ view }) {
  const me = useViewUiPosition(view, 'top-left');

  return <div ref={me}>Hi</div>;
}
```

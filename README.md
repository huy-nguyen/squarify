# Squarify
This package is a TypeScript implementation (with transpiled JavaScript) of [Bruls _et al._'s squarified treemap algorithm](https://graphics.ethz.ch/teaching/scivis_common/Literature/squarifiedTreeMaps.pdf).

Unlike other JavaScript implementations, it is written in clear, readable code and backed up by unit tests (99.2% coverage).

As a strong believer in composable software, I deliberately made this package minimal. It only performs the layout step. You are free to use the output to render whichever way you want.

[![npm](https://img.shields.io/npm/v/squarify.svg?style=flat-square)](https://www.npmjs.com/package/squarify)

## Installation

`npm install --save squarify`

## Usage

### Input
The default `export` of this package is a function that expects two parameters:
- An array of input `data`. It's a recursive data structure where each element has this shape:
```ts
type Input<Custom> = {
    value: number;
    children?: Input<Custom>[];
} & Custom;
```
where `Custom` describes the type of any extra data the user wants to attach to each node. This data will be passed through to the result.
  - `value` must be provided. The sum of the `value` of a node's leaves must equal the `value` of the node itself. At every level of nesting of `data`, all array items must be already sorted in descending `value` order.
  - `children` is optional and indicates whether a datum is a node (`children` is an array) or a leaf (`children` is `undefined`).
  - Your data also shouldn't contain the property `normalizedValue` because it is used internally by the package.

- A rectangle that this algorithm will try to fit the tree map into. It should be specified as an object with this shape:
```ts
interface Container {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}
```
where (`x0`, `y0`) and (`x1`, `y1`) are the coordinates of the top-left and bottom-right corners of the rectangle, respectively (`x` increases going rightward and `y` increases going downward on the page).

### Output
The output is an array of layout rectangles. Each rectangle has this shape:
```ts
interface Result {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  value: number,
  normalizedValue: number
} & Custom
```
where
  - `x0`, `y0`, `x1`, `y1` are the coordinates of the top-left and bottom-right corners of the rectangle.
  - `normalizedValue` is a value used internally, which you can ignore.
  - `value` is the same one from the original input data.
  - Any extra properties in the input are passed through to this rectangle. Also note that the algorithm also flatten the output such that only leaves in the original data will appear in the output.

### Sample input
This is sample usage in a TypeScript file:
```ts
import squarify, {
  Input
} from 'squarify'

interface Custom {
  name: string;
  color: string;
}
const data: Input<Custom>[] = [{
  name: 'Azura', value: 6, color: 'red',
}, {
  name: 'Seth', value: 5, color: '',
  children: [
    {
      name: 'Noam', value: 3, color: 'orange',
    },
    {
      name: 'Enos', value: 2, color: 'yellow',
    },
  ]
}, {
  name: 'Awan', value: 5, color: '',
  children: [{
      name: 'Enoch', value: 5, color: 'green',
  }]
}, {
  name: 'Abel', value: 4, color: 'blue',
}, {
  name: 'Cain', value: 1, color: 'indigo',
}];

const container = {x0: 0, y0: 0, x1: 100, y1: 50};

const output = squarify<Custom>(data, container);
```

This is a sample in JavaScript:
```js
import squarify from 'squarify'
// Or `const squarify = require('squarify')` in NodeJS.

const data = [{
  name: 'Azura', value: 6, color: 'red',
}, {
  name: 'Seth', value: 5, color: '',
  children: [
    {
      name: 'Noam', value: 3, color: 'orange',
    },
    {
      name: 'Enos', value: 2, color: 'yellow',
    },
  ]
}, {
  name: 'Awan', value: 5, color: '',
  children: [{
      name: 'Enoch', value: 5, color: 'green',
  }]
}, {
  name: 'Abel', value: 4, color: 'blue',
}, {
  name: 'Cain', value: 1, color: 'indigo',
}];

const container = {x0: 0, y0: 0, x1: 100, y1: 50};

const output = squarify(data, container);
```
### Sample output
The output looks like:

```js
[
  {x0: 0, y0: 0, x1: 41.66, y1: 35, name: 'Noam', value: 3, color: 'orange'},
  {x0: 0, y0: 35, x1: 41.66, y1: 50, name: 'Enos', value: 2, color: 'yellow'},
  {x0: 41.66, y0: 0, x1: 70.83, y1: 50, name: 'Abel', value: 4, color: 'blue'},
  {x0: 70.83, y0: 0, x1: 100, y1: 28.57, name: 'Azura', value: 6, color: 'red'},
  {x0: 70.83, y0: 0, x1: 90.27, y1: 50, name: 'Enoch', value: 5, color: 'green'},
  {x0: 90.27, y0: 28.57, x1: 100, y1: 50, name: 'Cain', value: 1, color: 'indigo'}  
]
```

## Contributing
Please see the [contributing guide](CONTRIBUTING.md) if you are interested in helping.

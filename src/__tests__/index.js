import entry, {
  calculateMaxAspectRatio,
  doesAddingToRowImproveAspectRatio,
  normalizeData,
  getCoordinates,
  cutArea,
  squarify,
  recurse,
} from '../index';

// Create an on-the-fly custom matcher for floating point comparison.
// Can be used anywhere in place of a number. Second argument is optional.
// Usage: `expect(2.001).toEqual(approx(2, 2))`
// https://jasmine.github.io/edge/introduction#section-Custom_asymmetric_equality_tester
export const approx = (expected, precision = 2) => ({
  asymmetricMatch: actual => Math.abs(expected - actual) < Math.pow(10, -precision) / 2,
});

test('calculateMaxAspectRatio', () => {
  // Taken from original paper:
  expect(calculateMaxAspectRatio([
    {normalizedValue: 6}, {normalizedValue: 6}, {normalizedValue: 4},
    {normalizedValue: 3}, {normalizedValue: 2}, {normalizedValue: 2}, {normalizedValue: 1},
  ], 6)).toBe(16);
  expect(calculateMaxAspectRatio([
    {normalizedValue: 6}, {normalizedValue: 6}, {normalizedValue: 4},
    {normalizedValue: 3}, {normalizedValue: 2}, {normalizedValue: 2}, {normalizedValue: 1},
  ], 4)).toBe(36);
});

test('doesAddingToRowImproveAspectRatio', () => {
  // From original paper:
  expect(doesAddingToRowImproveAspectRatio(
    [], {normalizedValue: 6}, 6)
  ).toBe(true);
  expect(doesAddingToRowImproveAspectRatio(
    [{normalizedValue: 6}], {normalizedValue: 6}, 4)
  ).toBe(true);
  expect(doesAddingToRowImproveAspectRatio(
    [{normalizedValue: 6}, {normalizedValue: 6}], {normalizedValue: 4}, 4)
  ).toBe(false);
});

test('normalizeData', () => {
  const array = [
    {value: 12}, {value: 12}, {value: 8},
    {value: 6}, {value: 4}, {value: 4},
    {value: 2},
  ];
  expect(normalizeData(array, 24)).toEqual([
    {value: 12, normalizedValue: 6}, {value: 12, normalizedValue: 6}, {value: 8, normalizedValue: 4},
    {value: 6, normalizedValue: 3}, {value: 4, normalizedValue: 2}, {value: 4, normalizedValue: 2},
    {value: 2, normalizedValue: 1},
  ]);
});

describe('getCoordinates', () => {
  test('width > height', () => {
    expect(getCoordinates(
      [{normalizedValue: 30, id: 1}, {normalizedValue: 20, id: 2}, {normalizedValue: 10, id: 3}],
      {x0: 0, y0: 0, x1: 10, y1: 6}
      // {width: 10, height: 6, xOffset: 0, yOffset: 0}
    )).toEqual([
      {x0: 0, y0: 0, x1: 10, y1: 3, normalizedValue: 30, id: 1 },
      {x0: 0, y0: 3, x1: 10, y1: 5, normalizedValue: 20, id: 2},
      {x0: 0, y0: 5, x1: 10, y1: 6, normalizedValue: 10, id: 3},
    ]);
    expect(getCoordinates(
      [{normalizedValue: 30, id: 1}, {normalizedValue: 20, id: 2}, {normalizedValue: 10, id: 3}],
      {x0: 3, y0: 1, x1: 13, y1: 7},
    )).toEqual([
      {x0: 3, y0: 1, x1: 13, y1: 4, normalizedValue: 30, id: 1 },
      {x0: 3, y0: 4, x1: 13, y1: 6, normalizedValue: 20, id: 2},
      {x0: 3, y0: 6, x1: 13, y1: 7, normalizedValue: 10, id: 3},
    ]);
  });
  test('height > width', () => {
    expect(getCoordinates(
      [{normalizedValue: 30, id: 1}, {normalizedValue: 20, id: 2}, {normalizedValue: 10, id: 3}],
      {x0: 0, y0: 0, x1: 6, y1: 10},
    )).toEqual([
      {x0: 0, y0: 0, x1: 3, y1: 10, normalizedValue: 30, id: 1 },
      {x0: 3, y0: 0, x1: 5, y1: 10, normalizedValue: 20, id: 2},
      {x0: 5, y0: 0, x1: 6, y1: 10, normalizedValue: 10, id: 3},
    ]);
  });
});

describe('cutArea', () => {
  test('Normal', () => {
    // First step in paper's example: putting the value 6
    // into a 6x4 rectangle.
    const actual1 = cutArea({
      x0: 0, y0: 0, x1: 6, y1: 4,
      // width: 6, height: 4, xOffset: 0, yOffset: 0,
    }, 6);
    expect(actual1).toEqual({
      x0: 1.5, y0: 0, x1: 6, y1: 4,
    });
    // TODO: add more steps.
  });

  test('Empty area', () => {
    // First step in paper's example: putting the value 6
    // into a 6x4 rectangle.
    const actual1 = cutArea({
      x0: 0, y0: 0, x1: 6, y1: 4,
    }, 0);
    expect(actual1).toEqual({
      x0: 0, y0: 0, x1: 6, y1: 4,
    });
    // TODO: add more steps.
  });
});


describe('squarify', () => {
  test('Original paper example', () => {
    const actual = squarify(
      [{normalizedValue: 6, id: 1}, {normalizedValue: 6, id: 2}, {normalizedValue: 4, id: 3},
        {normalizedValue: 3, id: 4}, {normalizedValue: 2, id: 5}, {normalizedValue: 2, id: 6},
        {normalizedValue: 1, id: 7}],
      [],
      {x0: 0, y0: 0, x1: 6, y1: 4},
      []
    );
    expect(actual).toEqual([
      {x0: 0, y0: 0, x1: 3, y1: 2, normalizedValue: 6, id: 1},
      {x0: 0, y0: 2, x1: 3, y1: 4, normalizedValue: 6, id: 2},
      {x0: 3, y0: 0, x1: approx(4.71), y1: approx(2.33), normalizedValue: 4, id: 3},
      {x0: approx(4.71), y0: 0, x1: approx(6), y1: approx(2.33), normalizedValue: 3, id: 4},
      {x0: 3, y0: approx(2.33), x1: 4.2, y1: 4, normalizedValue: 2, id: 5},
      {x0: 4.2, y0: approx(2.33), x1: 5.4, y1: 4, normalizedValue: 2, id: 6},
      {x0: 5.4, y0: approx(2.33), x1: approx(6), y1: approx(4), normalizedValue: 1, id: 7},
    ]);
  });
});

describe('recurse', () => {
  test('Original paper example', () => {
    const datum = {
      x0: 0, y0: 0, x1: 6, y1: 4,
      children: [
        {value: 6, id: 1},
        {value: 6, id: 2},
        {value: 4, id: 3},
        {value: 3, id: 4},
        {value: 2, id: 5},
        {value: 2, id: 6},
        {value: 1, id: 7},
      ],
    };
    const actual = recurse(datum);
    expect(actual).toEqual([
      {x0: 0, y0: 0, x1: 3, y1: 2, value: 6, normalizedValue: 6, id: 1},
      {x0: 0, y0: 2, x1: 3, y1: 4, value: 6, normalizedValue: 6, id: 2},
      {x0: 3, y0: 0, x1: approx(4.71), y1: approx(2.33), value: 4, normalizedValue: 4, id: 3},
      {x0: approx(4.71), y0: 0, x1: approx(6), y1: approx(2.33), value: 3, normalizedValue: 3, id: 4},
      {x0: 3, y0: approx(2.33), x1: 4.2, y1: 4, value: 2, normalizedValue: 2, id: 5},
      {x0: 4.2, y0: approx(2.33), x1: 5.4, y1: 4, value: 2, normalizedValue: 2, id: 6},
      {x0: 5.4, y0: approx(2.33), x1: approx(6), y1: approx(4), value: 1, normalizedValue: 1, id: 7},
    ]);
  });


  test('Should flatten nested data', () => {
    const datum = {
      x0: 0, y0: 0, x1: 6, y1: 4,
      children: [
        {
          value: 12, id: 1,
          children: [
            {value: 6, id: 8},
            {value: 4, id: 9},
            {value: 2, id: 10},
          ],
        },
        {value: 12, id: 2},
        {value: 8, id: 3},
        {value: 6, id: 4},
        {value: 4, id: 5},
        {value: 4, id: 6},
        {value: 2, id: 7},
      ],
    };
    const actual = recurse(datum);
    expect(actual).toEqual([
      // Children of `id` 1:
      {x0: 0, y0: 0, x1: 1.5, y1: 2, value: 6, normalizedValue: 3, id: 8},
      {x0: 1.5, y0: 0, x1: 3, y1: approx(1.33), value: 4, normalizedValue: 2, id: 9},
      {x0: 1.5, y0: approx(1.33), x1: 3, y1: 2, value: 2, normalizedValue: 1, id: 10},
      // The rest:
      {x0: 0, y0: 2, x1: 3, y1: 4, value: 12, normalizedValue: 6, id: 2},
      {x0: 3, y0: 0, x1: approx(4.71), y1: approx(2.33), value: 8, normalizedValue: 4, id: 3},
      {x0: approx(4.71), y0: 0, x1: approx(6), y1: approx(2.33), value: 6, normalizedValue: 3, id: 4},
      {x0: 3, y0: approx(2.33), x1: 4.2, y1: 4, value: 4, normalizedValue: 2, id: 5},
      {x0: 4.2, y0: approx(2.33), x1: 5.4, y1: 4, value: 4, normalizedValue: 2, id: 6},
      {x0: 5.4, y0: approx(2.33), x1: approx(6), y1: approx(4), value: 2, normalizedValue: 1, id: 7},
    ]);
  });
});

test('Package entry point', () => {
  const data = [
    {
      value: 12, id: 1,
      children: [
        {value: 6, id: 8},
        {value: 4, id: 9},
        {value: 2, id: 10},
      ],
    },
    {value: 12, id: 2},
    {value: 8, id: 3},
    {value: 6, id: 4},
    {value: 4, id: 5},
    {value: 4, id: 6},
    {value: 2, id: 7},
  ];
  const actual = entry(data, {x0: 0, y0: 0, x1: 6, y1: 4});
  const expected = [
    // Children of `id` 1:
    {x0: 0, y0: 0, x1: 1.5, y1: 2, value: 6, normalizedValue: 3, id: 8},
    {x0: 1.5, y0: 0, x1: 3, y1: approx(1.33), value: 4, normalizedValue: 2, id: 9},
    {x0: 1.5, y0: approx(1.33), x1: 3, y1: 2, value: 2, normalizedValue: 1, id: 10},
    // The rest:
    {x0: 0, y0: 2, x1: 3, y1: 4, value: 12, normalizedValue: 6, id: 2},
    {x0: 3, y0: 0, x1: approx(4.71), y1: approx(2.33), value: 8, normalizedValue: 4, id: 3},
    {x0: approx(4.71), y0: 0, x1: approx(6), y1: approx(2.33), value: 6, normalizedValue: 3, id: 4},
    {x0: 3, y0: approx(2.33), x1: 4.2, y1: 4, value: 4, normalizedValue: 2, id: 5},
    {x0: 4.2, y0: approx(2.33), x1: 5.4, y1: 4, value: 4, normalizedValue: 2, id: 6},
    {x0: 5.4, y0: approx(2.33), x1: approx(6), y1: approx(4), value: 2, normalizedValue: 1, id: 7},
  ];
  expect(actual).toEqual(expected);
});

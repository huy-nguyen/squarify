import * as _ from 'lodash';

export type IDatum<Custom> = {
  value: number
  children?: IDatum<Custom>[]
} & Custom

export type Input<Custom> = {
  value: number,
  children?: Input<Custom>[],
} & Custom;

export default function<Custom>(
  data: Input<Custom>[],
  container: {x0: number, y0: number, x1: number, y1: number}) {

  const {x0, y0, x1, y1} = container;
  const input = {
    x0, y0, x1, y1,
    children: data,
  } as ILayoutRect<Custom>;
  return recurse(input);
}

export type INormalizedDatum<Custom> = IDatum<Custom> & {
  // this is the value after going through `normalizeData` function
  normalizedValue: number
}
export interface IRect {
  // Top-left corner:
  x0: number,
  y0: number,
  // Bottom right corner:
  x1: number,
  y1: number,
}
export type ILayoutRect<T> = IRect & INormalizedDatum<T>;

// Calculate the max aspect ratio if a list of rectangles whose areas are contained in `row`
// are laid out against a line of length `length`:
export const calculateMaxAspectRatio = <Custom>(row: INormalizedDatum<Custom>[], length: number): number => {
  const allValues = row.map(({normalizedValue}) => normalizedValue);
  const minArea = _.min(allValues);
  const maxArea = _.max(allValues);
  if (minArea === undefined || maxArea === undefined) {
    throw new Error('Inpupt ' + row + ' is an empty array');
  }
  const sumArea = _.sum(allValues);

  const result = _.max([
    (length ** 2) * maxArea / (sumArea ** 2),
    (sumArea ** 2) / ((length ** 2) * minArea)
  ]) as number;
  return result;
}

export const doesAddingToRowImproveAspectRatio = <Custom>(currentRow: INormalizedDatum<Custom>[], nextDatum: INormalizedDatum<Custom>, length: number) => {
  if (currentRow.length === 0) {
    return true;
  } else {
    const newRow = [...currentRow, nextDatum];
    const currentMaxAspectRatio = calculateMaxAspectRatio(currentRow, length);
    const newMaxAspectRatio = calculateMaxAspectRatio(newRow, length);
    return (currentMaxAspectRatio >= newMaxAspectRatio);
  }
}

// Ensure that the sum of elements in `data` is equal to `area` (as per original algorithm):
export const normalizeData = <Custom>(data: IDatum<Custom>[], area: number): INormalizedDatum<Custom>[] => {
  const allValues = data.map(({value}) => value);
  const dataSum = _.sum(allValues);
  const multiplier = area / dataSum;
  // TODO: use spread/rest type instead of `Object.assign` when bug with rest/spread has been fixed.
  return data.map(datum => {
    const result: INormalizedDatum<Custom> = Object.assign({}, datum, {
      normalizedValue: datum.value * multiplier,
    })
    return result;
  })
}

interface IContainer {
  xOffset: number,
  yOffset: number,
  height: number,
  width: number
}

const containerToRect = ({xOffset, yOffset, width, height}: IContainer): IRect => ({
  x0: xOffset,
  y0: yOffset,
  x1: xOffset + width,
  y1: yOffset + height,
})

const rectToContainer = ({x0, y0, x1, y1}: IRect): IContainer => ({
  xOffset: x0,
  yOffset: y0,
  width: x1 - x0,
  height: y1 - y0
})

const getShortestEdge = (input: IRect) => {
  const {width, height} = rectToContainer(input)
  const result = _.min([width, height]) as number;
  return result;
}

// Lay the rectangles inside a `container` so that the rectangles stack on top of each other in the direction
// parallel to the width:
export const getCoordinates = <Custom>(row: INormalizedDatum<Custom>[], rect: IRect): ILayoutRect<Custom>[] => {

  const {width, height, xOffset, yOffset} = rectToContainer(rect);
  const allValues = row.map(({normalizedValue}) => normalizedValue);
  const areaWidth = _.sum(allValues) / height;
  const areaHeight = _.sum(allValues) / width;
  interface IAccumulator{
    subXOffset: number,
    subYOffset: number,
    coordinates: ILayoutRect<Custom>[]
  }
  const initialValue: IAccumulator = {subXOffset: xOffset, subYOffset: yOffset, coordinates: []}
  if (width >= height) {
    const {coordinates} = row.reduce<IAccumulator>(({subXOffset, subYOffset, coordinates}: IAccumulator, num: INormalizedDatum<Custom>) => {
      const y1 = subYOffset + num.normalizedValue / areaWidth;
      const rect: IRect = {
        x0: subXOffset,
        y0: subYOffset,
        x1: subXOffset + areaWidth,
        y1,
      }
      const nextCoordinate: ILayoutRect<Custom> = Object.assign({}, num, rect)
      return {
        subXOffset,
        subYOffset: y1,
        coordinates: [...coordinates, nextCoordinate],
      }
    }, initialValue)
    return coordinates;
  } else {

    const {coordinates} = row.reduce<IAccumulator>(({subXOffset, subYOffset, coordinates}: IAccumulator, num: INormalizedDatum<Custom>) => {
      const x1 = subXOffset + num.normalizedValue  / areaHeight;
      const rect: IRect = {
        x0: subXOffset,
        y0: subYOffset,
        x1,
        y1: subYOffset + areaHeight,
      }
      const nextCoordinate: ILayoutRect<Custom> = Object.assign({}, num, rect)
      return {
        subXOffset: x1,
        subYOffset,
        coordinates: [...coordinates, nextCoordinate],
      }
    }, initialValue)
    return coordinates;
  }
}

export const cutArea = (rect: IRect, area: number): IRect => {
  const {width, height, xOffset, yOffset} = rectToContainer(rect);
  if (width >= height) {
    const areaWidth = area / height;
    const newWidth = width - areaWidth;
    const container: IContainer = {
      xOffset: xOffset + areaWidth,
      yOffset,
      width: newWidth,
      height,
    }
    return containerToRect(container);
  } else {
    const areaHeight = area / width;
    const newHeight = height - areaHeight;
    const container: IContainer = {
      xOffset,
      yOffset: yOffset + areaHeight,
      width,
      height: newHeight,
    }
    return containerToRect(container);
  }
}

export const squarify = <Custom>(
  data: INormalizedDatum<Custom>[],
  currentRow: INormalizedDatum<Custom>[],
  rect: IRect,
  stack: ILayoutRect<Custom>[]): ILayoutRect<Custom>[] => {

  if (data.length === 0) {
    const newCoordinates = getCoordinates(currentRow, rect)
    const newStack = [...stack, ...newCoordinates];
    return newStack;
  }

  const width = getShortestEdge(rect);
  const [nextDatum, ...restData] = data;

  if (doesAddingToRowImproveAspectRatio(currentRow, nextDatum, width)) {
    const newRow = [...currentRow, nextDatum];
    return squarify(
      restData, newRow, rect, stack,
    )
  } else {
    const allValues = currentRow.map(({normalizedValue}) => normalizedValue);
    const newContainer = cutArea(rect, _.sum(allValues));
    const newCoordinates = getCoordinates(currentRow, rect);
    const newStack = [...stack, ...newCoordinates];

    return squarify(
      data, [], newContainer, newStack
    );
  }
}

const flatten = <T>(listOfLists: T[][]): T[] => {
  const result: T[] = [];
  listOfLists.forEach(list => list.forEach(elem => result.push(elem)));
  return result;
}

const getArea = ({x0, y0, x1, y1}: IRect) => (x1 - x0) * (y1 - y0);

export const recurse = <Custom>(datum: ILayoutRect<Custom>): ILayoutRect<Custom>[] => {
  if (datum.children === undefined) {
    const result = [datum];
    return result;
  } else {
    const normalizedChildren: INormalizedDatum<Custom>[] = normalizeData<Custom>(datum.children, getArea(datum));
    const squarified: ILayoutRect<Custom>[] = squarify(normalizedChildren, [], datum, []);
    const contained: ILayoutRect<Custom>[][] = squarified.map(elem => recurse(elem))
    const flattened: ILayoutRect<Custom>[] = flatten<ILayoutRect<Custom>>(contained);
    return flattened;
  }
}

export type IDatum<Custom> = {
  value: number
  children?: Array<IDatum<Custom>>,
} & Custom;

export type Input<Custom> = {
  value: number,
  children?: Array<Input<Custom>>,
} & Custom;

export default function<Custom>(
  data: Array<Input<Custom>>,
  container: {x0: number, y0: number, x1: number, y1: number}) {

  const x0 = container.x0;
  const y0 = container.y0;
  const x1 = container.x1;
  const y1 = container.y1;

  const input = {
    x0, y0, x1, y1,
    children: data,
  } as ILayoutRect<Custom>;
  return recurse(input);
}

export type INormalizedDatum<Custom> = IDatum<Custom> & {
  // this is the value after going through `normalizeData` function
  normalizedValue: number,
};
export interface IRect {
  // Top-left corner:
  x0: number;
  y0: number;
  // Bottom right corner:
  x1: number;
  y1: number;
}
export type ILayoutRect<T> = IRect & INormalizedDatum<T>;

// Calculate the max aspect ratio if a list of rectangles whose areas are contained in `row`
// are laid out against a line of length `length`:
export const calculateMaxAspectRatio = <Custom>(row: Array<INormalizedDatum<Custom>>, length: number): number => {
  const rowLength = row.length;
  if (rowLength === 0) {
    throw new Error('Inpupt ' + row + ' is an empty array');
  } else {
    let minArea = Infinity;
    let maxArea = - Infinity;
    let sumArea = 0;
    for (let i = 0; i < rowLength; i += 1) {
      const area = row[i].normalizedValue;
      if (area < minArea) {
        minArea = area;
      }
      if (area > maxArea) {
        maxArea = area;
      }
      sumArea += area;
    }
    const result = Math.max(
      (length ** 2) * maxArea / (sumArea ** 2),
      (sumArea ** 2) / ((length ** 2) * minArea),
    );
    return result;
  }
};

export const doesAddingToRowImproveAspectRatio = <Custom>(
    currentRow: Array<INormalizedDatum<Custom>>, nextDatum: INormalizedDatum<Custom>, length: number,
  ) => {

  if (currentRow.length === 0) {
    return true;
  } else {
    const newRow = currentRow.concat(nextDatum);
    const currentMaxAspectRatio = calculateMaxAspectRatio(currentRow, length);
    const newMaxAspectRatio = calculateMaxAspectRatio(newRow, length);
    return (currentMaxAspectRatio >= newMaxAspectRatio);
  }
};

// Ensure that the sum of elements in `data` is equal to `area` (as per original algorithm):
export const normalizeData = <Custom>(data: Array<IDatum<Custom>>, area: number): Array<INormalizedDatum<Custom>> => {
  const dataLength = data.length;
  let dataSum = 0;
  for (let i = 0; i < dataLength; i += 1) {
    dataSum += data[i].value;
  }

  const multiplier = area / dataSum;
  // TODO: use spread/rest type instead of `Object.assign` when bug with rest/spread has been fixed.
  const result: Array<INormalizedDatum<Custom>> = [];
  let elementResult: INormalizedDatum<Custom>, datum: IDatum<Custom>;
  for (let j = 0; j < dataLength; j += 1) {
    datum = data[j];
    elementResult = Object.assign({}, datum, {
      normalizedValue: datum.value * multiplier,
    });
    result.push(elementResult);
  }
  return result;
};

interface IContainer {
  xOffset: number;
  yOffset: number;
  height: number;
  width: number;
}

const containerToRect = (container: IContainer): IRect => {
  const xOffset = container.xOffset;
  const yOffset = container.yOffset;
  const width = container.width;
  const height = container.height;
  return {
    x0: xOffset,
    y0: yOffset,
    x1: xOffset + width,
    y1: yOffset + height,
  };
};

const rectToContainer = (rect: IRect): IContainer => {
  const x0 = rect.x0;
  const y0 = rect.y0;
  const x1 = rect.x1;
  const y1 = rect.y1;
  return {
    xOffset: x0,
    yOffset: y0,
    width: x1 - x0,
    height: y1 - y0,
  };
};

const getShortestEdge = (input: IRect) => {
  const container = rectToContainer(input);
  const width = container.width;
  const height = container.height;
  const result = Math.min(width, height);
  return result;
};

// Lay the rectangles inside a `container` so that the rectangles stack on top of each other in the direction
// parallel to the width:
export const getCoordinates = <Custom>(
    row: Array<INormalizedDatum<Custom>>, rect: IRect,
  ): Array<ILayoutRect<Custom>> => {

  const container = rectToContainer(rect);
  const width = container.width;
  const height = container.height;
  const xOffset = container.xOffset;
  const yOffset = container.yOffset;

  const rowLength = row.length;
  let valueSum = 0;
  for (let i = 0; i < rowLength; i += 1) {
    valueSum += row[i].normalizedValue;
  }

  const areaWidth = valueSum / height;
  const areaHeight = valueSum / width;

  let subXOffset = xOffset;
  let subYOffset = yOffset;
  const coordinates: Array<ILayoutRect<Custom>> = [];
  if (width >= height) {
    for (let i = 0; i < rowLength; i += 1) {
      const num = row[i];
      const y1 = subYOffset + num.normalizedValue / areaWidth;
      const rectangle: IRect = {
        x0: subXOffset,
        y0: subYOffset,
        x1: subXOffset + areaWidth,
        y1,
      };
      const nextCoordinate: ILayoutRect<Custom> = Object.assign({}, num, rectangle);
      subYOffset = y1;
      coordinates.push(nextCoordinate);
    }

    return coordinates;
  } else {
    for (let i = 0; i < rowLength; i += 1) {
      const num = row[i];
      const x1 = subXOffset + num.normalizedValue  / areaHeight;
      const rectangle: IRect = {
        x0: subXOffset,
        y0: subYOffset,
        x1,
        y1: subYOffset + areaHeight,
      };
      const nextCoordinate: ILayoutRect<Custom> = Object.assign({}, num, rectangle);
      subXOffset = x1;
      coordinates.push(nextCoordinate);
    }
    return coordinates;
  }
};

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
    };
    return containerToRect(container);
  } else {
    const areaHeight = area / width;
    const newHeight = height - areaHeight;
    const container: IContainer = {
      xOffset,
      yOffset: yOffset + areaHeight,
      width,
      height: newHeight,
    };
    return containerToRect(container);
  }
};

export const squarify = <Custom>(
    inputData: Array<INormalizedDatum<Custom>>,
    inputCurrentRow: Array<INormalizedDatum<Custom>>,
    inputRect: IRect,
    inputStack: Array<ILayoutRect<Custom>>): Array<ILayoutRect<Custom>> => {

  let data: Array<INormalizedDatum<Custom>> = inputData,
  currentRow: Array<INormalizedDatum<Custom>> = inputCurrentRow,
  rect: IRect = inputRect,
  stack: Array<ILayoutRect<Custom>> = inputStack;

  while (true) {
    const dataLength = data.length;
    if (dataLength === 0) {
      const newCoordinates = getCoordinates(currentRow, rect);
      const newStack: Array<ILayoutRect<Custom>> = stack.concat(newCoordinates);
      return newStack;
    }

    const width = getShortestEdge(rect);
    const nextDatum = data[0];
    const restData = data.slice(1, dataLength);

    if (doesAddingToRowImproveAspectRatio(currentRow, nextDatum, width)) {
      const newRow = currentRow.concat(nextDatum);
      data = restData;
      currentRow = newRow;
      rect = rect;
      stack = stack;
    } else {
      const currentRowLength = currentRow.length;
      let valueSum = 0;
      for (let i = 0; i < currentRowLength; i += 1) {
        valueSum += currentRow[i].normalizedValue;
      }

      const newContainer = cutArea(rect, valueSum);
      const newCoordinates = getCoordinates(currentRow, rect);
      const newStack = stack.concat(newCoordinates);
      data = data;
      currentRow = [];
      rect = newContainer;
      stack = newStack;
    }
  }
};

const flatten = <T>(listOfLists: T[][]): T[] => {
  const result: T[] = [];
  const listOfListsLength = listOfLists.length;
  for (let i = 0; i < listOfListsLength; i += 1) {
    const innerList = listOfLists[i];
    const innerListLength = innerList.length;
    for (let j = 0; j < innerListLength; j += 1) {
      result.push(innerList[j]);
    }
  }
  return result;
};

const getArea = (rect: IRect) => (rect.x1 - rect.x0) * (rect.y1 - rect.y0);

export const recurse = <Custom>(datum: ILayoutRect<Custom>): Array<ILayoutRect<Custom>> => {
  if (datum.children === undefined) {
    const result = [datum];
    return result;
  } else {
    const normalizedChildren: Array<INormalizedDatum<Custom>> = normalizeData<Custom>(datum.children, getArea(datum));
    const squarified: Array<ILayoutRect<Custom>> = squarify(normalizedChildren, [], datum, []);

    const squarifiedLength = squarified.length;
    const contained: Array<Array<ILayoutRect<Custom>>> = [];
    for (let i = 0; i < squarifiedLength; i += 1) {
      contained.push(recurse(squarified[i]));
    }

    const flattened: Array<ILayoutRect<Custom>> = flatten<ILayoutRect<Custom>>(contained);
    return flattened;
  }
};

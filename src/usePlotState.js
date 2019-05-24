import { useReducer, useCallback, useRef } from 'react';
import Animated from 'react-native-reanimated';

const { Value } = Animated;

const sharedState = {
  plotState: {
    lines: [],
    points: [],
  },
};

export { sharedState };

const newLineReucer = (plotState, line) => {
  const { x1, y1, x2, y2 } = line;

  const { points, lines } = plotState;

  // Checking if there's a shared point
  // between this new line and other lines
  // it can only the end point temporarily
  // so we only check for the head of line
  const sharedPoint = {
    point: null,
    distance: Number.MAX_SAFE_INTEGER,
  };

  for (const point of points) {
    const { x, y } = point;
    const distance = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
    if (distance < sharedPoint.distance && distance < 25) {
      sharedPoint.point = point;
      sharedPoint.distance = distance;
    }
  }

  const newLine = {
    tail: null,
    head: null,
    key: lines.length - 1,
  };

  const allPoints = [...points];

  const tailPoint = {
    x: x1,
    y: y1,
    animNodeX: new Value(x1),
    animNodeY: new Value(y1),
    lines: [newLine],
    key: allPoints.length - 1,
  };
  allPoints.push(tailPoint);
  newLine.tail = tailPoint;

  const { point: cadidateHeadPoint } = sharedPoint;

  if (cadidateHeadPoint !== null) {
    newLine.head = cadidateHeadPoint;
    cadidateHeadPoint.lines = [...cadidateHeadPoint.lines, newLine];
  } else {
    const headPoint = {
      x: x2,
      y: y2,
      animNodeX: new Value(x2),
      animNodeY: new Value(y2),
      lines: [newLine],
      key: allPoints.length - 1,
    };
    newLine.head = headPoint;
    allPoints.push(headPoint);
  }

  return {
    lines: [...lines, newLine],
    points: allPoints,
  };
};

const plotStateReducer = (plotState, action) => {
  const { type, payload } = action;
  let newState;
  switch (type) {
    case 'NEW_LINE':
      newState = newLineReucer(plotState, payload);
      sharedState.plotState = newState;
      return newState;
    default:
      throw new Error(`unknown action type: ${type}`);
  }
};

const usePlotState = () => {
  const [plotState, dispatch] = useReducer(plotStateReducer, {
    lines: [],
    points: [],
  });

  return [plotState, dispatch];
};

export default usePlotState;

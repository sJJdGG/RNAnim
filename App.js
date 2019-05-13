import React, { useCallback, useRef, useEffect, useReducer } from 'react';
import Animated from 'react-native-reanimated';

import { PanGestureHandler, State } from 'react-native-gesture-handler';

import Svg, { Line } from 'react-native-svg';

const { sub, set, event, block } = Animated;

const { Value } = Animated;

const AnimLine = Animated.createAnimatedComponent(Line);

const stateReducer = (state, action) => {
  switch (action.type) {
    case 'NEW_LINE':
      return {
        ...state,
        lines: [...state.lines, action.payload],
      };
    default:
      throw new Error(`Unknow action type${action.type}`);
  }
};

const App = () => {
  const [drawState, dispatch] = useReducer(stateReducer, { lines: [] });
  const currentTouch = useRef({
    translationX: new Value(0),
    translationY: new Value(0),
    x1: new Value(0),
    y1: new Value(0),
    x2: new Value(0),
    y2: new Value(0),
  });

  const { x1, y1, x2, y2, translationX, translationY } = currentTouch.current;

  const onGestureEvent = useCallback(
    event([
      {
        nativeEvent: {
          x: x2,
          y: y2,
          translationX,
          translationY,
        },
      },
    ]),
    []
  );

  const onHandlerStateChange = gestureEvent => {
    const { state } = gestureEvent.nativeEvent;
    if (state === State.END) {
      const {
        x,
        y,
        translationX: translateX,
        translationY: tranlateY,
      } = gestureEvent.nativeEvent;
      const newPath = {
        x1: x - translateX,
        y1: y - tranlateY,
        x2: x,
        y2: y,
        key: String(Date.now()),
      };

      // Resetting the drawer to default
      Object.keys(currentTouch.current).forEach(valueNodeName =>
        currentTouch.current[valueNodeName].setValue(0)
      );

      dispatch({ type: 'NEW_LINE', payload: newPath });
    }
  };

  Animated.useCode(
    block([set(x1, sub(x2, translationX)), set(y1, sub(y2, translationY))]),
    []
  );

  useEffect(() => {
    // console.warn(StatusBar.currentHeight);
  });

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View>
        <Svg
          width="100%"
          height="100%"
          style={{
            backgroundColor: 'grey',
            flex: 1,
          }}
        >
          <AnimLine
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="red"
            strokeWidth="8"
            key="0"
          />
          {drawState.lines.map(line => (
            <Line
              {...line}
              stroke="red"
              strokeWidth="8"
              style={{ borderColor: 'blue', borderWidth: 5 }}
            />
          ))}
        </Svg>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default App;

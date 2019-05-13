import React, { useCallback, useRef, useEffect, useReducer } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';

import Svg, { Line } from 'react-native-svg';

const tmp = {
  fromJSToNative: {},
  fromNativeToJS: {},
};

MessageQueue.spy(data => {
  if (data.type === 1) {
    const { fromJSToNative } = tmp;
    const { module } = data;
    if (fromJSToNative[module]) {
      fromJSToNative[module] += 1;
    } else {
      fromJSToNative[module] = 1;
    }
  } else {
    const { fromNativeToJS } = tmp;
    const { module } = data;
    if (fromNativeToJS[module]) {
      fromNativeToJS[module] += 1;
    } else {
      fromNativeToJS[module] = 1;
    }
  }
  console.log(tmp);
});

const { sub, set, event, block, cond, Value } = Animated;

const Temp = () => {
  const handleState = useRef({
    state: new Value(),
    oldState: new Value(),
    translationX: new Value(0),
    translationY: new Value(0),
    x2: new Value(0),
    y2: new Value(0),
  });

  const {
    x2,
    y2,
    state,
    oldState,
    translationX,
    translationY,
  } = handleState.current;

  const handleStateChane = useCallback(
    event([
      {
        nativeEvent: {
          state,
          oldState,
          translationX,
          translationY,
          x2,
          y2,
        },
      },
    ])
  );
};

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

const Drawer = React.memo(({ dispatch }) => {
  console.log('rendered!!!');
  const currentTouch = useRef({
    translationX: new Value(0),
    translationY: new Value(0),
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
      // Object.keys(currentTouch.current).forEach(valueNodeName =>
      //   currentTouch.current[valueNodeName].setValue(0)
      // );

      dispatch({ type: 'NEW_LINE', payload: newPath });
    }
  };

  useEffect(() => {
    // console.warn(StatusBar.currentHeight);
  });
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View style={{ ...StyleSheet.absoluteFillObject }}>
        <Svg
          width="100%"
          height="100%"
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <AnimLine
            x1={sub(x2, translationX)}
            y1={sub(y2, translationY)}
            x2={x2}
            y2={y2}
            stroke="red"
            strokeWidth="8"
            key="0"
          />
        </Svg>
      </Animated.View>
    </PanGestureHandler>
  );
});

const Plot = ({ linesState }) => {
  console.log(linesState);

  return (
    <Svg
      width="100%"
      height="100%"
      style={{
        flex: 1,
        backgroundColor: 'transparent',
      }}
    >
      {linesState.lines.map(line => (
        <Line
          {...line}
          stroke="red"
          strokeWidth="8"
          style={{ borderColor: 'blue', borderWidth: 5 }}
        />
      ))}
    </Svg>
  );
};

const App = () => {
  const [linesState, dispatch] = useReducer(stateReducer, { lines: [] });
  return (
    <View style={{ flex: 1, width: '100%' }}>
      <Plot linesState={linesState} />
      <Drawer dispatch={dispatch} />
    </View>
  );
};

export default App;

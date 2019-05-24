import React, { useCallback, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { State, PanGestureHandler } from 'react-native-gesture-handler';
import Svg, { Line } from 'react-native-svg';
import { sharedState } from './usePlotState';

const {
  Value,
  event,
  sub,
  cond,
  useCode,
  eq,
  set,
  block,
  call,
  createAnimatedComponent,
} = Animated;

const AnimatedLine = createAnimatedComponent(Line);

// eslint-disable-next-line react/display-name
const Drawer = React.memo(({ dispatch }) => {
  const currentTouch = useRef({
    translationX: new Value(0),
    translationY: new Value(0),
    x: new Value(0),
    y: new Value(0),
    state: new Value(0),
  });

  const currentLinePos = useRef({
    x1: new Value(0),
    y1: new Value(0),
    x2: new Value(0),
    y2: new Value(0),
  });

  // keeping a copy of every value for js side
  // because there's setValue api
  // in reanimated but no getValue api
  // so change copy every time you setValue!!!
  const lockedPos = useRef({
    locked: new Value(0),
    lockedCopy: 0,
    lockedPosX: new Value(0),
    lockedPosXCopy: 0,
    lockedPosY: new Value(0),
    lockedPosYCopy: 0,
  });

  const { x, y, translationX, translationY, state } = currentTouch.current;
  const { x1, y1, x2, y2 } = currentLinePos.current;
  const { locked, lockedPosX, lockedPosY } = lockedPos.current;

  const handleLockPos = useCallback(
    ([posX, posY, gestureState]) => {
      const { plotState } = sharedState;

      const { points } = plotState;
      // early return to make sure
      // we only check for locking
      // on active and end gesture states
      if (gestureState < State.ACTIVE) {
        return;
      }

      // first let's find the best cadidate
      const bestCandidate = {
        point: null,
        distance: Number.MAX_SAFE_INTEGER,
      };

      points.forEach(point => {
        const { x: pointX, y: pointY } = point;
        const distance = Math.sqrt((pointX - posX) ** 2 + (pointY - posY) ** 2);
        if (distance < bestCandidate.distance) {
          bestCandidate.point = point;
          bestCandidate.distance = distance;
        }
      });

      const { lockedCopy, lockedPosXCopy, lockedPosYCopy } = lockedPos.current;

      // now let's check if this candidate is
      // qualified for getting locked to
      if (bestCandidate.distance < 25) {
        const {
          point: { x: pointX, y: pointY },
        } = bestCandidate;

        // it's qualified
        // but should we unlock
        // or it's locked to this position?
        if (
          lockedCopy === 0 ||
          lockedPosXCopy !== pointX ||
          lockedPosYCopy !== pointY
        ) {
          // we need to lock

          locked.setValue(1);
          lockedPos.current.lockedCopy = 1;

          lockedPosX.setValue(pointX);
          lockedPos.current.lockedPosXCopy = pointX;

          lockedPosY.setValue(pointY);
          lockedPos.current.lockedPosYCopy = pointY;
        }
      } else if (lockedCopy === 1) {
        // we need to unlcok
        lockedPos.current.lockedCopy = 0;
        locked.setValue(0);
      }
    },
    [locked, lockedPosX, lockedPosY]
  );

  const gestureEvent = useCallback(
    event([
      {
        nativeEvent: ({
          x: touchX,
          y: touchY,
          state: gestureState,
          translationX: transX,
          translationY: transY,
        }) =>
          block([
            set(x, touchX),
            set(y, touchY),
            set(state, gestureState),
            set(translationX, transX),
            set(translationY, transY),
            call([x, y, state], handleLockPos),
          ]),
      },
    ]),
    []
  );

  const addNewLine = useCallback(
    ([endPosX, endPosY, transX, transY]) => {
      // resetting locked copy state at the end of gesture
      lockedPos.current.lockedCopy = 0;

      const newLine = {
        x1: endPosX - transX,
        y1: endPosY - transY,
        x2: endPosX,
        y2: endPosY,
      };
      dispatch({ type: 'NEW_LINE', payload: newLine });
    },
    [dispatch]
  );

  useCode(
    block([
      cond(
        eq(state, State.ACTIVE),
        [
          set(x1, sub(x, translationX)),
          set(y1, sub(y, translationY)),
          cond(locked, set(x2, lockedPosX), set(x2, x)),
          cond(locked, set(y2, lockedPosY), set(y2, y)),
        ],
        [set(x1, 0), set(y1, 0), set(x2, 0), set(y2, 0)]
      ),
      // adding new line at the end of gesture
      cond(eq(state, State.END), [
        call([x, y, translationX, translationY], addNewLine),
        set(locked, 0),
      ]),
    ]),
    []
  );

  // const hanldeLockedPos = ()

  return (
    <PanGestureHandler
      onGestureEvent={gestureEvent}
      onHandlerStateChange={gestureEvent}
    >
      <Animated.View style={{ ...StyleSheet.absoluteFillObject }}>
        <Svg
          width="100%"
          height="100%"
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <AnimatedLine
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="blue"
            strokeWidth="8"
            key="0"
          />
        </Svg>
      </Animated.View>
    </PanGestureHandler>
  );
});

export default Drawer;

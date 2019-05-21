import React, { useRef } from 'react';
import { View, StatusBar } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';

StatusBar.setTranslucent(true);
StatusBar.setHidden(true);

const tx = {
  fromJSToNative: {},
  fromNativeToJS: {},
};

MessageQueue.spy(data => {
  if (data.type === 1) {
    const { fromJSToNative } = tx;
    const { module } = data;
    if (fromJSToNative[module]) {
      fromJSToNative[module] += 1;
    } else {
      fromJSToNative[module] = 1;
    }
  } else {
    const { fromNativeToJS } = tx;
    const { module } = data;
    if (fromNativeToJS[module]) {
      fromNativeToJS[module] += 1;
    } else {
      fromNativeToJS[module] = 1;
    }
  }
  console.log(tx);
});

const { Value, event, block, eq, set, add, cond, call, sub } = Animated;

const transX = new Value(0);
const transY = new Value(0);
const gestureState = new Value(-1);
const absX = new Value(0);
const absY = new Value(0);
const offsetX = new Value(0);
const offsetY = new Value(0);
const locked = new Value(0);
const lockedXPos = new Value(0);
const lockedYPos = new Value(0);

const box = {
  x: 0,
  y: 0,
};

const setBox = (x, y, width, height, pageX, pageY) => {
  box.x = pageX + 50;
  box.y = pageY + 50;
};

// Keep a copy of values to
// know the values on native side
const syncedValues = {
  locked: 0,
  lockedXPos: 0,
  lockedYPos: 0,
};

const shouldBeLocked = gestureData => {
  const [translationX, translationY, state, absoluteX, absoluteY] = gestureData;
  const { x, y } = box;

  if (state < State.ACTIVE) {
    return;
  }
  const distance = Math.sqrt((absoluteX - x) ** 2 + (absoluteY - y) ** 2);
  if (distance < 135) {
    // Always keeping a copy of last value
    // Only becauese this is the only place
    // this value changes

    if (
      syncedValues.lockedXPos !== x ||
      syncedValues.lockedYPos !== y ||
      syncedValues.locked === 0
    ) {
      syncedValues.lockedXPos = x;
      lockedXPos.setValue(x);

      syncedValues.lockedYPos = y;
      lockedYPos.setValue(y);

      syncedValues.locked = 1;
      locked.setValue(1);
    }
  } else if (syncedValues.locked === 1) {
    // console.warn('out!!');
    syncedValues.locked = 0;
    locked.setValue(0);
  }
};

const _transX = cond(locked, sub(lockedXPos, 50), [
  cond(
    eq(gestureState, State.ACTIVE),
    add(offsetX, transX),
    set(offsetX, add(offsetX, transX))
  ),
]);

const _transY = cond(locked, sub(lockedYPos, 50), [
  cond(
    eq(gestureState, State.ACTIVE),
    add(offsetY, transY),
    set(offsetY, add(offsetY, transY))
  ),
]);

const onGestureEvent = event([
  {
    nativeEvent: ({
      translationX,
      translationY,
      state,
      absoluteX,
      absoluteY,
    }) =>
      block([
        set(transX, translationX),
        set(transY, translationY),
        set(gestureState, state),
        set(absX, absoluteX),
        set(absY, absoluteY),
        call([transX, transY, gestureState, absX, absY], shouldBeLocked),
      ]),
  },
]);

const App = () => {
  const boxRef = useRef();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
          width: 270,
          height: 270,
          borderRadius: 135,
          borderWidth: 2,
          borderColor: 'grey',
        }}
      >
        <View
          ref={boxRef}
          onLayout={() => boxRef.current.measure(setBox)}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 2,
            borderColor: 'black',
          }}
        />
      </View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
        maxPointers={1}
        minPointers={1}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: 100,
              height: 100,
              backgroundColor: 'tomato',
              borderRadius: 50,
            },
            {
              transform: [
                {
                  translateX: _transX,
                },
                {
                  translateY: _transY,
                },
              ],
            },
          ]}
        />
      </PanGestureHandler>
    </View>
  );
};

export default App;

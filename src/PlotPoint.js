import React, { useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const { event, sub } = Animated;

// eslint-disable-next-line react/display-name
const PlotPoint = memo(({ animNodeX, animNodeY }) => {
  const x = undefined;

  // const gestHandler = useCallback(
  //   event([
  //     {
  //       nativeEvent: {
  //         x: animNodeX,
  //         y: animNodeY,
  //       },
  //     },
  //   ]),
  //   [animNodeX, animNodeY]
  // );

  return (
    <PanGestureHandler>
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'white',
          width: 16,
          height: 16,
          borderRadius: 8,
          transform: [
            {
              translateX: sub(animNodeX, 8),
            },
            {
              translateY: sub(animNodeY, 8),
            },
          ],
        }}
      />
    </PanGestureHandler>
  );
});

export default PlotPoint;

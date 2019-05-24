import React, { memo, useRef, useEffect } from 'react';
import { Line } from 'react-native-svg';
import Animated from 'react-native-reanimated';

const { createAnimatedComponent } = Animated;

const AnimateLine = createAnimatedComponent(Line);

// eslint-disable-next-line react/display-name
const PlotLine = memo(props => (
  <AnimateLine {...props} stroke="red" strokeWidth="8" />
));

export default PlotLine;

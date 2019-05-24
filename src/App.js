import React, { useCallback, useRef, useReducer } from 'react';
import { View } from 'react-native';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';
import Plot from './Plot';
import Drawer from './Drawer';
import usePlotState from './usePlotState';

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
  // console.log(tx);
});

const App = () => {
  const [plotState, dispatch] = usePlotState();
  return (
    <View style={{ flex: 1, width: '100%', backgroundColor: 'grey' }}>
      <Plot plotState={plotState} />
      <Drawer dispatch={dispatch} />
    </View>
  );
};

export default App;

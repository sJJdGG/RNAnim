import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import PlotLine from './PlotLine';
import PlotPoint from './PlotPoint';

const Plot = ({ plotState }) => {
  const { lines, points } = plotState;

  return (
    <>
      <Svg
        width="100%"
        height="100%"
        style={{
          flex: 1,
          backgroundColor: 'transparent',
        }}
      >
        {lines.map(line => {
          const { head, tail, key } = line;
          const { x: x1, y: y1 } = tail;
          const { x: x2, y: y2 } = head;
          return <PlotLine x1={x1} y1={y1} x2={x2} y2={y2} key={key} />;
        })}
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        {points.map(point => {
          const { animNodeX, animNodeY, key } = point;
          return (
            <PlotPoint animNodeX={animNodeX} animNodeY={animNodeY} key={key} />
          );
        })}
      </View>
    </>
  );
};

export default Plot;

import React from 'react';
import BarChart from './BarChart';
import data from './mockdata/sampledata.json';
import NetworkVis from './NetworkVis';

const Network = (props) => (
  <div>
    You are now connected ~(ºoº)~
    The current network is: {props.match.params.networkID}
    <NetworkVis
      data={data}
      width={500}
      height={500}
    />
    <BarChart
      data={[1,2,3,5,8,13,21,34]}
      width={700}
      height={500}
    />
  </div>
);

export default Network;
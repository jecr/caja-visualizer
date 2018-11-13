import React from 'react';
import data from '../../_mockdata/sampledata.json';
import NetworkVis from '../../components/NetworkVis';
import { parseRawNetworkData } from '../../utils/dataParsing';

const Network = (props) => (
  <div>
    You are now connected ~(ºoº)~
    The current network is: {props.match.params.networkID}
    <NetworkVis
      data={parseRawNetworkData(data)}
      width={500}
      height={500}
    />
  </div>
);

export default Network;
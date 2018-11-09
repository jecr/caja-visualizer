import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Network from './Network';

const Content = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/network/:networkID' component={Network} />
    </Switch>
  </main>
    );
    
export default Content;
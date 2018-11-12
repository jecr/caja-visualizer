import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from '../../routes/Home';
import Network from '../../routes/Network';
import { MainContainer } from './styles';

const Content = () => (
  <MainContainer>
    <Switch>
      <Route exact path='/' component={Home} />
      <Route path='/network/:networkID' component={Network} />
    </Switch>
  </MainContainer>
    );
    
export default Content;
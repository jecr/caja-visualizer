import React from 'react';
import { Link } from 'react-router-dom';
import { HeaderContainer, Navigation } from './styles.js';

const Header = () => (
  <HeaderContainer>
    <Navigation>
      <ul>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/network/anitalavalatina'>Network</Link></li>
      </ul>
    </Navigation>
  </HeaderContainer>
);

export default Header;
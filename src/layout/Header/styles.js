import styled from 'styled-components';

export const HeaderContainer = styled.header`
  border-bottom: 1px solid #000;
`;

export const Navigation = styled.nav`
  ul {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    li {
      a {
        display: inline-block;
        padding: 5px 8px;
        text-decoration: none;
        color: #222;
        &:hover {
          color: #444;
        }
      }
    }
  }
`;
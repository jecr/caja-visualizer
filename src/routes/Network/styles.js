import styled from 'styled-components';

export const Log = styled.div`
  column-count: 1;

  @media (min-width: 480px) {
    column-count: 2;
  }

  @media (min-width: 760px) {
    column-count: 3;
  }

  @media (min-width: 1600px) {
    column-count: 4;
  }
  
  & span {
    font-size: 0.7em;
    display: block;
  }
  & ol {
    font-size: 0.7em;
    margin: 0;
    padding-left: 20px;
  }
  & h3 {
    font-size: 0.9em;
  }
`;
import { gql } from '@apollo/client';

export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      name
      highScore
      xp
      level
      balance
      tokenOfOwnerByIndex
      ownedBirds(orderBy: ownerIndex, orderDirection: asc) {
        id
        ownerIndex
        highScore
        xp
        level
        imageId
      }
    }
  }
`;
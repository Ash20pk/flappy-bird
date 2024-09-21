import { gql } from '@apollo/client';

// GraphQL query to fetch player data
export const GET_PLAYER = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      name
      highScore
      xp
      level
      ownedBirds {
        id
        highScore
        xp
        level
        imageId
      }
    }
  }
`;
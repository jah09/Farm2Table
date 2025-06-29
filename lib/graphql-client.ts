export async function graphqlRequest(query: string, variables?: any) {
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    return data.data;
  } catch (error) {
    console.error('GraphQL request error:', error);
    throw error;
  }
}

// GraphQL mutations and queries
export const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      role
      farmName
      location
      farmingMethod
      createdAt
    }
  }
`;

export const LOGIN_USER_MUTATION = `
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      user {
        id
        email
        name
        role
        farmName
        location
        farmingMethod
      }
      token
    }
  }
`;

export const LOGIN_USER_QUERY = `
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      email
      name
      role
      farmName
      location
      farmingMethod
    }
  }
`; 
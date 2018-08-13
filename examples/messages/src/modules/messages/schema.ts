export default `
  scalar Date
    
  type Message {
    id: ID!
    sender: User!
    content: String!
    createdAt: Date!
    recipient: User!
  }
      
  type Query {
    chat(with: ID!): [Message]
  }      
`;

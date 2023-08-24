import { gql } from "apollo-server";
import neo4j from "neo4j-driver";

const NEO4J_URI = "bolt://192.168.18.194:7687";
const NEO4J_USER = "neo4j";
const NEO4J_PASSWORD = "neo4j123";
const DB = "neo4j";

// define driver
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// define Graphql Schema
const typeDefs = gql`
    type TransactionCategory {
      category: String
      percentage: Int
    }

    type TransactionDetail {
      transaction_desc: String
      percentage: Int
    }
    
    type Query {
      getTransactionCategories(cif: String!): [TransactionCategory]
      getTransactionDetails(cif: String!, category: String!): [TransactionDetail]
    }

     type Mutation {
      updateCategory(cif: String!, category: String!, newCategory: String!): String
      updateSubCategory(cif: String!, category: String!, subcategory: String!, newSubCategory: String!): String
    }
`;

const resolvers = {
  Query: {
    getTransactionCategories: async (_, { cif }) => {
      const session = driver.session({database: DB});
      const query = `
      MATCH p=(:Customer{Cif: $cif})--(n:Account)-[:HAS_TRX]-(t:Transaction)
                where t.Transaction_desc is not null 
                return CASE WHEN exists(t.new_category) THEN t.new_category ELSE t.category END AS category,count (t) as percentage
      `;
      const result = await session.run(query, { cif });
      session.close();

      return result.records.map(record => ({
        category: record.get('category'),
        percentage: record.get('percentage').toInt()
      }));
    },

    getTransactionDetails: async (_, { cif, category }) => {
      const session = driver.session({database:DB});
      const query = `
      MATCH p=(:Customer{Cif: $cif})--(n:Account)-[:HAS_TRX]-(t:Transaction)
      where t.Transaction_desc is not null and (t.category = $category or t.new_category = $category)
      return CASE WHEN exists(t.new_Transaction_desc) THEN t.new_Transaction_desc ELSE t.Transaction_desc END AS transaction_desc,count (t) as percentage
      `;
      const result =  await session.run(query, { cif, category});
      session.close();

      return result.records.map(record => ({
        transaction_desc: record.get('transaction_desc'),
        percentage: record.get('percentage').toInt()
      }));
    }
  },
  Mutation: {
    updateCategory: async (_, { cif, category, newCategory}) => {
      const session = driver.session({ database: DB});
      const query = `
      MATCH p=(:Customer{Cif: $cif})--(n:Account)-[:HAS_TRX]-(t:Transaction{category: $category})
      where t.Transaction_desc is not null
      SET t.new_category = $newCategory  
      `;
      const result = await session.run(query, {cif, category, newCategory});
      session.close();

      return "Update Category Success";
    },

    updateSubCategory: async (_, { cif, category, subcategory, newSubCategory}) => {
      const session = driver.session({database: DB})
      const query = `
      MATCH p=(:Customer{Cif: $cif})--(n:Account)-[:HAS_TRX]-(t:Transaction{category: $category})
      where t.Transaction_desc is not null and t.Transaction_desc = $subcategory
      set t.new_Transaction_desc = $newSubCategory
      `;
      const result = await session.run(query, { cif, category, subcategory, newSubCategory});
      session.close();

      return "Update Subcategory Success"
    }
  },
};

export { typeDefs, resolvers };

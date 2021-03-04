const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { 
  GraphQLSchema, 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList
} = require('graphql')
const app = express()
const port = process.env.PORT || 8080

const { authors, articles } = require('./data')

const authorType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt)
    },
    name: {
      type: GraphQLNonNull(GraphQLString)
    },
    articles: {
      type: GraphQLList(articleType),
      resolve: (author) => {
        return articles.filter(article => article.authorId == author.id)
      }
    }
  })
})

const articleType = new GraphQLObjectType({
  name: 'Article',
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt)
    },
    authorId: {
      type: GraphQLNonNull(GraphQLInt)
    },
    author: {
      type: authorType,
      resolve: (article) => {
        return authors.find(author => author.id === article.authorId)
      }
    },
    title: {
      type: GraphQLNonNull(GraphQLString)
    },
    content: {
      type: GraphQLNonNull(GraphQLString)
    }
  })
})

const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    articles: {
      type: new GraphQLList(articleType),
      resolve: () => articles
    },
    authors: {
      type: GraphQLList(authorType),
      resolve: () => authors
    },
    article: {
      type: articleType,
      args: {
        id: {
          type: GraphQLInt
        }
      },
      resolve: (parent, args) => articles.find(article => article.id == args.id)
    },
    author: {
      type: authorType,
      args: {
        id: {
          type: GraphQLInt
        }
      },
      resolve: (parent, args) => authors.find(author => author.id == args.id)
    }
  })
})

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addArticle: {
      type: articleType,
      args: {
        authorId: { type: GraphQLNonNull(GraphQLInt)},
        title: { type: GraphQLNonNull(GraphQLString) },
        content: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const article = {
          id: articles[articles.length - 1].id + 1,
          authorId: args.authorId,
          title: args.title,
          content: args.content
        }
        articles.push(article)

        return article
      }
    },
    addAuthor: {
      type: authorType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = {
          id: authors[authors.length - 1].id + 1,
          name: args.name
        }
        authors.push(author)

        return author
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: query,
  mutation: mutation
})

app.use('/', graphqlHTTP({
  schema: schema,
  graphiql: true
}))

app.listen(port, () => console.log(`Server running on port ${port}`))
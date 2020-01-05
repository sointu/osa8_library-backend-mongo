const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
//const User = require('./models/user')
const jwt = require('jsonwebtoken')

const uuid = require('uuid/v1')

mongoose.set('useFindAndModify', false)

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const MONGODB_URI = 'mongodb+srv://sointu:soma@cluster0-d1zcd.mongodb.net/library-backend?retryWrites=true&w=majority'


console.log('commecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })

let authors = [
    /*
    {
        name: 'Robert Martin',
        id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
        born: 1952,
    },
    {
        name: 'Martin Fowler',
        id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
        born: 1963
    },
    {
        name: 'Fyodor Dostoevsky',
        id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
        born: 1821
    },
    {
        name: 'Joshua Kerievsky', // birthyear not known
        id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    {
        name: 'Sandi Metz', // birthyear not known
        id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
    */
]


let books = [
    /*
    {
        title: 'Clean Code',
        published: 2008,
        author: 'Robert Martin',
        id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Agile software development',
        published: 2002,
        author: 'Robert Martin',
        id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
        genres: ['agile', 'patterns', 'design']
    },
    {
        title: 'Refactoring, edition 2',
        published: 2018,
        author: 'Martin Fowler',
        id: "afa5de00-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring']
    },
    {
        title: 'Refactoring to patterns',
        published: 2008,
        author: 'Joshua Kerievsky',
        id: "afa5de01-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'patterns']
    },
    {
        title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
        published: 2012,
        author: 'Sandi Metz',
        id: "afa5de02-344d-11e9-a414-719c6709cf3e",
        genres: ['refactoring', 'design']
    },
    {
        title: 'Crime and punishment',
        published: 1866,
        author: 'Fyodor Dostoevsky',
        id: "afa5de03-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'crime']
    },
    {
        title: 'The Demon',
        published: 1872,
        author: 'Fyodor Dostoevsky',
        id: "afa5de04-344d-11e9-a414-719c6709cf3e",
        genres: ['classic', 'revolution']
    },
   */
]
 

const typeDefs = gql`
  type Query {
    hello: String!
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Author {
    name: String!
    born: Int
    
    id: ID!
}

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }


  type Mutation {
    addBook(
        title: String!
        published: Int!
        name: String!
        born: Int
        genres: [String!]!
    ): Book

    addAuthor(
        name: String!
        born: Int
        bookCount: Int
    ): Author

    editAuthor(
          name: String!
          setBornTo: Int
    ): Author
 
  }
`

const resolvers = {
    Query: {
        bookCount: () => books.length,
        authorCount: () => authors.length,
        allBooks: (root, args) => {
            if (args.author && args.genre) {
                let authorsBooks = books.filter(b => b.author === args.author)
                return authorsBooks.filter(b => b.genres.includes(args.genre))
            } else if (args.author) {
                return books.filter(b => b.author === args.author)
            } else if (args.genre) {
                return books.filter(b => b.genres.includes(args.genre))
            } else {
                return books
            }

        },
        allAuthors: () => authors,
        // findAuthor: (root, args) => Author.findOne({ name: args.name }),
    },
    /*
    Author: {
        bookCount: (Author) => {
            let bookArr = books.filter(b => b.author === Author.name)
            console.log(bookArr)
            return bookArr.length
        }
    },
    */
    Book: {
        author: root => {
          return {
            name: root.name,
            born: root.born
           
          }
        }
      },
    Mutation: {
        addAuthor: async (root, args, context) => {
            const author = new Author({ ...args })

            /*const currentUser = context.currentUser
      
            if (!currentUser) {
              throw new AuthenticationError("not authenticated")
            }
            */

            try {
                await author.save()
                //currentUser.friends = currentUser.friends.concat(person)
                //await currentUser.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }

            return author
        }
    },

    addBook: async (root, args, context) => {
        const book = new Book({ ...args })
        //const author = await Author.findOne({ name: args.name })
        //if (!author) {
          //  addAuthor(args.name, args.born, args.bookCount)
        //}
        /*const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new AuthenticationError("not authenticated")
        }
        */

        try {
            await book.save()
            //currentUser.friends = currentUser.friends.concat(person)
            //await currentUser.save()
        } catch (error) {
            throw new UserInputError(error.message, {
                invalidArgs: args,
            })
        }
        return book
    },
    editAuthor: (root, args) => {
        const author = authors.find(a => a.name === args.name)
        if (!author) {
            return null
        }

        const updatedAuthor = { ...author, born: args.setBornTo }
        authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
        return updatedAuthor
    }

}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})

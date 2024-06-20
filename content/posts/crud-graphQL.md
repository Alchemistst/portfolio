---
title: "[NDN] Building a simple CRUD using GraphQL"
date: 2024-06-20T23:57:02+02:00
draft: false
toc: false
images:
tags:
  - Nightly Dev Notes
---

Hi there 👽!

In this article I wanted to play around and experiment with using **GraphQL**. And so, I made the simplest CRUD application I could came up with, a TODO list.

## So... GraphQL... right?

In case you don't know, GraphQL is a query language for APIs that allows clients to request exactly the data they need. It provides efficient, flexible, and precise data fetching compared to traditional REST APIs.

This results in the following: imagine you have a complex entity on your backend. 
Now, let's suppose you need different parts of that entity on the frontend, depending on the part of the application you are in. 

On traditional REST APIs, you'd need a different endpoint for each of those parts (unless you prefer to go full macho and bring your whole costly-to-compute complex entity each time).

On the other hand, with GraphQL you define the schema for your entity and how to fill each field. Then, with its query language, you can request just the data you need from the frontend client, without the need for multiple endpoints.

## Let's see it in action

For this project I'll be using:
  - *Express*: to serve the API,
  - *GraphiQL*: as a query IDE for easier interaction with the API.

If you want to follow along, you have all the code in my [repo](https://github.com/Alchemistst/todo-list-graphQL). 

### Defining the schema

We'll start by defining the schema for our TODOs:

```javascript
// Our GraphQL Schema
var schema = buildSchema(`
  type Todo {
    id: ID!
    content: String!
    isDone: Boolean
    }
    
  type Query {
    getTodo(id: ID!): Todo
    getAll: [Todo]
    }
      
  type Mutation {
    createTodo(content: String): Todo
    updateTodo(id: ID!, content: String, isDone: Boolean): Todo
    deleteTodo(id: ID!): String
    }
`);
```

In GraphQL we have three basic types: **Query**, **Mutation**, **Object** types.
  - *Object* types are the actual entities you want to expose to the world.
  - *Query* are the methods you want to define to "query" (duh!) the schema. 
  - *Mutation* are the methods that changes the entities defined on your schema.

### Implementing each endpoint

Now it's time to tell graphQL how to fill all those queries and mutations. For each of them, we'll define an endpoint on our Express server:

```javascript
// Resolvers for each API endpoint
var root = {
  getTodo({ id }) {
    if (!fakeDB[id]) {
      throw new Error(`ID ${id} does not belong to any TODO kiddo!`);
    }
    return fakeDB[id];
  },
  getAll() {
    return Object.values(fakeDB);
  },
  createTodo({ content }) {
    const { v4: uuidv4 } = require("uuid");

    const id = uuidv4();
    const todo = new Todo(id, content);
    fakeDB[id] = todo;

    return todo;
  },
  updateTodo({ id, content, isDone }) {
    if (!fakeDB[id]) {
      throw new Error(`ID ${id} does not belong to any TODO kiddo!`);
    }
    if (content) {
      fakeDB[id].content = content;
    }
    if (isDone) {
      fakeDB[id].isDone = isDone;
    }
    return fakeDB[id];
  },
  deleteTodo({ id }) {
    if (!fakeDB[id]) {
      throw new Error(`ID ${id} does not belong to any TODO kiddo!`);
    }
    delete fakeDB[id];
    return id;
  },
};
```

### Cherry on the cake: Queries and Mutations

It's time! From graphiQL we can query the API. Let's create a TODO, we will run the following:
```graphql
mutation {
  createTodo(content: "Feed Mr Mittens") {
    id,
    content,
    isDone
  }
}
```

Now, let's asume bringing the *content* of the TODO is a very expensive operation, and we really only need the *id* field after the creation. Well, no problem, we can change the query to this: 
```graphql
mutation {
  createTodo(content: "Feed Mr Mittens") {
    id
  }
}
```

What was that? Do you only need the *id* and *isDone* fields when you fetch a TODO? Not a problem boss: 
```graphql
{
  getTodo(id: "TODO_ID") {
    id,
    isDone
  }
}
```

## The Takeaway

GraphQL allows for tons of flexibility when defining endpoints. 
In particular, it shines when the data grows in complexity and it needs to be consumed from multiple sources. By defining just the data that we need, we can save unnecesary calls to other services to retrieve data that we know we are not going to use.

For now, this is all.
Signing out...
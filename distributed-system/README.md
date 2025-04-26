# Distributed System Project

This project is a distributed system that separates concerns by running a Socket.io server and a REST API server on different servers. 

## Architecture

The architecture consists of two main components:

1. **Socket Server**: This server handles real-time communication using Socket.io. It manages user connections, disconnections, and real-time messaging.

2. **REST API Server**: This server provides RESTful APIs for client-server communication. It handles user-related requests and interacts with the database.

## Project Structure

```
distributed-system
├── socket-server          # Socket.io server
│   ├── src
│   │   ├── index.ts      # Entry point for the Socket.io server
│   │   ├── events        # Event handling for connections and disconnections
│   │   └── types         # Type definitions for the Socket.io server
│   ├── package.json       # NPM configuration for the Socket.io server
│   ├── tsconfig.json      # TypeScript configuration for the Socket.io server
│   └── README.md          # Documentation for the Socket.io server
├── rest-api-server        # REST API server
│   ├── src
│   │   ├── index.ts      # Entry point for the REST API server
│   │   ├── controllers    # Controllers for handling requests
│   │   ├── routes         # Route definitions for user-related endpoints
│   │   ├── models         # Database models
│   │   └── types          # Type definitions for the REST API server
│   ├── package.json       # NPM configuration for the REST API server
│   ├── tsconfig.json      # TypeScript configuration for the REST API server
│   └── README.md          # Documentation for the REST API server
└── README.md              # Documentation for the overall distributed system project
```

## Setup Instructions

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Install Dependencies**:
   - Navigate to the `socket-server` directory and run `npm install`.
   - Navigate to the `rest-api-server` directory and run `npm install`.

3. **Run the Servers**:
   - Start the Socket.io server by running `npm start` in the `socket-server` directory.
   - Start the REST API server by running `npm start` in the `rest-api-server` directory.

4. **Environment Variables**: Ensure to set up any required environment variables as specified in the individual server README files.

## Usage

- The Socket.io server will handle real-time communication, while the REST API server will manage user-related data and requests.
- Refer to the individual README files in the `socket-server` and `rest-api-server` directories for more detailed usage instructions.
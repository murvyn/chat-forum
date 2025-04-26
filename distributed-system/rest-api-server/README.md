# REST API Server

This directory contains the REST API server for the distributed system. The server is built using Express and provides endpoints for managing user-related operations.

## Getting Started

To get started with the REST API server, follow these steps:

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd distributed-system/rest-api-server
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root of the `rest-api-server` directory and define the necessary environment variables, such as database connection strings.

4. **Run the server**:
   ```
   npm start
   ```

   The server will start on the specified port (default is 5000).

## API Endpoints

The REST API server provides the following endpoints:

- `POST /api/users`: Create a new user.
- `GET /api/users/:id`: Retrieve a user by ID.
- `GET /api/users`: Retrieve all users.

## Technologies Used

- Node.js
- Express
- TypeScript
- MongoDB (or any other database of your choice)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
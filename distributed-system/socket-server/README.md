# Socket.io Server

This directory contains the implementation of the Socket.io server for the distributed system. The Socket.io server is responsible for handling real-time communication between clients.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd distributed-system/socket-server
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **Configuration**
   Ensure that you have the necessary environment variables set up. You may need to create a `.env` file in the root of the `socket-server` directory.

4. **Run the Server**
   To start the Socket.io server, run:
   ```bash
   npm start
   ```

5. **Usage**
   The Socket.io server listens for incoming connections and handles events such as user connections and disconnections. Clients can connect to this server to send and receive real-time messages.

## File Structure

- `src/index.ts`: Entry point for the Socket.io server.
- `src/events/connection.ts`: Handles new socket connections.
- `src/events/disconnection.ts`: Manages user disconnections.
- `src/types/index.ts`: Contains types and interfaces used throughout the server.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.
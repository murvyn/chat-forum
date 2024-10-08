# 1. **Introduction**

- **Project Overview:**
     This project is a real-time chat application built using React and TypeScript, designed to offer features such as messaging, file uploads, audio recording, voice/video calling, and user authentication. It leverages various third-party libraries and custom components for UI, state management, API interactions, and media handling.

## 2. **File Structure**

Your project is modularized into a series of well-defined folders, which help keep your application organized. Let's look at each folder and file in detail:

- **`src/components`:**
  This is the core of the application UI, divided into smaller components for modularity and reusability.
  - **`chat`:** Handles all components related to the chat functionality. Key components here include:
    - **`Chat.tsx`:**
      - The core chat component that renders the entire chat interface, including the chat header, chat list, and bottom bar.
      - It manages the display of the chat messages and handles interactions like sending/receiving messages, voice/video calls, and user statuses.
    - **`ChatBubble.tsx`:**
      - Responsible for displaying individual messages (both sent and received).
      - It uses the `class-variance-authority (cva)` utility to dynamically generate class names based on the type of message (e.g., `sent`, `received`, `ai`).
      - The bubble supports text, media, and loading states, ensuring seamless transitions.
    - **`ChatBottomBar.tsx`:**
      - This component manages the user input for sending messages, including text, audio, and file uploads.
      - It utilizes React's state (`useState`) and references (`useRef`) to handle the dynamic resizing of the text input, manage focus, and track the file upload progress.
      - It integrates real-time audio recording and handling of various media file types, supporting large file uploads with a size check mechanism.
    - **`ChatList.tsx`:**
      - Displays the list of messages and scrolls automatically when new messages are added.
      - It uses animations from Framer Motion for smooth message transitions and a fallback loading spinner for loading states.
    - **`ChatTopBar.tsx`:**
      - This component handles the top navigation and actions within a chat, such as initiating voice and video calls. It displays user or group details at the top of the chat interface.
  - **`ui`:** Contains reusable UI components, such as:
    - **`Avatar.tsx`:** A component to render user profile pictures or fallback initials when no image is available.
    - **`Button.tsx`:** Standardized buttons with configurable styles and sizes, utilizing Tailwind CSS classes for consistency.
  - **`Admin.tsx`:**
    - This component highlights admin users in the chat system with a special crown icon and a green badge to indicate their online status.
  - **`AudioPlayer.tsx` and `AudioRecorder.tsx`:**
    - These components handle the playing and recording of audio messages, respectively.
    - `AudioPlayer.tsx` integrates `Wavesurfer.js` to visualize the audio waveforms, while `AudioRecorder.tsx` allows users to record and send voice messages directly from the chat.
  - **`CreateChannelCard.tsx`:**
    - This component provides the UI for creating group chats (channels). It includes input fields for the channel name and user selection using a multi-selector component.
  - **`ErrorBoundary.tsx` and `ErrorFallback.tsx`:**
    - These components implement error boundaries to catch errors in the app and display fallback UI messages, ensuring that the app doesn’t break unexpectedly.

- **`src/context`:**
  This folder contains the context providers that manage global state for key functionalities across the app:
  - **`AuthContext.tsx`:**
    - Manages user authentication (login/logout), user details, and token management across the app.
  - **`ChatContext.tsx`:**
    - Centralizes chat state management, including the current chat ID, message lists, and the sending/receiving of messages.
  - **`SocketContext.tsx`:**
    - Handles WebSocket connections using `Socket.IO`, managing real-time data transmission, such as new message notifications, online/offline status, and active calls.

- **`src/hooks`:**
  Custom hooks encapsulate logic related to specific parts of the application.
  - **`useAgora.tsx`:**
    - Manages Agora SDK operations for voice and video calling, including initializing clients, toggling microphone and camera, and joining/leaving call channels.
  - **`useAuthMiddleware.tsx`:**
    - Adds authentication checks across protected routes, ensuring users are authorized before accessing certain parts of the application.
  - **`useFetchMessage.tsx`:**
    - Handles message fetching from the server and ensures that the chat messages are always up-to-date when switching between different chats.

- **`src/libs`:**
  Contains utility functions that are used throughout the project.
  - **`utils.ts`:**
    - Utility functions for formatting times, managing class names, and handling other repetitive tasks across the app.

- **`src/pages`:**
  This folder contains the primary pages of the application.
  - **`DashBoard.tsx`:** The main user dashboard where users can view their chats, initiate new conversations, or join group chats.
  - **`Signin.tsx`:** The user login page.
  - **`ResetPassword.tsx`:** The password reset page.

## 3. **Detailed Component Breakdown**

Each component has been meticulously designed to handle specific responsibilities. Below are further details for the most crucial components.

### **`Chat.tsx`**

- **Purpose:**
  This is the main chat component, which ties together the chat header, chat messages list, and bottom input bar into a cohesive chat interface.
- **Key Features:**
  - It passes the chat type (direct or group) as props to other subcomponents.
  - This component manages the rendering of the chat messages and initiates WebSocket connections via the `SocketContext` to listen for real-time events.
  - It conditionally renders certain features depending on whether the chat is a one-on-one conversation or a group chat (channel).

#### **`ChatBubble.tsx`**

- **Purpose:**
  Displays individual messages as bubbles, supports different message types such as text, image, and audio.
- **Structure:**
  - The component uses `cva` to manage styles dynamically.
  - It has subcomponents: `ChatBubbleMessage` for displaying the message content, `ChatBubbleAvatar` for the sender’s avatar, and `ChatBubbleTimestamp` for the time the message was sent.

#### **`ChatBottomBar.tsx`**

- **Purpose:**
  Manages user input for sending messages, uploading files, and recording audio.
- **Functionality:**
  - Handles different states like typing a message, uploading a file, or recording an audio message.
  - Manages sending media via WebSocket using the `sendTextMessage` method from the `ChatContext`.
  - Includes emoji support, file validation, and dynamic text area resizing.
  
#### **`AudioPlayer.tsx`**

- Integrates the Wavesurfer.js library to provide audio playback with visual waveform representations.
- Controls playback with play/pause features, and displays the current time vs. total duration.

#### **`CreateChannelCard.tsx`**

- Allows users to create group chats (channels), complete with a form for adding a channel name and selecting users from a list.

#### **`Socket.IO Integration`**

Socket.IO is critical for real-time functionality, especially in chat applications where messages, typing indicators, and user statuses need to be updated without reloading the page.

- **`SocketContext.tsx`:**
  - Initializes a connection to the WebSocket server using `Socket.IO`.
  - Manages events such as `connect`, `disconnect`, `new_message`, `typing`, and `call_notifications`.
  - Emits events when the user sends messages or triggers calls.
- **Real-Time Messaging:**
  - When a user sends a message, the message is first emitted to the server via `socket.emit('send_message', message)`.
  - The server broadcasts the message to other users connected to the same chat room, ensuring real-time message delivery.
  - Incoming messages are handled by listening to the `new_message` event and updating the local state, causing the UI to reflect the new message immediately.

#### **`useAgora.tsx`**

- **Purpose:**
  Manages the integration with Agora for handling voice and video calls.
- **Functionality:**
  - Initializes Agora clients for both real-time messaging (RTM) and real-time communication (RTC).
  - Listens for incoming call notifications, toggles microphone and camera during calls, and handles call teardown when the user leaves the call.
  - Uses `useEffect` hooks to manage call state and lifecycle.

### 4. **State Management**

The state is managed globally via React’s Context API and React Query. Here's an in-depth look:

- **Global State:**
  - **`AuthContext.tsx`:** Provides global state for user authentication and ensures secure routes using context values.
  - **`ChatContext.tsx`:** Stores chat-specific state, such as the active chat, message history, and notifications. This ensures all components have access to the necessary chat data.
  - **`SocketContext.tsx`:** Provides global access to the WebSocket connection, allowing any component to emit or listen to events without passing props.

- **React Query:**
  - Handles API calls and manages caching for chat data, user information, and messages. Queries are optimized for performance, minimizing redundant network requests and speeding up data retrieval.

### 5. **API Interaction**

- **React Query Mutations and Queries:**
  - **Mutations** are used to handle POST/PUT operations like sending a message, creating a group, and uploading files.
  - **Queries** manage GET requests for retrieving messages, chats, and user data. Each query is optimized with background fetching and caching to ensure minimal load times and efficient data retrieval.
- **Error Handling:**
  - React Query’s `onError` handlers ensure that any API errors are caught and handled gracefully. The `ErrorBoundary` component is also used to wrap sensitive components, providing fallback UIs in case of failure.
- **Socket.IO Integration:**
  - Real-time interactions are facilitated via Socket.IO, especially for receiving messages in real-time and call notifications during voice/video calls.

### 6. **Styling and Layout**

- **Tailwind CSS:**
  - The application uses Tailwind CSS for utility-first styling. Components are structured using responsive design principles with classes like `flex`, `w-full`, and `rounded-lg` to ensure a consistent UI across different devices.
- **Class Variance Authority (`cva`):**
  - `cva` is utilized to manage style variants across components like `ChatBubble`, enabling dynamic class combinations for different message types (e.g., sent, received, AI, media).
- **Dark Mode Compatibility:**
  - Dark mode is integrated into various components, with dynamic class handling using `dark:bg-` and `dark:text-` utility classes to adjust styles based on user preferences.

### 7. **Important Hooks**

- **`useAgora.tsx`:**
  - Manages voice and video calling features via Agora's SDK, including setting up Agora clients for both real-time messaging (RTM) and real-time communication (RTC). This hook handles call initialization, microphone/video toggling, and ending calls.
- **`useFetchMessage.tsx`:**
  - Handles fetching messages based on the chat ID. It abstracts the logic of fetching and setting messages, ensuring messages are up-to-date when users switch between different chats.
- **`useAuthMiddleware.tsx`:**
  - Ensures that authentication is handled across the app by verifying tokens and user sessions.

### 8. **Error Handling**

- **ErrorBoundary Component:**
  - Provides a fallback UI when an error is caught within any of the child components. This ensures that the application doesn’t crash unexpectedly and the user is presented with a graceful error message.
- **ErrorFallback Component:**
  - Displays an error message with options to retry the action or logout and reload the page. It enhances user experience during failure scenarios.

### 9. **Third-Party Integrations**

- **Framer Motion:**
  - Used for animating transitions in UI elements, such as message entries and exits, button clicks, and modal appearances. It enhances the user experience with smooth, interactive animations.
- **Agora SDK:**
  - Powers real-time voice and video calling in the application. Features include initializing calls, toggling microphone and video settings, and ending calls.
- **Wavesurfer.js:**
  - Provides audio visualization for media messages, allowing users to see a waveform while playing back audio recordings. This improves the media consumption experience within the chat.

### 10. **Performance Optimizations**

- **Lazy Loading:**
  - Components such as `ChatHeader` are lazy-loaded, ensuring that non-critical parts of the application are only loaded when needed, reducing the initial load time.
- **Auto-Resizing Text Areas:**
  - Input fields in the chat are dynamically resized based on content, improving the UI's responsiveness and minimizing the need for user interaction.
- **Efficient Rendering:**
  - Components like `ChatList` and `ChatBubble` are optimized for rendering performance using memoization and animations, ensuring smooth transitions even with large message loads.

### 8. **Deployment Details**

Your project has been deployed at the following URL:

**[Chat Application Deployment on Vercel](https://chat-forum-cyan.vercel.app/)**

**Deployment Overview:**

- **Platform:** Vercel
  - Vercel provides an optimized environment for deploying modern web applications, including static and serverless functions.
  - Your frontend is automatically built and deployed from the main branch of your repository when pushed to Vercel.
  
### **Vercel Configuration**

Vercel is configured using the `vercel.json` file in your project:

- **`vercel.json`:**
  - Defines build and output settings for deployment, such as environment variables, custom redirects, and rewrites.
  - Ensures your React project compiles correctly for production.

**Deployment Steps:**

1. **Push to Main Branch:**
   Vercel listens for changes in the main branch of your GitHub repository, and once new code is pushed, it automatically triggers a build.
2. **Build Process:**
   - Vercel runs the build command specified in the project’s `package.json`, typically `vite build`, since you are using Vite as the build tool.
   - The environment variables such as API URLs and credentials are injected during the build process.
3. **Deployment:**
   - Once the build completes, Vercel serves the static assets from its global content delivery network (CDN) ensuring fast load times.
4. **Environment Variables:**
   - Important credentials like the Agora API keys, Socket.IO server URLs, and others should be securely stored in Vercel’s Environment Variables settings. This ensures they are injected during build time and not exposed in the codebase.

### **Vercel Optimizations**

Vercel’s global CDN ensures that your application performs optimally by:

- **Edge Network Distribution:** Serving your application from multiple global locations close to the end-user, reducing latency and ensuring fast loading times.
- **Serverless Functions:** For any server-side logic (e.g., handling real-time chat features or APIs), Vercel can deploy them as serverless functions, making them scalable and cost-effective.

### **Error Monitoring and Logs**

Vercel provides insights into your application’s performance and errors during and after deployment:

- **Build Logs:** Detailed logs available in Vercel help diagnose build issues, such as missing environment variables or incorrect configurations.
- **Runtime Logs:** Vercel also logs errors that happen during runtime, which is helpful for debugging production issues, such as WebSocket connection errors or issues related to API calls.

### **Real-Time Socket.IO Configuration in Vercel**

Socket.IO connections are critical for real-time functionality. Ensure the following are correctly configured in Vercel:

- **WebSocket Server URL:** The WebSocket endpoint should be accessible from your deployed application. The client-side connection should point to the correct server URL based on your environment (development or production).
- **CORS Setup:** Make sure the WebSocket server allows connections from your Vercel-deployed domain (`https://chat-forum-cyan.vercel.app`), especially if you are using different origins for the WebSocket server.

### **Final Checks for Production Deployment**

- **Environment Variables:**
  Ensure that all necessary environment variables are configured in Vercel’s settings for the production environment. This might include:
  - API URLs
  - Socket.IO server endpoint
  - Agora API keys and project IDs
  - Authentication secret keys

- **Caching and CDN:**
  Vercel automatically optimizes caching for static assets. Ensure that any long-lived content like profile images, avatars, and static JS/CSS files are correctly cached.

### **Post-Deployment Considerations**

After deployment, ensure the following features are working correctly:

- **WebSocket Connection:** Verify that real-time chat functionality, including sending and receiving messages, is functioning without issues.
- **Media Handling:** Test uploading images, videos, and audio files to confirm that the file upload and display process works smoothly.
- **Performance Testing:** Use Vercel’s analytics to monitor the performance of your application and detect potential bottlenecks.

Here’s how to include the setup guide, environment configuration, and running instructions in your documentation, complete with details on installing dependencies and running the development server:

---

## **Setup Guide**

To get the project running locally, follow these steps. This guide will walk you through setting up your environment, configuring the necessary files, installing dependencies, and running the app.

### **1. Prerequisites**

Ensure you have the following installed on your system:

- **Node.js**: Download and install the latest LTS version from [Node.js](https://nodejs.org).
- **npm**: Comes with Node.js. Verify it’s installed by running:

  ```bash
  npm -v
  ```

- **MongoDB**: Install MongoDB locally by following the instructions on [MongoDB's official site](https://www.mongodb.com/try/download/community). Make sure MongoDB is running.
- **Redis**: Install Redis locally, or use a cloud-based Redis service if necessary.
- **Vite**: Make sure Vite is set up for your development environment. If not, you can install it globally:

  ```bash
  npm install -g vite
  ```

### **2. Cloning the Repository**

Clone the project repository to your local machine:

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### **3. Setting Up the Environment Variables**

Create a `.env` file in the root directory of your project and add the following variables based on your environment:

```bash
# Backend and API Configuration
VITE_BASEURL=http://localhost:5000
# VITE_BASEURL=https://chat-forum-api-db3bf0ece27b.herokuapp.com

# Agora Configuration for Voice/Video Calling
VITE_AGORA_APPID=d90459e3074b40a9848bd6d5a10e6631

# Cloudinary Configuration for Media Uploads
CLOUDINARY_URL=cloudinary://332927511219839:DKya89qUevN69lvkwNzE00qrA0o@droeaaqpq
```

**Environment Variables Breakdown:**

- **VITE_BASEURL**: The base URL of your backend API. For local development, use `http://localhost:5000`. For production, uncomment the Heroku URL.
- **VITE_AGORA_APPID**: Your Agora App ID, which is used for initiating voice and video calls.
- **CLOUDINARY_URL**: Cloudinary connection string used for uploading images, videos, and audio files.

Make sure to adjust these values depending on whether you’re working in development or production.

### **4. Install Dependencies**

After setting up your environment variables, install the project dependencies:

```bash
npm install
```

This will install all necessary dependencies, including React, Vite, Socket.IO, Agora SDK, Tailwind CSS, and others listed in the `package.json`.

### **5. Running the Development Server**

Now you’re ready to run the application in development mode:

```bash
npm run dev
```

This will start the development server using Vite. Once the server is running, you’ll see the local URL in the terminal (e.g., `http://localhost:5173`), which you can open in your browser to start using the app.

### **6. Running the Backend (Optional)**

If you are working with the backend as well, ensure that the backend server is running. You can start the backend server separately by navigating to the backend directory and running:

```bash
npm install
npm start
```

Ensure that MongoDB and Redis are running locally or via cloud-based services as well.

### **7. Accessing the Application**

Once everything is running, you can access your app at:

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`

### **8. Testing the Application**

- **User Authentication**: Test the login and signup flows.
- **Chat Functionality**: Ensure real-time messaging works, including sending text, media, and voice messages.
- **Agora Integration**: Verify that voice and video calls are functional by initiating a call from within the app.

---

## **Final Checks**

- Ensure all environment variables are correctly configured in the `.env` file.
- Make sure MongoDB and Redis services are running and connected properly to the application.
- Test both the frontend and backend thoroughly to verify functionality.

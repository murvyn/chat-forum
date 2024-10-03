# **Project Overview**

This project is a **real-time chat application** built using modern technologies for **backend**, **mobile**, and **web** platforms. The app supports messaging, file uploads, audio recording, voice/video calling, user authentication, and real-time communication. It integrates third-party services like **Agora**, **Cloudinary**, **Socket.IO**, **Redis**, and **JWT** for efficient data management, real-time updates, and secure communication.

## **Technology Stack**

- **Backend**: Node.js, Express.js, MongoDB, Redis, Socket.IO, JWT, Cloudinary, Winston (Logging), Agora (Voice/Video)
- **Mobile**: React Native (Expo), TanStack Query, Agora SDK, Socket.IO, NativeWind, Tailwind CSS
- **Web**: React, TypeScript, Vite, Framer Motion, Tailwind CSS, Socket.IO, Agora SDK

---

## **Setup Guide**

### **Prerequisites**

- **Node.js**: Install the latest LTS version from [Node.js](https://nodejs.org).
- **npm**: Comes with Node.js. Run `npm -v` to check installation.
- **MongoDB**: Install from [MongoDB's site](https://www.mongodb.com/try/download/community) and ensure it is running.
- **Redis**: Install locally or use a cloud-based Redis service.
- **Expo CLI**: For mobile, install globally using `npm install -g expo-cli`.
- **Vite**: For the web, ensure Vite is installed globally (`npm install -g vite`).

### **1. Clone the Repository**

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### **2. Setting Up Environment Variables**

Create a `.env` file in the root directories of both the backend and frontend (mobile/web) and include the following variables:

#### **Backend `.env`**

```bash
MONGODB_URI=mongodb://127.0.0.1/chat-forum
JWTPrivateKey=your-secret
APP_Password=your-app-password
EMAIL=your-email@example.com
FRONTEND_URL=http://localhost:5173
PORT=5000
CLOUD_NAME=your-cloudinary-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret
APP_ID=your-agora-app-id
APP_CERTIFICATE=your-agora-app-certificate
REDIS_KEY=your-redis-key
REDIS_URL=your-redis-url
REDIS_PORT=12024
```

#### **Mobile `.env`**

```bash
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_AGORA_APPID=your-agora-app-id
CLOUDINARY_URL=cloudinary://your-cloudinary-url

```

#### **Frontend `.env`**

```bash
VITE_BASEURL=http://localhost:5000
# VITE_BASEURL=https://chat-forum-api-db3bf0ece27b.herokuapp.com
VITE_AGORA_APPID=d90459e3074b40a9848bd6d5a10e6631
CLOUDINARY_URL=cloudinary://332927511219839:DKya89qUevN69lvkwNzE00qrA0o@droeaaqpq
```

### **3. Install Dependencies**

#### **Backend**

```bash
cd backend
npm install
```

#### **Mobile**

```bash
cd mobile
npm install
```

#### **Web**

```bash
cd web
npm install
```

### **4. Running the Application**

#### **Backend**

Start the backend server:

```bash
npm start
```

The backend should be accessible at `http://localhost:5000`.

#### **Mobile**

Start the mobile app with Expo:

```bash
npm run start
```

Scan the QR code with Expo Go on your phone or use an emulator.

#### **Web**

Start the web app with Vite:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### **5. Testing the Application**

- **Login**: Test user authentication by logging in with credentials.
- **Messaging**: Send messages between users, both text and multimedia.
- **Voice/Video Calls**: Ensure Agora voice and video calling works smoothly.
- **File Uploads**: Test image, audio, and video uploads via Cloudinary.

---

## **Core Functionalities**

### **Backend**

- **User Authentication**: Secure JWT-based authentication, hashed passwords with bcrypt.
- **Real-Time Messaging**: Socket.IO ensures real-time bi-directional communication.
- **File Uploads**: Uses Cloudinary for media management (images, audio, videos).
- **Role-Based Access Control**: Supports student, lecturer, and HOD roles with specific permissions.
- **Caching**: Redis optimizes frequently accessed data like chat histories.

### **Mobile App**

- **Messaging**: Send and receive messages with real-time updates via Socket.IO.
- **Voice/Video Calling**: Agora integration allows for in-app voice and video communication.
- **File Management**: Upload and preview images, record and send audio messages.
- **State Management**: Context API and TanStack Query efficiently handle authentication, chat management, and data caching.

### **Web App**

- **Chat Interface**: Modular React components for chats, channels, and direct messaging.
- **Dynamic UIs**: Framer Motion adds smooth transitions and animations to the chat UI.
- **Voice/Video**: Integrated Agora for seamless calling.
- **Performance Optimization**: Lazy-loaded components, auto-resizing input fields, and optimized rendering for large chats.

---

## **Deployment**

### **Backend Deployment**

The backend is deployed on Heroku:
**URL**: [https://chat-forum-api-db3bf0ece27b.herokuapp.com](https://chat-forum-api-db3bf0ece27b.herokuapp.com)

### **Web Deployment**

The web frontend is deployed on Vercel:
**URL**: [https://chat-forum-cyan.vercel.app/](https://chat-forum-cyan.vercel.app)

---

## **Conclusion**

This project offers a comprehensive, real-time chat solution with support for multimedia messaging, real-time updates, and voice/video calling across multiple platforms. The setup process ensures smooth integration between the frontend and backend, with the ability to scale and deploy across cloud platforms.

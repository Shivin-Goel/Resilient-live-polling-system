# Resilient Live Polling System

A production-ready real-time polling system built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. It supports two personas: Teacher (Admin) and Student (Participant).

## Architecture Decisions

- **Strict Separation of Concerns**: The backend strictly follows a Controller -> Service -> Model pattern. Sockets handle events neutrally and delegate all business logic to `PollService.ts`.
- **Single Source of Truth**: The server handles all timer logic (by passing `startTime` and `duration`) and enforcing unique constraints (Compound Index: `pollId` + `studentName`).
- **Resilient State Recovery**: Using `usePollState` combined with REST calls on mount ensures that if anyone refreshes the page, they instantaneously fetch the current active poll and its progress from the database. Handled connection drops via custom `useSocket` hook events.
- **Race Condition Prevention**: Enforced via MongoDB unique index (`pollId` + `studentName`) catching the `11000` Duplicate Key Error directly in the Service.
- **Optimistic UI Updates**: The frontend immediately registers a student's vote visually and locally commits it, but if an error returns (e.g. socket drops, or they somehow double vote), it reverts cleanly via state.

## Tech Stack
- Frontend: React (Vite), TypeScript, Custom Hooks, vanilla CSS (Pixel-perfect Figma).
- Backend: Node.js, Express, Socket.io, Mongoose/MongoDB, TypeScript.

## How to Run Locally

### 1. Backend
cd backend
npm install
npm run dev
*(Make sure MongoDB is running and supply a `.env` with `MONGO_URI`)*

### 2. Frontend
cd frontend
npm install
npm run dev

## Deployment Instructions

### Backend (Render / Railway)
1. Push your code to GitHub.
2. Link your repository to Render or Railway as a Node Web Service.
3. Set the build command to `npm install && npm run build` inside the `backend` directory.
4. Set the start command to `npm start` (ensure `start` script points to `node dist/index.js` in your `package.json` - please update as needed since we used `tsx` for dev).
5. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `PORT`: 5000 (Or let the provider assign it).
6. Enable Socket.io support (Render automatically supports WebSockets on standard ports).

### Frontend (Vercel / Netlify)
1. Link your repository.
2. Select the `frontend` directory as the Root Directory.
3. Framework preset: Vite.
4. **Environment Variables**:
   - `VITE_API_URL`: The production URL of your deployed backend service (e.g. `https://polling-backend.up.railway.app`).
5. Ensure rewrites are set up for React Router if needed (Vite handles this largely, but add `_redirects` file with `/* /index.html 200` for Netlify or `vercel.json` for Vercel).

## Delivered Files
- `/backend` - Full backend with schemas, services, and REST/Socket.io integration.
- `/frontend` - Full frontend matching Figma colors exactly with optimistic UI hooks.

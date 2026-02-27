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

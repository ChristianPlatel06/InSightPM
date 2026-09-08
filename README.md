# InSightPM

InSightPM is a cloud-based project management platform designed to help individuals and teams organize, track, and manage projects efficiently. The platform provides secure authentication, project tracking, real-time cloud storage, and an intuitive user interface.

## Features

- User Registration & Authentication
- Secure Login & Logout
- Project Creation
- Project Editing
- Project Deletion
- Cloud-Based Storage
- User-Specific Project Access
- Responsive Design
- Real-Time Data Persistence
- Deployment on Vercel

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes

### Database
- Firebase Firestore

### Authentication
- Firebase Authentication

### Deployment
- Vercel

### Version Control
- Git
- GitHub

## Architecture

User
↓
Next.js Frontend
↓
Firebase Authentication
↓
API Routes
↓
Firestore Database

## Installation

Clone the repository:

```bash
git clone https://github.com/ChristianPlatel06/InSightPM.git
```

Install dependencies:

```bash
npm install
```

Create a .env.local file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deployment

The project is deployed using Vercel.

## Team

- Christian Platel
- Harinath
- Mansoordin
- Sathish
- Prathiksha
- Priyadharshini

## License

Hackathon Project
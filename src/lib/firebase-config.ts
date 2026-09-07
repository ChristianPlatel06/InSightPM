export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyALW0UJrEl8qVSs1W_fEkZRJC8nYGb6hoM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "insightpm-47900.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "insightpm-47900",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "insightpm-47900.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "180449609806",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:180449609806:web:972babd8893d58363a9b1f",
};

export const firebaseProjectId = firebaseConfig.projectId;

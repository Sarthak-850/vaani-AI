import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(
  clerkPubKey && 
  clerkPubKey.startsWith('pk_') && 
  !clerkPubKey.includes('placeholder') && 
  !clerkPubKey.includes('your_clerk')
);

const RootComponent = () => {
  if (isClerkConfigured) {
    return (
      <ClerkProvider publishableKey={clerkPubKey}>
        <App />
      </ClerkProvider>
    );
  }
  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>,
);

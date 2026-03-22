import { Toaster } from 'react-hot-toast';
import AppRouter from './router';

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-center" toastOptions={{ duration: 3500, style: { fontFamily: 'inherit', borderRadius: '12px', padding: '12px 16px' } }} />
    </>
  );
}

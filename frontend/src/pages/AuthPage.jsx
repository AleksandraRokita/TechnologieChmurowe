import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { authClient } from '../api/lib/auth-client';
import { useAuth } from '../hooks/useAuth';

const initialValuesByMode = {
  login: { email: '', password: '' },
  register: { name: '', email: '', password: '' },
};

function getErrorMessage(error, mode) {
  if (error?.message) {
    return error.message;
  }

  return mode === 'login'
    ? 'Login failed. Check your details.'
    : 'Registration failed. Try again.';
}

function AuthPage({ mode = 'login' }) {
  const [formData, setFormData] = useState(initialValuesByMode[mode]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  const redirectPath = location.state?.from?.pathname || '/';

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response =
        mode === 'login'
          ? await authClient.signIn.email({
              email: formData.email,
              password: formData.password,
            })
          : await authClient.signUp.email({
              name: formData.name,
              email: formData.email,
              password: formData.password,
            });

      if (response.error) {
        setError(getErrorMessage(response.error, mode));
        return;
      }

      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, mode));
    } finally {
      setIsSubmitting(false);
    }
  };

const handleGoogleSignIn = async () => {
  setIsSubmitting(true);
  setError('');
  

  const baseUrl = window.location.origin;
  
  try {
    await authClient.signIn.social({
      provider: 'google',
 
      callbackURL: `${baseUrl}${redirectPath}`, 
    });
  } catch {
    setError('Failed to sign in with Google. Please try again.');
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(148,163,184,0.18),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <AuthCard
          mode={mode}
          formData={formData}
          error={error}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </div>
    </div>
  );
}

export default AuthPage;

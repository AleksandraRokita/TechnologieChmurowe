import { Link } from 'react-router-dom';

const contentByMode = {
  login: {
    title: 'Sign in',
    submitLabel: 'Login',
    switchLabel: 'Create account',
    switchPath: '/register',
    fields: [
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'current-password',
      },
    ],
  },
  register: {
    title: 'Create account',
    submitLabel: 'Register',
    switchLabel: 'Back to login',
    switchPath: '/login',
    fields: [
      { name: 'name', label: 'Name', type: 'text', autoComplete: 'name' },
      { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
      },
    ],
  },
};

function AuthCard({
  mode,
  formData,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onGoogleSignIn,
}) {
  const content = contentByMode[mode];

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-border-strong bg-surface-muted p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-primary shadow-lg shadow-primary/20" />
        <Link
          to={content.switchPath}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary transition hover:border-text-muted hover:text-primary"
        >
          {content.switchLabel}
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          {content.title}
        </h1>

        {content.fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-2 block text-sm font-medium text-text-secondary">
              {field.label}
            </span>
            <input
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              required
              minLength={field.name === 'password' ? 8 : undefined}
              value={formData[field.name]}
              onChange={onChange}
              className="w-full rounded-2xl border border-border bg-secondary-strong px-4 py-3 text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface"
            />
          </label>
        ))}

        {error ? (
          <p className="rounded-2xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-text-inverse transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-text-muted"
        >
          {isSubmitting ? 'Please wait...' : content.submitLabel}
        </button>
        {/* logowanie google  */}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-surface-muted px-2 text-text-muted">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={isSubmitting}
          className="w-full rounded-2xl border border-border bg-secondary-strong px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>
      {/* koniec logowania google */}
      </form>
    </div>
  );
}

export default AuthCard;

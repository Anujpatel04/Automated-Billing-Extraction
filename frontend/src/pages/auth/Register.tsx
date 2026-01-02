/**
 * Register page
 */
import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { UserPlus } from 'lucide-react';
import { useToastContext } from '@/components/ui/ToastProvider';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'HR'>('USER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError: showToastError } = useToastContext();
  
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate password
    if (password.length < 8) {
      const errorMsg = 'Password must be at least 8 characters long';
      setError(errorMsg);
      showToastError(errorMsg);
      setIsLoading(false);
      return;
    }

    const result = await register({ email, password, role });
    
    setIsLoading(false);
    
    if (!result.success) {
      const errorMsg = result.message || 'Registration failed. Please try again.';
      setError(errorMsg);
      showToastError(errorMsg);
    } else {
      showSuccess('Account created successfully! Redirecting...');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your.email@example.com"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Min 8 chars, uppercase, lowercase, number"
              helperText="Must be at least 8 characters with uppercase, lowercase, and number"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'USER' | 'HR')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USER">User - Upload and view own expenses</option>
                <option value="HR">HR - Manage all expenses</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
};


import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  const isNotFound =
    error?.status === 404 ||
    (typeof error?.message === 'string' && error.message.includes('404'));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {isNotFound ? 'Page Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isNotFound
              ? "The page you're looking for doesn't exist or has been moved."
              : "We ran into an unexpected error. Our team has been notified and is working on a fix."}
          </p>
        </div>

        {/* Error detail (dev only) */}
        {import.meta.env.DEV && error?.message && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
            <p className="text-xs font-mono text-gray-500 break-all">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} />
            Go back
          </button>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <Home size={16} />
            Go to Home
          </button>
        </div>

        {/* Contact admin */}
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-400 space-y-1">
          <p>If this keeps happening, please contact support:</p>
          <a
            href="mailto:admin@fareeqi.com"
            className="inline-flex items-center gap-1.5 text-green-600 hover:underline font-medium"
          >
            <Mail size={13} />
            admin@fareeqi.com
          </a>
        </div>
      </div>
    </div>
  );
}

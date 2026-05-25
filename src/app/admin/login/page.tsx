'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';

const initialState = {
  error: '',
};

// Next.js 15 requires awaiting useActionState if it was different, but useActionState in React 19 is synchronous.
// Wait, we can just use regular async function for form action to avoid typing issues.

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-[#4338ca] selection:text-white">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
        
        {/* Hacker aesthetic decorations */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>
        <div className="absolute top-8 right-8 text-xs font-mono text-gray-600 opacity-50">SYS.AUTH.V1</div>
        
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Restricted Access</h1>
        <p className="text-sm font-mono text-gray-400 mb-8 border-b border-gray-800 pb-4">
          Enter clearance code to access the god-mode terminal.
        </p>
        
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-400 text-sm font-mono text-center">
              {state.error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 font-mono">
              Clearance Code
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full bg-[#0f172a] border border-gray-700 text-white py-3 px-4 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono"
              placeholder="••••••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors font-mono tracking-widest uppercase text-sm disabled:opacity-50"
          >
            {isPending ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}

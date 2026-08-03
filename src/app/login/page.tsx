'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../context/AuditContext';
import { Shield, ArrowRight } from 'lucide-react';
import { MOCK_USERS } from '../../lib/auth/authService';

export default function LoginPage() {
  const { login, currentUser, isAuthenticating } = useAuth();
  const { logAction } = useAudit();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticating && currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, isAuthenticating, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Por favor, informe o e-mail corporativo.');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email);
      if (success) {
        // Find user to log action with name
        const loggedUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        logAction(
          'user.login',
          `Login bem-sucedido na plataforma para o usuário ${loggedUser?.name || email} (${loggedUser?.role || 'User'}).`,
        );
        router.push('/dashboard');
      } else {
        setError('Acesso negado. E-mail não cadastrado nos servidores de diretório AD.');
      }
    } catch (err) {
      setError('Erro ao autenticar no servidor SSO. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMockUser = (mockEmail: string) => {
    setEmail(mockEmail);
    setPassword('enterprise-secured-pass');
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Portal Corporativo SSO
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Acesso Restrito ao Estúdio AgentOps AI Enterprise
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                E-mail Corporativo
              </label>
              <div className="relative mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                  placeholder="nome@empresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-field" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Senha de Segurança
              </label>
              <div className="relative mt-1">
                <input
                  id="password-field"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1.5">
                  Entrar no Workspace <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-500">
            Contas de Homologação / Mock
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectMockUser(user.email)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-left hover:border-slate-700 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 text-xs font-bold text-violet-400">
                {user.avatar}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Não está na lista?{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-semibold text-violet-400 hover:text-violet-300 hover:underline"
            >
              Cadastre sua credencial SSO
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

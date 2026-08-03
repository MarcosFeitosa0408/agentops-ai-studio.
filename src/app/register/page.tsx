'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useAudit } from '../../context/AuditContext';
import { Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { UserRole } from '../../lib/auth/types';

export default function RegisterPage() {
  const { register } = useAuth();
  const { logAction } = useAudit();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('AI Developer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email) {
      setError('Por favor, preencha todos os campos corporativos.');
      setLoading(false);
      return;
    }

    if (!email.endsWith('@agentops.ai') && !email.includes('@')) {
      setError('O e-mail precisa pertencer a um domínio corporativo válido.');
      setLoading(false);
      return;
    }

    try {
      const success = await register(name, email, role);
      if (success) {
        logAction(
          'user.register',
          `Novo perfil corporativo registrado com sucesso para ${name} com cargo de ${role}.`,
        );
        router.push('/dashboard');
      } else {
        setError('Ocorreu um erro ao registrar sua credencial SSO.');
      }
    } catch (err) {
      setError('Falha de conexão com os servidores Active Directory (AD).');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400 ring-1 ring-violet-500/30">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Cadastro de Credenciais SSO
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Registre seu perfil no Active Directory corporativo
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nome Completo
              </label>
              <input
                id="full-name"
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label htmlFor="corp-email" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                E-mail Corporativo
              </label>
              <input
                id="corp-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
                placeholder="joao@agentops.ai"
              />
            </div>

            <div>
              <label htmlFor="user-role" className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cargo / Função na Plataforma
              </label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="AI Developer">AI Developer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 focus:outline-none disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1.5">
                  Confirmar Cadastro <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3 w-3" /> Voltar ao Login
          </button>
        </div>
      </div>
    </div>
  );
}

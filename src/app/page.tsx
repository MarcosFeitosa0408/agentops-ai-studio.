export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-2xl px-6 py-12 text-center md:py-24">
        <div className="space-y-8">
          {/* Tag / Status */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
            Sprint 1 Foundation Complete
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl dark:from-blue-400 dark:to-indigo-400">
              AgentOps AI Studio
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Enterprise AI Agent Platform for Data Analysis, Automation and Business Intelligence.
            </p>
          </div>

          {/* Development Notice */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              What&apos;s Next?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The project structure, ESLint, Prettier, and essential environment configs are fully
              initialized. The comprehensive <strong>Design System</strong> and core UI components
              will be implemented in the next sprint.
            </p>
          </div>

          {/* Footer info */}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Initial Project Structure &bull; TypeScript &bull; Tailwind CSS
          </p>
        </div>
      </main>
    </div>
  );
}

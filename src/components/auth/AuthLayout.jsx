function AuthLayout({ children, title, subtitle, footer }) {
  return (
    <div className="min-h-screen bg-[#edf4f1] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-lg font-bold text-white shadow-lg shadow-green-600/20">
            M
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            MoM Assistant
          </p>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>
        )}
      </div>
    </div>
  );
}

export default AuthLayout;

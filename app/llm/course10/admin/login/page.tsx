import { redirect } from 'next/navigation';
import { isAdmin, isAdminConfigured } from '../../_lib/admin-auth';
import AdminLoginForm from '../../_components/admin-login-form';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect('/llm/course10/admin');
  }
  const configured = isAdminConfigured();

  return (
    <div className="max-w-sm mx-auto">
      <header className="text-center mb-8">
        <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#75695b] mb-2">
          Adgang
        </p>
        <h2 className="display text-3xl text-[#2a2723]">Admin</h2>
        <p className="text-sm text-[#6b6358] mt-2">
          Adgang til reset af demo-data og kommende admin-handlinger.
        </p>
      </header>

      {configured ? (
        <AdminLoginForm />
      ) : (
        <div className="bg-[#f1e3c0] border border-[#d9c189] text-[#7a5a1e] px-4 py-3 rounded-md text-sm">
          Admin er ikke konfigureret. Tilføj{' '}
          <code className="font-mono text-xs">ENGESTOFTE_ADMIN_PASSWORD</code> i{' '}
          <code className="font-mono text-xs">.env.local</code> og genstart serveren.
        </div>
      )}
    </div>
  );
}

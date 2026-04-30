import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { isFirebaseConfigured } from '../lib/firebase';
import AdminBookings from '../components/admin/AdminBookings';
import AdminProducts from '../components/admin/AdminProducts';
import AdminSettings from '../components/admin/AdminSettings';

type Tab = 'bookings' | 'products' | 'settings';

export default function AdminPage() {
  const { user, isAdmin, loading, signInWithGoogle, signOutNow } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');

  if (!isFirebaseConfigured) {
    return (
      <div className="empty">
        <h2>Firebase not configured.</h2>
        <p>The admin panel needs Firebase. See README → Phase 2 setup.</p>
        <Link to="/" className="btn btn-primary">Back to catalog</Link>
      </div>
    );
  }

  if (loading) {
    return <div className="empty"><h2>Loading…</h2></div>;
  }

  if (!user) {
    return (
      <div className="empty">
        <h2>Admin sign-in</h2>
        <p>Sign in with the Google account that owns this rental kit.</p>
        <button className="btn btn-primary" onClick={() => signInWithGoogle()}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="empty">
        <h2>Not authorised.</h2>
        <p>
          The account <code>{user.email}</code> is not on the admin list. Sign in with the admin
          email or update <code>VITE_ADMIN_EMAILS</code> in your environment.
        </p>
        <button className="btn btn-ghost" onClick={() => signOutNow()}>Sign out</button>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin-head">
        <h1>Admin</h1>
        <div className="admin-user">
          <span className="muted small">{user.email}</span>
          <button className="link" onClick={() => signOutNow()}>Sign out</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`tab ${tab === 'bookings' ? 'tab-active' : ''}`} onClick={() => setTab('bookings')}>Bookings</button>
        <button className={`tab ${tab === 'products' ? 'tab-active' : ''}`} onClick={() => setTab('products')}>Products</button>
        <button className={`tab ${tab === 'settings' ? 'tab-active' : ''}`} onClick={() => setTab('settings')}>Settings</button>
      </div>

      {tab === 'bookings' && <AdminBookings />}
      {tab === 'products' && <AdminProducts />}
      {tab === 'settings' && <AdminSettings />}
    </div>
  );
}

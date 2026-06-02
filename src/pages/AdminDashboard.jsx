import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  getParticipants, deleteParticipant, getSettings, getActivity, getTransactions, getStats,
} from '../api';
import TierBadge from '../components/TierBadge';
import BadgesDisplay from '../components/BadgesDisplay';
import ParticipantModal from '../components/ParticipantModal';
import SettingsModal from '../components/SettingsModal';

const CLIENT_URL = window.location.origin;

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm p-5">
      <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-[#0f0f0f]">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activity, setActivity] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [participantModal, setParticipantModal] = useState({ open: false, participant: null });
  const [settingsModal, setSettingsModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [p, s, a, t, st] = await Promise.all([
        getParticipants(), getSettings(), getActivity(), getTransactions(), getStats(),
      ]);
      setParticipants(p.data);
      setSettings(s.data);
      setActivity(a.data);
      setTransactions(t.data);
      setStats(st.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    try {
      await deleteParticipant(id);
      toast.success('Participant removed');
      setDeleteConfirm(null);
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const copyLink = (token) => {
    navigator.clipboard.writeText(`${CLIENT_URL}/p/${token}`)
      .then(() => toast.success('Link copied'));
  };

  const formatCurrency = (amount) => {
    const currency = 'NGN';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4f2]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#737373] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const TABS = [['leaderboard', 'Leaderboard'], ['activity', 'Activity'], ['transactions', 'Payments']];

  return (
    <div className="min-h-screen bg-[#f6f4f2]">
      {/* Header */}
      <header className="bg-white border-b border-[#e4e4e4] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-[#0f0f0f] text-lg tracking-tight">Dating Leaderboard</h1>
            <p className="text-xs text-[#9ca3af]">Admin Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsModal(true)}
              className="hidden sm:block text-sm text-[#374151] font-medium px-3 py-1.5 rounded-lg border border-[#e4e4e4] hover:bg-[#fafaf8] transition"
            >
              Pricing
            </button>
            <button
              onClick={logout}
              className="text-sm text-[#9ca3af] font-medium px-3 py-1.5 rounded-lg border border-[#e4e4e4] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Participants" value={stats.total_participants || 0} />
          <StatCard label="Revenue" value={formatCurrency(stats.total_revenue)} />
          <StatCard label="Total Boosts" value={stats.total_boosts || 0} />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-[#eeece9] p-1 rounded-xl w-fit">
          {TABS.map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${activeTab === tab ? 'bg-white text-[#DC2626] shadow-sm' : 'text-[#737373] hover:text-[#374151]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ─── Leaderboard tab ─── */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#0f0f0f]">Participants ({participants.length})</h2>
              <div className="flex gap-2">
                <button onClick={() => setSettingsModal(true)} className="sm:hidden text-sm text-[#374151] border border-[#e4e4e4] px-3 py-2 rounded-xl hover:bg-[#fafaf8] transition">
                  Pricing
                </button>
                <button
                  onClick={() => setParticipantModal({ open: true, participant: null })}
                  className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e4e4e4] p-12 text-center">
                <p className="text-[#737373] font-medium">No participants yet</p>
                <p className="text-sm text-[#9ca3af] mt-1">Add your first participant to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-[#e4e4e4] shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      {/* Rank */}
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0
                        ${p.rank_position <= 3 ? `rank-${p.rank_position}` : 'bg-[#f3f0ee] text-[#374151]'}`}>
                        {p.rank_position}
                      </span>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-bold text-[#0f0f0f] text-sm">{p.name}</p>
                            <p className="text-xs text-[#9ca3af]">{p.email}</p>
                            {p.badges?.length > 0 && <div className="mt-1"><BadgesDisplay badges={p.badges} /></div>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <TierBadge tier={p.tier} size="sm" />
                            <span className="font-bold text-sm text-[#374151]">
                              {Math.round(p.rating)}<span className="text-xs text-[#9ca3af] font-normal">/80</span>
                            </span>
                          </div>
                        </div>

                        {p.comment && (
                          <p className="text-sm text-[#737373] mt-2">{p.comment}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => copyLink(p.unique_token)} className="text-xs text-[#DC2626] border border-[#FECACA] px-3 py-1.5 rounded-lg hover:bg-[#FEF2F2] transition font-medium">
                            Copy Link
                          </button>
                          <button onClick={() => setParticipantModal({ open: true, participant: p })} className="text-xs text-[#374151] border border-[#e4e4e4] px-3 py-1.5 rounded-lg hover:bg-[#fafaf8] transition font-medium">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(p)} className="text-xs text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Activity tab ─── */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm p-5">
            <h2 className="font-bold text-[#0f0f0f] mb-4">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-[#9ca3af] text-sm text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {activity.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 py-2 border-b border-[#f3f0ee] last:border-0">
                    <div className="w-8 h-8 bg-[#FEF2F2] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#DC2626] tracking-wide">
                        {(a.action_type || 'act').slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#374151]">{a.message}</p>
                      <span className="text-xs text-[#9ca3af]">{timeAgo(a.created_at)}</span>
                    </div>
                    {a.old_rank && a.new_rank && a.old_rank !== a.new_rank && (
                      <span className="text-xs font-bold text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] px-2 py-0.5 rounded-full shrink-0">
                        +{a.old_rank - a.new_rank}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Transactions tab ─── */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-[#e4e4e4] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#e4e4e4]">
              <h2 className="font-bold text-[#0f0f0f]">Payment Transactions</h2>
            </div>
            {transactions.length === 0 ? (
              <p className="text-[#9ca3af] text-sm text-center py-8">No transactions yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#fafaf8] border-b border-[#e4e4e4]">
                    <tr>
                      {['Participant', 'Boost', 'Amount', 'Status', 'Date'].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f3f0ee]">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-[#fafaf8] transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[#0f0f0f]">{t.participant_name}</td>
                        <td className="px-4 py-3 text-sm text-[#374151] capitalize">{t.boost_type}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-[#0f0f0f]">{formatCurrency(t.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                            ${t.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200'
                              : t.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#9ca3af]">{timeAgo(t.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ParticipantModal
        open={participantModal.open}
        participant={participantModal.participant}
        totalParticipants={participants.length}
        onClose={() => setParticipantModal({ open: false, participant: null })}
        onSaved={fetchAll}
      />

      <SettingsModal
        open={settingsModal}
        settings={settings}
        onClose={() => setSettingsModal(false)}
        onSaved={fetchAll}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl border border-[#e4e4e4] p-6 max-w-sm w-full z-10 shadow-xl"
          >
            <h3 className="text-base font-bold text-[#0f0f0f] mb-2">Remove {deleteConfirm.name}?</h3>
            <p className="text-sm text-[#737373] mb-6">This will permanently remove them from the leaderboard and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-[#e4e4e4] rounded-xl text-[#374151] font-medium text-sm hover:bg-[#fafaf8] transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition">
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

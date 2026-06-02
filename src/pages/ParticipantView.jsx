import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getParticipantData } from '../api';
import Leaderboard from '../components/Leaderboard';
import TopThreeCards from '../components/TopThreeCards';
import BoostModal from '../components/BoostModal';

import ConfettiEffect from '../components/ConfettiEffect';

export default function ParticipantView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rankJustChanged, setRankJustChanged] = useState(false);
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const prevRankRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getParticipantData(token);
      const newData = res.data;

      if (prevRankRef.current !== null && prevRankRef.current !== newData.participant.rank_position) {
        setRankJustChanged(true);
        setTimeout(() => setRankJustChanged(false), 1500);
        if (newData.participant.rank_position === 1) setShowConfetti(true);
      }
      prevRankRef.current = newData.participant.rank_position;
      setData(newData);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'This link is invalid or has expired.'
          : 'Failed to load your dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBoostSuccess = useCallback(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f4f2] gap-3">
        <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#9ca3af] text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4f2] p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-lg font-bold text-[#0f0f0f] mb-2">Invalid Link</h2>
          <p className="text-[#737373] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { participant, leaderboard, activity, settings } = data;

  return (
    <div className="min-h-screen bg-[#f6f4f2]">
      <ConfettiEffect active={showConfetti} />

      {/* Rank-up toast banner */}
      <AnimatePresence>
        {rankJustChanged && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-[#DC2626] text-white px-6 py-2.5 rounded-xl shadow-lg font-semibold text-sm tracking-tight"
          >
            You moved to #{participant.rank_position}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-[#e4e4e4] sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-black text-[#0f0f0f] text-base tracking-tight">Dating Leaderboard</span>
          <div className="flex items-center gap-2 border border-[#e4e4e4] px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-[#DC2626] rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#DC2626]">Live</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-14">

        {/* Top 3 podium */}
        {leaderboard.length >= 1 && (
          <TopThreeCards leaderboard={leaderboard} participantId={participant.id} />
        )}

        <div>
          <h3 className="font-bold text-[#0f0f0f] mb-3">Full Leaderboard</h3>
          <Leaderboard
            leaderboard={leaderboard}
            highlightId={participant.id}
            onBoostClick={() => setBoostModalOpen(true)}
          />
        </div>

        <BoostModal
          open={boostModalOpen}
          onClose={() => setBoostModalOpen(false)}
          token={token}
          settings={settings}
          currentRank={participant.rank_position}
          onBoostSuccess={handleBoostSuccess}
        />

        <p className="text-center text-xs text-[#D4AAAA] pt-2">
          Dating Leaderboard
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Search,
  Trash2,
  Lightbulb,
  Sparkles,
  Lock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchSavedFeedbackBookmarks,
  deleteSavedFeedbackBookmark,
} from '../services/firestoreService';
import { SavedFeedbackItem } from '../types/interview';

export const SavedFlashcards: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const [bookmarks, setBookmarks] = useState<SavedFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      loadBookmarks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadBookmarks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchSavedFeedbackBookmarks(user.uid);
      setBookmarks(data);
    } catch (err) {
      console.warn('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId: string) => {
    try {
      await deleteSavedFeedbackBookmark(feedbackId);
      setBookmarks((prev) => prev.filter((b) => b.feedbackId !== feedbackId));
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Sign In to Access Saved Insights</h2>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6">
          Bookmark high-bar model answers and AI coaching takeaways during your interviews to review anytime before your real interviews.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="m3-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md"
        >
          <span>Sign In With Google</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const filtered = bookmarks.filter(
    (b) =>
      b.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.keyTakeaway.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BookmarkCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Revision Vault</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Saved Coaching Cards & Model Answers</h2>
          <p className="text-xs text-on-surface-variant">
            Test yourself with flashcards or review benchmark answers before your actual interview.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search saved cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-on-surface-variant">Loading flashcards from Cloud Firestore...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="m3-card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-on-surface">No Saved Insights Yet</h3>
          <p className="text-xs text-on-surface-variant">
            During any mock interview, click "Bookmark Key Insight" on the evaluation card to save model answers and takeaways here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => {
            const isFlipped = flippedCards[item.feedbackId];

            return (
              <div
                key={item.feedbackId}
                className="m3-card p-5 flex flex-col justify-between border border-outline-variant/60 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
                      {item.category || 'Competency'}
                    </span>
                    <button
                      onClick={() => handleDelete(item.feedbackId)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-surface-container transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-on-surface mb-3 leading-snug">
                    "{item.questionText}"
                  </h4>

                  {!isFlipped ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-on-surface space-y-1 mb-3">
                      <span className="font-bold text-[#825500] flex items-center gap-1 text-[11px] uppercase">
                        <Lightbulb className="w-3.5 h-3.5" />
                        Key Coaching Takeaway:
                      </span>
                      <p className="leading-relaxed text-xs">{item.keyTakeaway}</p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs text-on-surface space-y-1 mb-3">
                      <span className="font-bold text-primary flex items-center gap-1 text-[11px] uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        Model Benchmark Answer:
                      </span>
                      <p className="leading-relaxed whitespace-pre-line text-xs">
                        {item.modelAnswer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-on-surface-variant">
                    Saved {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => toggleFlip(item.feedbackId)}
                    className="font-semibold text-primary hover:underline text-xs"
                  >
                    {isFlipped ? 'Show Coaching Tip' : 'Show Model Answer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

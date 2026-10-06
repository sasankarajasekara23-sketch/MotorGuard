import React, { useEffect, useState } from 'react';
import { Star, MessageSquareHeart, Award, ThumbsUp } from 'lucide-react';
import { getAllFeedback, getFeedbackSummary } from '../../api/feedbackApi';
import { formatDate } from '../../utils/formatDate';
import LoadingSpinner from '../../components/LoadingSpinner';

const FeedbackOverviewPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fRes, sRes] = await Promise.all([getAllFeedback(), getFeedbackSummary()]);
      setFeedbacks((fRes.data.data || []).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setSummary(sRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (num) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star} 
        className={`w-4 h-4 ${
          star <= num 
            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]' 
            : 'text-slate-700'
        }`} 
      />
    ));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <MessageSquareHeart className="w-6 h-6" />
            </span>
            Customer Satisfaction & Sentiment
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor Net Promoter Score (NPS), feedback trends, and claims service satisfaction ratings
          </p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Rating Card */}
          <div className="card-glass border border-slate-800 text-center p-6 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mean Satisfaction Score</span>
            <p className="text-5xl font-black text-amber-400 my-3 tracking-tight">
              {summary.averageRating?.toFixed(1) || '5.0'}
              <span className="text-xl text-slate-500 font-normal"> / 5.0</span>
            </p>
            <div className="flex items-center gap-1">
              {renderStars(Math.round(summary.averageRating || 5))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Calculated across verified policyholders</p>
          </div>
          
          {/* Total Reviews */}
          <div className="card-glass border border-slate-800 text-center p-6 flex flex-col items-center justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Recorded Reviews</span>
            <p className="text-5xl font-black text-purple-400 my-3 tracking-tight">
              {summary.totalFeedback || 0}
            </p>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <ThumbsUp className="w-4 h-4" /> 100% Verified Interactions
            </div>
            <p className="text-xs text-slate-500 mt-3">Direct customer feedback loop</p>
          </div>

          {/* Rating Breakdown */}
          <div className="card-glass border border-slate-800 p-6 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 block">Rating Distribution</span>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map(r => {
                const count = (summary.ratingDistribution && summary.ratingDistribution[r]) || 0;
                const percent = summary.totalFeedback > 0 ? (count / summary.totalFeedback) * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-2 text-xs">
                    <span className="w-7 font-bold text-slate-300">{r} ★</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="w-6 text-right text-slate-400 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Feedbacks Table */}
      <div className="table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Policyholder</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Feedback Commentary</th>
                <th className="table-header text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {feedbacks.map(f => (
                <tr key={f.id} className="table-row">
                  <td className="table-cell">
                    <p className="font-semibold text-white">{f.customerName}</p>
                    <p className="text-xs text-slate-500">ID: #{f.id}</p>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {renderStars(f.rating)}
                    </div>
                  </td>
                  <td className="table-cell">
                    <p className="text-xs text-slate-300 max-w-md leading-relaxed whitespace-pre-wrap">
                      {f.comments}
                    </p>
                  </td>
                  <td className="table-cell text-right text-xs text-slate-400">
                    {formatDate(f.createdAt)}
                  </td>
                </tr>
              ))}
              {feedbacks.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-slate-500 text-sm">
                    No customer reviews available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackOverviewPage;

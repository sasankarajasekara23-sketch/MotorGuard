import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Star, Trash2, MessageSquareHeart, Send, HeartHandshake } from 'lucide-react';
import { getMyFeedback, submitFeedback, deleteFeedback } from '../../api/feedbackApi';
import { formatDate } from '../../utils/formatDate';
import { FEEDBACK_TOPICS, withTag, splitTag } from '../../utils/insurance';
import LoadingSpinner from '../../components/LoadingSpinner';

const TOPIC_KEYS = FEEDBACK_TOPICS.map(t => t.key);
const topicIcon = (tag) => FEEDBACK_TOPICS.find(t => t.key === tag)?.icon;

const FeedbackPage = () => {
  const [topic, setTopic] = useState('Claims');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await getMyFeedback();
      setFeedbacks(res.data.data);
    } catch (err) {
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await submitFeedback({ rating, comments: withTag(topic, data.comments) });
      toast.success('Thank you! Your feedback has been submitted.');
      reset();
      setTopic('Claims');
      setRating(5);
      fetchFeedbacks();
    } catch (err) {
      toast.error('Failed to submit feedback');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await deleteFeedback(id);
      toast.success('Feedback removed');
      fetchFeedbacks();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const renderStars = (num, interactive = false) => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isFilled = interactive 
        ? star <= (hoverRating || rating)
        : star <= num;

      return (
        <Star 
          key={star} 
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`w-6 h-6 transition-all duration-150 ${
            interactive ? 'cursor-pointer hover:scale-125' : ''
          } ${
            isFilled 
              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
              : 'text-slate-700'
          }`} 
        />
      );
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <HeartHandshake className="w-6 h-6" />
            </span>
            Feedback & Satisfaction
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Help us improve MotorGuard by sharing your claims, policies, and service experience
          </p>
        </div>
      </div>

      {/* Submit Card */}
      <div className="card-glass border border-slate-800 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Overall Experience Rating</label>
            <div className="flex items-center gap-2 py-1">
              {renderStars(rating, true)}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700 ml-2">
                {rating === 5 ? 'Exceptional ★★★★★' :
                 rating === 4 ? 'Great ★★★★' :
                 rating === 3 ? 'Average ★★★' :
                 rating === 2 ? 'Poor ★★' : 'Critical ★'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">What is your feedback about?</label>
            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TOPICS.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTopic(t.key)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    topic === t.key
                      ? 'border-purple-500/60 bg-purple-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.icon} {t.key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Your Comments & Suggestions</label>
            <textarea 
              {...register("comments")} 
              required 
              rows="4" 
              className="input-field"
              placeholder="Tell us what you liked or how we can improve our response time..."
            ></textarea>
          </div>

          <button type="submit" className="btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit Feedback
          </button>
        </form>
      </div>

      {/* Previous Submissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquareHeart className="w-5 h-5 text-purple-400" />
          Your Submitted Feedback ({feedbacks.length})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbacks.map(f => (
            <div key={f.id} className="card p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex items-center gap-1.5">{renderStars(f.rating)}</div>
                  <button 
                    onClick={() => handleDelete(f.id)} 
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Delete feedback"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {(() => {
                  const { tag, body } = splitTag(f.comments, TOPIC_KEYS);
                  return (
                    <>
                      {tag && <span className="badge-purple mb-2">{topicIcon(tag)} {tag}</span>}
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{body}</p>
                    </>
                  );
                })()}
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Submitted on</span>
                <span>{formatDate(f.createdAt)}</span>
              </div>
            </div>
          ))}

          {feedbacks.length === 0 && (
            <div className="col-span-full card text-center py-10 border-dashed border-slate-800">
              <p className="text-sm text-slate-400">You have not submitted any feedback yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;

import { isoToRelative } from '../api/api.js';
import { useApi } from '../context/ApiContext.jsx';

export default function PostCard({ post, onSelect }) {
  const { username, likePost } = useApi();
  const liked = false; // Backend spec doesn't expose per-user like, cannot derive; keep button idempotent
  const handleLike = () => {
    if (!username) return;
    likePost(post.id, liked).catch(() => {});
  };
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <button onClick={() => onSelect && onSelect(post.id)} style={usernameBtn} aria-label="View post detail">
          {post.username}
        </button>
        <span style={timeStyle}>{isoToRelative(post.createdAt)}</span>
      </div>
      <p style={contentStyle}>{post.content}</p>
      <div style={metaStyle}>
        <button onClick={handleLike} disabled={!username} style={likeBtnStyle} aria-label="Like post">👍 {post.likesCount}</button>
        <button onClick={() => onSelect && onSelect(post.id)} style={commentsBtn} aria-label="View comments">
          {post.commentsCount} comments
        </button>
      </div>
    </div>
  );
}

const cardStyle = { border: '1px solid #FFFFFF', borderRadius: 20, padding: 16, background: '#E5A000', color: '#000', display: 'flex', flexDirection: 'column', gap: 8 };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 };
const timeStyle = { fontSize: 12, opacity: 0.8 };
const contentStyle = { margin: 0, whiteSpace: 'pre-wrap' };
const metaStyle = { display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 };
const likeBtnStyle = { background: '#00B7FF', color: '#FFF', border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' };
const usernameBtn = { background: 'transparent', border: 'none', padding: 0, margin: 0, fontWeight: 'bold', cursor: 'pointer', color: '#000', fontSize: 14 };
const commentsBtn = { background: 'transparent', border: 'none', cursor: 'pointer', color: '#000', fontSize: 14, textDecoration: 'underline' };

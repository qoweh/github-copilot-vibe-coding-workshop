import { useEffect, useState } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { getPostById, isoToRelative } from '../api/api.js';
import CommentList from './CommentList.jsx';
import CommentForm from './CommentForm.jsx';

// Full post detail with comments and ability to comment / edit/delete own post
export default function PostDetail({ postId, onBack }) {
  const { username, likePost, updatePost, deletePost } = useApi();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await getPostById(postId);
      setPost(data);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const liked = false; // cannot derive per-user

  const handleLike = async () => {
    if (!username) return;
    await likePost(postId, liked);
    await load();
  };

  const startEdit = () => {
    setEditContent(post.content);
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = async () => {
    if (!username || !editContent.trim()) return;
    setBusy(true);
    try {
      await updatePost(postId, editContent.trim());
      setEditing(false);
      await load();
    } finally {
      setBusy(false);
    }
  };
  const handleDelete = async () => {
    if (!username) return;
    if (!confirm('Delete this post?')) return;
    setBusy(true);
    try {
      await deletePost(postId);
      onBack && onBack();
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div style={pad}>Loading post...</div>;
  if (error) return <div style={pad}>Failed to load post. <button onClick={load}>Retry</button></div>;
  if (!post) return null;

  return (
    <div style={wrapStyle}>
      <button onClick={onBack} style={backBtn} aria-label="Back to posts">← Back</button>
      <div style={postCard}>
        <div style={postHeader}>
          <strong>{post.username}</strong>
          <span style={timeStyle}>{isoToRelative(post.createdAt)}</span>
        </div>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} maxLength={2000} style={editTa} disabled={busy} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={cancelEdit} disabled={busy} style={secondaryBtn}>Cancel</button>
              <button onClick={saveEdit} disabled={busy || !editContent.trim()} style={primaryBtn}>{busy ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        ) : (
          <p style={postContent}>{post.content}</p>
        )}
        <div style={postMeta}>
          <button onClick={handleLike} disabled={!username} style={likeBtn} aria-label="Like post detail">👍 {post.likesCount}</button>
          <span>{post.commentsCount} comments</span>
        </div>
        {username === post.username && !editing && (
          <div style={editRow}>
            <button onClick={startEdit} style={smallBtn}>Edit</button>
            <button onClick={handleDelete} style={dangerBtn} disabled={busy}>{busy ? 'Deleting...' : 'Delete'}</button>
          </div>
        )}
      </div>
      <section style={commentsSection} aria-label="Comments section">
        <h3 style={commentsHeader}>Comments</h3>
        {username && <CommentForm postId={postId} onSubmitted={load} />}
        <CommentList postId={postId} />
      </section>
    </div>
  );
}

const wrapStyle = { display: 'flex', flexDirection: 'column', gap: 32 };
const pad = { padding: 16 };
const backBtn = { alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#005', cursor: 'pointer', fontSize: 14, padding: 4 };
const postCard = { border: '1px solid #FFFFFF', borderRadius: 20, padding: 16, background: '#E5A000', color: '#000', display: 'flex', flexDirection: 'column', gap: 12 };
const postHeader = { display: 'flex', justifyContent: 'space-between', fontSize: 14 };
const timeStyle = { fontSize: 12, opacity: 0.8 };
const postContent = { margin: 0, whiteSpace: 'pre-wrap' };
const postMeta = { display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 };
const likeBtn = { background: '#00B7FF', color: '#FFF', border: 'none', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' };
const editRow = { display: 'flex', gap: 8 };
const smallBtn = { background: '#00B7FF', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
const dangerBtn = { ...smallBtn, background: '#C62828' };
const commentsSection = { display: 'flex', flexDirection: 'column', gap: 16 };
const commentsHeader = { margin: 0, fontSize: 18 };
const editTa = { width: '100%', minHeight: 120, resize: 'vertical', padding: 8, borderRadius: 12, border: '1px solid #999', fontFamily: 'inherit' };
const primaryBtn = { background: '#00B7FF', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer' };
const secondaryBtn = { background: '#ccc', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer' };

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../context/ApiContext.jsx';
import { isoToRelative } from '../api/api.js';
import CommentForm from './CommentForm.jsx';

// Displays list of comments for a given postId
export default function CommentList({ postId }) {
  const { getCommentsByPostId, username, updateComment, deleteComment } = useApi();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const data = await getCommentsByPostId(postId);
      setComments(data || []);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [getCommentsByPostId, postId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStartEdit = (id) => setEditingId(id);
  const handleCancelEdit = () => setEditingId(null);

  const handleSaveEdit = async (commentId, content) => {
    if (!username) return;
    setUpdating(true);
    try {
      await updateComment(postId, commentId, content);
      setEditingId(null);
      await load();
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!username) return;
    if (!confirm('Delete this comment?')) return; // basic confirmation
    setUpdating(true);
    try {
      await deleteComment(postId, commentId);
      await load();
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={infoStyle}>Loading comments...</div>;
  if (error) return <div style={errorStyle}>Failed to load comments <button onClick={load}>Retry</button></div>;
  if (!comments.length) return <div style={infoStyle}>No comments yet.</div>;

  return (
    <ul style={listStyle} aria-label="Comments list">
      {comments.map(c => (
        <li key={c.id} style={itemWrapStyle}>
          {editingId === c.id ? (
            <CommentForm
              mode="edit"
              initialValue={c.content}
              disabled={updating}
              onSubmit={(val) => handleSaveEdit(c.id, val)}
              onCancel={handleCancelEdit}
              submitLabel={updating ? 'Saving...' : 'Save'}
            />
          ) : (
            <div style={commentBodyStyle}>
              <div style={commentMetaStyle}>
                <strong>{c.username}</strong>
                <span style={timeStyle}>{isoToRelative(c.createdAt)}</span>
              </div>
              <p style={commentTextStyle}>{c.content}</p>
              {username === c.username && (
                <div style={actionsStyle}>
                  <button onClick={() => handleStartEdit(c.id)} disabled={updating} aria-label="Edit comment" style={smallBtn}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} disabled={updating} aria-label="Delete comment" style={dangerBtn}>Delete</button>
                </div>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

const listStyle = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 };
const infoStyle = { padding: 8, fontSize: 14 };
const errorStyle = { padding: 8, fontSize: 14, color: '#B00020' };
const itemWrapStyle = { border: '1px solid #fff', background: '#FFD25E', borderRadius: 14, padding: 12 };
const commentBodyStyle = { display: 'flex', flexDirection: 'column', gap: 4 };
const commentMetaStyle = { display: 'flex', justifyContent: 'space-between', fontSize: 12 };
const timeStyle = { opacity: 0.7 };
const commentTextStyle = { margin: 0, fontSize: 14, whiteSpace: 'pre-wrap' };
const actionsStyle = { display: 'flex', gap: 8, marginTop: 4 };
const smallBtn = { background: '#00B7FF', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
const dangerBtn = { ...smallBtn, background: '#C62828' };

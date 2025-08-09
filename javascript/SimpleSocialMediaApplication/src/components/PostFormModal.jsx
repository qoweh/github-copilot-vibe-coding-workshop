import { useState } from 'react';
import { useApi } from '../context/ApiContext.jsx';

export default function PostFormModal({ open, onClose }) {
  const { createPost, username } = useApi();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await createPost(content.trim());
      setContent('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Create Post">
      <form onSubmit={handleSubmit} style={modalStyle}>
        <h2 style={titleStyle}>How do you feel today?</h2>
        <textarea
          style={textareaStyle}
          value={content}
            onChange={(e) => setContent(e.target.value)}
          aria-label="Post content"
          minLength={1}
          maxLength={2000}
          required
          disabled={!username || submitting}
        />
        <div style={actionsStyle}>
          <button type="button" onClick={onClose} style={secondaryBtnStyle} disabled={submitting}>Cancel</button>
          <button type="submit" style={primaryBtnStyle} disabled={!username || submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: '#FFFFFF', borderRadius: 20, width: 851, padding: '40px 76px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 };
const titleStyle = { margin: 0, fontSize: 24, color: '#606060' };
const textareaStyle = { width: '100%', height: 238, borderRadius: 10, border: '1px solid #D9D9D9', padding: 16, fontSize: 16, resize: 'vertical' };
const actionsStyle = { display: 'flex', justifyContent: 'space-between', gap: 24 };
const primaryBtnStyle = { background: '#00B7FF', color: '#FFF', border: 'none', borderRadius: 10, padding: '10px 80px', fontSize: 20, cursor: 'pointer' };
const secondaryBtnStyle = { background: '#CCF1FF', color: '#000', border: 'none', borderRadius: 10, padding: '10px 80px', fontSize: 20, cursor: 'pointer' };

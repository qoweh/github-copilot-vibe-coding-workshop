import { useState } from 'react';
import { useApi } from '../context/ApiContext.jsx';

// Form to add or edit a comment
export default function CommentForm({ postId, onSubmitted, mode = 'create', initialValue = '', onCancel, disabled = false, submitLabel }) {
  const { createComment } = useApi();
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === 'edit';
  const label = submitLabel || (isEdit ? 'Save' : 'Comment');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (isEdit) {
      // In edit mode the parent passes onSubmit via onSubmitted prop; we just call it
      onSubmitted && onSubmitted(content.trim());
      return;
    }
    setSubmitting(true);
    try {
      await createComment(postId, content.trim());
      setContent('');
      onSubmitted && onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle} aria-label={isEdit ? 'Edit comment form' : 'New comment form'}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        maxLength={1000}
        placeholder={isEdit ? 'Edit your comment' : 'Write a comment'}
        style={taStyle}
        disabled={disabled || submitting}
      />
      <div style={rowStyle}>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={disabled || submitting} style={secondaryBtn}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={disabled || submitting || !content.trim()} style={primaryBtn}>
          {submitting ? (isEdit ? 'Saving...' : 'Posting...') : label}
        </button>
      </div>
    </form>
  );
}

const formStyle = { display: 'flex', flexDirection: 'column', gap: 8 };
const taStyle = { width: '100%', minHeight: 70, resize: 'vertical', padding: 8, borderRadius: 10, border: '1px solid #999', fontFamily: 'inherit' };
const rowStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8 };
const primaryBtn = { background: '#00B7FF', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer' };
const secondaryBtn = { background: '#ccc', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 10, cursor: 'pointer' };

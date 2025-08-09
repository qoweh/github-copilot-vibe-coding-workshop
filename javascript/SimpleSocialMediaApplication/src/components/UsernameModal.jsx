import { useState } from 'react';
import { useApi } from '../context/ApiContext.jsx';

export default function UsernameModal() {
  const { username, setUsername } = useApi();
  const [value, setValue] = useState('');
  if (username) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    setUsername(value.trim());
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="Enter Username" style={overlayStyle}>
      <form onSubmit={handleSubmit} style={modalStyle}>
        <h2 style={titleStyle}>Enter your username</h2>
        <input
          style={inputStyle}
          aria-label="Username"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          minLength={1}
          maxLength={50}
          required
          placeholder="UserName"
        />
        <button type="submit" style={primaryBtnStyle}>OK</button>
      </form>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle = { background: '#FFFFFF', borderRadius: 20, width: 538, padding: '40px 46px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 24 };
const titleStyle = { margin: 0, fontSize: 24, color: '#000' };
const inputStyle = { width: '100%', height: 56, borderRadius: 10, border: '1px solid #D9D9D9', padding: '0 16px', fontSize: 18 };
const primaryBtnStyle = { background: '#00B7FF', color: '#FFF', border: 'none', borderRadius: 10, padding: '10px 80px', alignSelf: 'center', fontSize: 20, cursor: 'pointer' };

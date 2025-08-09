export default function NavBar({ onNew }) {
  return (
    <nav style={navStyle} aria-label="Main navigation">
      <button style={iconBtn} aria-label="Home" tabIndex={0}>🏠</button>
      <button style={iconBtn} aria-label="Search" tabIndex={0}>🔍</button>
      <button style={iconBtn} aria-label="Profile" tabIndex={0}>👤</button>
      <button style={iconBtn} aria-label="Close" tabIndex={0}>✖️</button>
      <div style={spacer} />
      <button style={plusBtn} onClick={onNew} aria-label="Create Post" tabIndex={0}>＋</button>
    </nav>
  );
}

const navStyle = { position: 'fixed', top: 0, left: 0, bottom: 0, width: 110, background: '#E5A000', borderRadius: 20, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 147 };
const iconBtn = { background: 'transparent', border: 'none', fontSize: 32, cursor: 'pointer' };
const plusBtn = { background: 'transparent', border: 'none', fontSize: 48, cursor: 'pointer' };
const spacer = { flex: 1 };

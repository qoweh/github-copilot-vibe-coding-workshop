import { useApi } from '../context/ApiContext.jsx';

export default function ApiStatusBanner() {
  const { apiUp } = useApi();
  if (apiUp) return null;
  return (
    <div role="status" aria-live="assertive" style={barStyle}>
      Backend API unreachable. Some actions may not work.
    </div>
  );
}

const barStyle = { position: 'fixed', top: 0, left: 0, right: 0, background: '#B00020', color: '#FFF', padding: '8px 16px', textAlign: 'center', fontSize: 14, zIndex: 1100 };

export default function FabNewPost({ onClick }) {
  return (
    <button onClick={onClick} style={fabStyle} aria-label="Create Post" tabIndex={0}>＋</button>
  );
}

const fabStyle = { position: 'fixed', bottom: 32, right: 32, width: 72, height: 72, borderRadius: '50%', background: '#E5A000', color: '#000', fontSize: 40, border: '2px solid #FFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

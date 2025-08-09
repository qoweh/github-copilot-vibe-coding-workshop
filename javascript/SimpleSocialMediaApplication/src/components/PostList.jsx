import { useApi } from '../context/ApiContext.jsx';
import PostCard from './PostCard.jsx';

export default function PostList({ onSelect }) {
  const { posts, loadingPosts, lastError, refreshPosts } = useApi();
  if (loadingPosts) return <div style={infoStyle}>Loading posts...</div>;
  if (lastError) return <div style={errorStyle}>Failed to load posts <button onClick={refreshPosts}>Retry</button></div>;
  if (!posts.length) return <div style={infoStyle}>No posts yet.</div>;
  return (
    <div style={listStyle}>
  {posts.map(p => <PostCard key={p.id} post={p} onSelect={onSelect} />)}
    </div>
  );
}

const listStyle = { display: 'flex', flexDirection: 'column', gap: 16 };
const infoStyle = { padding: 16, color: '#000' };
const errorStyle = { padding: 16, color: '#B00020' };

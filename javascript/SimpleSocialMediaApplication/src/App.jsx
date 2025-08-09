import './index.css';
import { ApiProvider } from './context/ApiContext.jsx';
import UsernameModal from './components/UsernameModal.jsx';
import ApiStatusBanner from './components/ApiStatusBanner.jsx';
import PostList from './components/PostList.jsx';
import PostDetail from './components/PostDetail.jsx';
import PostFormModal from './components/PostFormModal.jsx';
import FabNewPost from './components/FabNewPost.jsx';
import NavBar from './components/NavBar.jsx';
import { useState } from 'react';

function Shell() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  return (
    <div style={shellStyle}>
      <NavBar onNew={() => setShowPostModal(true)} />
      <div style={contentWrap}>
        {selectedPostId ? (
          <PostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />
        ) : (
          <PostList onSelect={(id) => setSelectedPostId(id)} />
        )}
      </div>
      <FabNewPost onClick={() => setShowPostModal(true)} />
      <PostFormModal open={showPostModal} onClose={() => setShowPostModal(false)} />
      <UsernameModal />
      <ApiStatusBanner />
    </div>
  );
}

export default function App() {
  return (
    <ApiProvider>
      <Shell />
    </ApiProvider>
  );
}

const shellStyle = { display: 'flex' };
const contentWrap = { marginLeft: 130, padding: '40px 40px 120px', maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 24 };

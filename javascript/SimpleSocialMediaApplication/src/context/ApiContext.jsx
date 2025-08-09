import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
	getPosts,
	getCommentsByPostId,
	createPost,
	createComment,
	likePost,
	unlikePost,
	updatePost,
	updateComment,
	deletePost,
	deleteComment
} from '../api/api.js';

const ApiContext = createContext(null);

export function ApiProvider({ children }) {
	const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
	const [posts, setPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(false);
	const [apiUp, setApiUp] = useState(true);
	const [lastError, setLastError] = useState(null);

	const refreshPosts = useCallback(async () => {
		setLoadingPosts(true);
		try {
			const data = await getPosts();
			setPosts(data || []);
			setLastError(null);
		} catch (e) {
			setLastError(e);
		} finally {
			setLoadingPosts(false);
		}
	}, []);


	// Initial load + polling via spec-defined endpoint only
	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			try {
				await refreshPosts();
				if (!cancelled) setApiUp(true);
			} catch (e) {
				if (!cancelled) setApiUp(false);
			}
		};
		load();
		const interval = setInterval(load, 15000); // periodic refresh + availability check
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [refreshPosts]);

	const handleSetUsername = (value) => {
		setUsername(value);
		localStorage.setItem('username', value);
	};

	const handleCreatePost = async (content) => {
		if (!username) return;
		const body = { username, content };
		await createPost(body);
		await refreshPosts();
	};

	const handleUpdatePost = async (postId, content) => {
		if (!username) return;
		await updatePost(postId, { username, content });
		await refreshPosts();
	};

	const handleDeletePost = async (postId) => {
		if (!username) return;
		await deletePost(postId, username);
		await refreshPosts();
	};

	const handleLikePost = async (postId, liked) => {
		if (!username) return;
		if (liked) {
			await unlikePost(postId);
		} else {
			await likePost(postId, { username });
		}
		await refreshPosts();
	};

	const handleCreateComment = async (postId, content) => {
		if (!username) return;
		await createComment(postId, { username, content });
		await refreshPosts();
	};

	const handleUpdateComment = async (postId, commentId, content) => {
		if (!username) return;
		await updateComment(postId, commentId, { username, content });
		await refreshPosts();
	};

	const handleDeleteComment = async (postId, commentId) => {
		if (!username) return;
		await deleteComment(postId, commentId, username);
		await refreshPosts();
	};

	const value = {
		username,
		setUsername: handleSetUsername,
		posts,
		loadingPosts,
		apiUp,
		lastError,
		refreshPosts,
		createPost: handleCreatePost,
		updatePost: handleUpdatePost,
		deletePost: handleDeletePost,
		likePost: handleLikePost,
		createComment: handleCreateComment,
		updateComment: handleUpdateComment,
		deleteComment: handleDeleteComment,
		getCommentsByPostId
	};
	return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
	const ctx = useContext(ApiContext);
	if (!ctx) throw new Error('useApi must be used within ApiProvider');
	return ctx;
}


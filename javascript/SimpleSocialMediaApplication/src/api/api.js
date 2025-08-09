// API client for endpoints defined in openapi.yaml (no extras)
// Assumption: backend is served at http://localhost:8000 without the /api prefix from servers.url
export const API_BASE = 'http://localhost:8000';

// Shared JSON fetch helper
async function request(path, options = {}) {
	const url = `${API_BASE}${path}`;
	try {
		const res = await fetch(url, {
			headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
			...options
		});
		if (res.status === 204) return null; // No Content
		const text = await res.text();
		const data = text ? JSON.parse(text) : null;
		if (!res.ok) {
			const err = new Error(data?.message || `Request failed with ${res.status}`);
			err.status = res.status;
			err.payload = data;
			throw err;
		}
		return data;
	} catch (e) {
		if (e.name === 'TypeError' && e.message.includes('fetch')) {
			const err = new Error('NETWORK_ERROR');
			err.cause = e;
			throw err;
		}
		throw e;
	}
}

// Posts
export const getPosts = () => request('/posts');
export const createPost = (body) => request('/posts', { method: 'POST', body: JSON.stringify(body) });
export const getPostById = (postId) => request(`/posts/${postId}`);
export const updatePost = (postId, body) => request(`/posts/${postId}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deletePost = (postId, username) => request(`/posts/${postId}`, { method: 'DELETE', headers: username ? { 'X-Username': username } : {} });

// Comments
export const getCommentsByPostId = (postId) => request(`/posts/${postId}/comments`);
export const createComment = (postId, body) => request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) });
export const getCommentById = (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`);
export const updateComment = (postId, commentId, body) => request(`/posts/${postId}/comments/${commentId}`, { method: 'PATCH', body: JSON.stringify(body) });
export const deleteComment = (postId, commentId, username) => request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE', headers: username ? { 'X-Username': username } : {} });

// Likes
export const likePost = (postId, body) => request(`/posts/${postId}/likes`, { method: 'POST', body: JSON.stringify(body) });
export const unlikePost = (postId) => request(`/posts/${postId}/likes`, { method: 'DELETE' });

export function isoToRelative(iso) {
	if (!iso) return '';
	const date = new Date(iso);
	const diffMs = Date.now() - date.getTime();
	const diffMin = Math.floor(diffMs / 60000);
	if (diffMin < 1) return 'just now';
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffH = Math.floor(diffMin / 60);
	if (diffH < 24) return `${diffH}h ago`;
	const diffD = Math.floor(diffH / 24);
	return `${diffD}d ago`;
}

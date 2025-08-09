from fastapi import FastAPI, HTTPException, APIRouter, Body, Path, status
from pydantic import BaseModel, Field
from typing import List
from uuid import uuid4
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import sqlite3
import yaml
from pathlib import Path

SPEC_PATH = Path(__file__).parent / "openapi.yaml"

DB_NAME = "sns_api.db"


def init_database() -> None:
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS likes (
                post_id TEXT NOT NULL,
                username TEXT NOT NULL,
                liked_at TEXT NOT NULL,
                PRIMARY KEY(post_id, username),
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
            """
        )
        conn.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[unused-argument]
    # Startup
    init_database()
    yield
    # Shutdown (placeholder)

app = FastAPI(title="Simple Social Media API (WIP)", lifespan=lifespan)

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


def _load_openapi_spec() -> dict:
    if not SPEC_PATH.exists():
        raise HTTPException(status_code=500, detail="Spec file missing")
    with SPEC_PATH.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def custom_openapi():  # FastAPI will call this for /openapi.json and Swagger UI
    if app.openapi_schema:  # cache
        return app.openapi_schema
    spec = _load_openapi_spec()
    app.openapi_schema = spec
    return app.openapi_schema


app.openapi = custom_openapi  # type: ignore[assignment]

# ==========================================================
# Data Models (Pydantic) – aligned with openapi.yaml shapes
# ==========================================================

class PostModel(BaseModel):
    id: str
    username: str
    content: str
    createdAt: str
    updatedAt: str
    likesCount: int
    commentsCount: int


class NewPostRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    content: str = Field(..., min_length=1, max_length=2000)


class UpdatePostRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    content: str = Field(..., min_length=1, max_length=2000)


class CommentModel(BaseModel):
    id: str
    postId: str
    username: str
    content: str
    createdAt: str
    updatedAt: str


class NewCommentRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    content: str = Field(..., min_length=1, max_length=1000)


class UpdateCommentRequest(NewCommentRequest):
    pass


class LikeRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


def _row_to_post(row, likes_count: int, comments_count: int) -> PostModel:
    return PostModel(
        id=row[0],
        username=row[1],
        content=row[2],
        createdAt=row[3],
        updatedAt=row[4],
        likesCount=likes_count,
        commentsCount=comments_count,
    )


def _row_to_comment(row) -> CommentModel:
    return CommentModel(
        id=row[0],
        postId=row[1],
        username=row[2],
        content=row[3],
        createdAt=row[4],
        updatedAt=row[5],
    )


router = APIRouter(prefix="/api")


# ---------------------------- Posts ----------------------------
@router.get("/posts", response_model=List[PostModel])
def list_posts():
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM posts ORDER BY datetime(created_at) DESC")
        rows = cur.fetchall()
        posts: List[PostModel] = []
        for r in rows:
            post_id = r[0]
            cur.execute("SELECT COUNT(*) FROM likes WHERE post_id=?", (post_id,))
            likes_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM comments WHERE post_id=?", (post_id,))
            comments_count = cur.fetchone()[0]
            posts.append(_row_to_post(r, likes_count, comments_count))
        return posts


@router.post("/posts", response_model=PostModel, status_code=status.HTTP_201_CREATED)
def create_post(payload: NewPostRequest):
    post_id = str(uuid4())
    now = _utc_now_iso()
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO posts (id, username, content, created_at, updated_at) VALUES (?,?,?,?,?)",
            (post_id, payload.username, payload.content, now, now),
        )
        conn.commit()
    return _row_to_post((post_id, payload.username, payload.content, now, now), 0, 0)


def _get_post_row(cur, post_id: str):
    cur.execute("SELECT * FROM posts WHERE id=?", (post_id,))
    return cur.fetchone()


@router.get("/posts/{postId}", response_model=PostModel)
def get_post(postId: str = Path(...)):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        row = _get_post_row(cur, postId)
        if not row:
            raise HTTPException(status_code=404, detail="Post not found")
        cur.execute("SELECT COUNT(*) FROM likes WHERE post_id=?", (postId,))
        likes_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM comments WHERE post_id=?", (postId,))
        comments_count = cur.fetchone()[0]
        return _row_to_post(row, likes_count, comments_count)


@router.patch("/posts/{postId}", response_model=PostModel)
def update_post(postId: str, payload: UpdatePostRequest):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        row = _get_post_row(cur, postId)
        if not row:
            raise HTTPException(status_code=404, detail="Post not found")
        # Ownership check (best-effort)
        if row[1] != payload.username:
            raise HTTPException(status_code=400, detail="Username mismatch")
        now = _utc_now_iso()
        cur.execute("UPDATE posts SET content=?, updated_at=? WHERE id=?", (payload.content, now, postId))
        conn.commit()
        cur.execute("SELECT COUNT(*) FROM likes WHERE post_id=?", (postId,))
        likes_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM comments WHERE post_id=?", (postId,))
        comments_count = cur.fetchone()[0]
        return _row_to_post((postId, row[1], payload.content, row[3], now), likes_count, comments_count)


@router.delete("/posts/{postId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(postId: str):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM posts WHERE id=?", (postId,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        conn.commit()
    return None


# -------------------------- Comments --------------------------
@router.get("/posts/{postId}/comments", response_model=List[CommentModel])
def list_comments(postId: str):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        if not _get_post_row(cur, postId):
            raise HTTPException(status_code=404, detail="Post not found")
        cur.execute("SELECT * FROM comments WHERE post_id=? ORDER BY datetime(created_at) ASC", (postId,))
        rows = cur.fetchall()
        return [_row_to_comment(r) for r in rows]


@router.post("/posts/{postId}/comments", response_model=CommentModel, status_code=status.HTTP_201_CREATED)
def create_comment(postId: str, payload: NewCommentRequest):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        if not _get_post_row(cur, postId):
            raise HTTPException(status_code=404, detail="Post not found")
        comment_id = str(uuid4())
        now = _utc_now_iso()
        cur.execute(
            "INSERT INTO comments (id, post_id, username, content, created_at, updated_at) VALUES (?,?,?,?,?,?)",
            (comment_id, postId, payload.username, payload.content, now, now),
        )
        conn.commit()
        return _row_to_comment((comment_id, postId, payload.username, payload.content, now, now))


def _get_comment_row(cur, post_id: str, comment_id: str):
    cur.execute("SELECT * FROM comments WHERE id=? AND post_id=?", (comment_id, post_id))
    return cur.fetchone()


@router.get("/posts/{postId}/comments/{commentId}", response_model=CommentModel)
def get_comment(postId: str, commentId: str):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        row = _get_comment_row(cur, postId, commentId)
        if not row:
            raise HTTPException(status_code=404, detail="Comment not found")
        return _row_to_comment(row)


@router.patch("/posts/{postId}/comments/{commentId}", response_model=CommentModel)
def update_comment(postId: str, commentId: str, payload: UpdateCommentRequest):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        row = _get_comment_row(cur, postId, commentId)
        if not row:
            raise HTTPException(status_code=404, detail="Comment not found")
        if row[2] != payload.username:
            raise HTTPException(status_code=400, detail="Username mismatch")
        now = _utc_now_iso()
        cur.execute("UPDATE comments SET content=?, updated_at=? WHERE id=?", (payload.content, now, commentId))
        conn.commit()
        return _row_to_comment((row[0], row[1], row[2], payload.content, row[4], now))


@router.delete("/posts/{postId}/comments/{commentId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(postId: str, commentId: str):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM comments WHERE id=? AND post_id=?", (commentId, postId))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Comment not found")
        conn.commit()
    return None


# ---------------------------- Likes ----------------------------
@router.post("/posts/{postId}/likes", status_code=status.HTTP_201_CREATED)
def like_post(postId: str, payload: LikeRequest):
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        if not _get_post_row(cur, postId):
            raise HTTPException(status_code=404, detail="Post not found")
        now = _utc_now_iso()
        try:
            cur.execute(
                "INSERT INTO likes (post_id, username, liked_at) VALUES (?,?,?)",
                (postId, payload.username, now),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            # already liked -> idempotent per simple approach
            pass
    return {"postId": postId, "username": payload.username, "likedAt": now}


@router.delete("/posts/{postId}/likes", status_code=status.HTTP_204_NO_CONTENT)
def unlike_post(postId: str, username: str = Body(None)):
    # Username may be omitted by some clients; if provided attempt targeted removal.
    with sqlite3.connect(DB_NAME) as conn:
        cur = conn.cursor()
        if username:
            cur.execute("DELETE FROM likes WHERE post_id=? AND username=?", (postId, username))
        else:
            # If username not provided, remove all likes for post (fallback) – minimal since spec doesn't define body for DELETE
            cur.execute("DELETE FROM likes WHERE post_id=?", (postId,))
        conn.commit()
    return None


app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

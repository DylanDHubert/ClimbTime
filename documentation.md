# API Documentation

This document provides a comprehensive guide to all API endpoints available in the application.

## Table of Contents

- [Authentication](#authentication)
- [Posts](#posts)
  - [Create & Retrieve Posts](#create--retrieve-posts)
  - [Post Likes](#post-likes)
  - [Post Comments](#post-comments)
  - [Post Sharing](#post-sharing)
  - [User Posts](#user-posts)
  - [Post Search](#post-search)
- [Users](#users)
  - [User Search](#user-search)
  - [Suggested Users](#suggested-users)
  - [Followers](#followers)
  - [Mutual Followers](#mutual-followers)
- [Profile](#profile)
- [Messages](#messages)
  - [Conversations](#conversations)
  - [Conversation Messages](#conversation-messages)
  - [Unread Messages](#unread-messages)
- [Follow](#follow)
- [File Upload](#file-upload)

## Authentication

### NextAuth Routes

Authentication is handled by NextAuth.js, which provides several endpoints:

```
/api/auth/signin
/api/auth/signout
/api/auth/callback
/api/auth/session
/api/auth/csrf
```

These endpoints handle authentication flows, session management, and CSRF protection.

## Posts

### Create & Retrieve Posts

**Endpoint:** `POST /api/posts`

**Description:** Creates a new post.

**Authentication:** Required

**Request Body:**
```json
{
  "content": "String (1-500 characters)",
  "imageUrl": "String (optional)"
}
```

**Response:**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "string",
    "content": "string",
    "imageUrl": "string (optional)",
    "createdAt": "datetime",
    "user": {
      "id": "string",
      "name": "string",
      "image": "string"
    }
  }
}
```

**Status Codes:**
- `201`: Post created successfully
- `400`: Invalid input
- `401`: Unauthorized
- `500`: Server error

---

**Endpoint:** `GET /api/posts`

**Description:** Retrieves all posts or filtered posts based on query parameters.

**Authentication:** Optional (provides personalized results when authenticated)

**Query Parameters:**
- `feedType`: String
  - `following`: Shows posts from users the authenticated user follows
  - If not provided, shows all posts

**Response:**
```json
[
  {
    "id": "string",
    "content": "string",
    "imageUrl": "string (optional)",
    "createdAt": "datetime",
    "user": {
      "id": "string",
      "name": "string",
      "image": "string"
    },
    "_count": {
      "likes": "number",
      "comments": "number",
      "shares": "number"
    }
  }
]
```

**Status Codes:**
- `200`: Success
- `500`: Server error

### Post Likes

**Endpoint:** `POST /api/posts/like`

**Description:** Likes or unlikes a post (toggles).

**Authentication:** Required

**Request Body:**
```json
{
  "postId": "string"
}
```

**Response:**
```json
{
  "message": "Post liked successfully" | "Post unliked successfully",
  "liked": true | false
}
```

**Status Codes:**
- `200`: Post unliked successfully
- `201`: Post liked successfully
- `400`: Invalid input
- `401`: Unauthorized
- `404`: Post not found
- `500`: Server error

---

**Endpoint:** `GET /api/posts/like`

**Description:** Gets like status and count for a post.

**Authentication:** Optional (provides personalized results when authenticated)

**Query Parameters:**
- `postId`: String (required)

**Response:**
```json
{
  "likeCount": "number",
  "isLiked": "boolean"
}
```

**Status Codes:**
- `200`: Success
- `400`: Post ID is required
- `500`: Server error

### Post Comments

**Endpoint:** `POST /api/posts/comment`

**Description:** Adds a comment to a post.

**Authentication:** Required

**Request Body:**
```json
{
  "postId": "string",
  "content": "string"
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "comment": {
    "id": "string",
    "content": "string",
    "createdAt": "datetime",
    "user": {
      "id": "string",
      "name": "string",
      "image": "string"
    }
  }
}
```

**Status Codes:**
- `201`: Comment added successfully
- `400`: Invalid input
- `401`: Unauthorized
- `404`: Post not found
- `500`: Server error

---

**Endpoint:** `GET /api/posts/comment`

**Description:** Gets comments for a post.

**Query Parameters:**
- `postId`: String (required)

**Response:**
```json
[
  {
    "id": "string",
    "content": "string",
    "createdAt": "datetime",
    "user": {
      "id": "string",
      "name": "string",
      "image": "string"
    }
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: Post ID is required
- `500`: Server error

### Post Sharing

**Endpoint:** `POST /api/posts/share`

**Description:** Shares a post.

**Authentication:** Required

**Request Body:**
```json
{
  "postId": "string"
}
```

**Response:**
```json
{
  "message": "Post shared successfully",
  "share": {
    "id": "string",
    "createdAt": "datetime"
  }
}
```

**Status Codes:**
- `201`: Post shared successfully
- `400`: Invalid input
- `401`: Unauthorized
- `404`: Post not found
- `500`: Server error

### User Posts

**Endpoint:** `GET /api/posts/user`

**Description:** Gets posts by a specific user.

**Query Parameters:**
- `userId`: String (required)

**Response:**
```json
[
  {
    "id": "string",
    "content": "string",
    "imageUrl": "string (optional)",
    "createdAt": "datetime",
    "user": {
      "id": "string",
      "name": "string",
      "image": "string"
    },
    "_count": {
      "likes": "number",
      "comments": "number",
      "shares": "number"
    }
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: User ID is required
- `500`: Server error

### Post Search

**Endpoint:** `GET /api/posts/search`

**Description:** Searches for posts based on content.

**Query Parameters:**
- `q`: String (search query)

**Response:**
```json
[
  {
    "id": "string",
    "content": "string",
    "imageUrl": "string (optional)",
    "createdAt": "datetime",
    "user": {
      "id": "string",
      "name": "string",
      "image": "string"
    },
    "_count": {
      "likes": "number",
      "comments": "number",
      "shares": "number"
    }
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: Search query is required
- `500`: Server error

## Users

### User Search

**Endpoint:** `GET /api/users/search`

**Description:** Searches for users by name.

**Query Parameters:**
- `q`: String (search query)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "image": "string",
    "_count": {
      "followers": "number",
      "following": "number"
    }
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: Search query is required
- `500`: Server error

### Suggested Users

**Endpoint:** `GET /api/users/suggested`

**Description:** Gets suggested users to follow.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "image": "string",
    "_count": {
      "followers": "number",
      "following": "number"
    },
    "isFollowing": "boolean"
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

### Followers

**Endpoint:** `GET /api/users/followers`

**Description:** Gets a user's followers.

**Query Parameters:**
- `userId`: String (required)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "image": "string",
    "isFollowing": "boolean"
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: User ID is required
- `500`: Server error

### Mutual Followers

**Endpoint:** `GET /api/users/mutual-followers`

**Description:** Gets mutual followers between the authenticated user and another user.

**Authentication:** Required

**Query Parameters:**
- `userId`: String (required)

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "image": "string"
  }
]
```

**Status Codes:**
- `200`: Success
- `400`: User ID is required
- `401`: Unauthorized
- `500`: Server error

## Profile

**Endpoint:** `GET /api/profile`

**Description:** Gets a user's profile information.

**Query Parameters:**
- `userId`: String (optional - defaults to authenticated user if not provided)

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "image": "string",
  "bio": "string",
  "createdAt": "datetime",
  "_count": {
    "followers": "number",
    "following": "number",
    "posts": "number"
  },
  "isFollowing": "boolean"
}
```

**Status Codes:**
- `200`: Success
- `404`: User not found
- `500`: Server error

---

**Endpoint:** `PUT /api/profile`

**Description:** Updates the authenticated user's profile.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "string (optional)",
  "bio": "string (optional)",
  "image": "string (optional)"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string",
    "bio": "string"
  }
}
```

**Status Codes:**
- `200`: Profile updated successfully
- `400`: Invalid input
- `401`: Unauthorized
- `500`: Server error

## Messages

**Endpoint:** `GET /api/messages`

**Description:** Gets all conversations for the authenticated user.

**Authentication:** Required

**Response:**
```json
[
  {
    "id": "string",
    "participants": [
      {
        "id": "string",
        "name": "string",
        "image": "string"
      }
    ],
    "latestMessage": {
      "id": "string",
      "content": "string",
      "createdAt": "datetime",
      "isRead": "boolean"
    },
    "unreadCount": "number"
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

### Conversation Messages

**Endpoint:** `GET /api/messages/[conversationId]`

**Description:** Gets messages for a specific conversation.

**Authentication:** Required

**Path Parameters:**
- `conversationId`: String (required)

**Response:**
```json
[
  {
    "id": "string",
    "content": "string",
    "createdAt": "datetime",
    "senderId": "string",
    "isRead": "boolean"
  }
]
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Conversation not found
- `500`: Server error

---

**Endpoint:** `POST /api/messages/[conversationId]`

**Description:** Sends a message in a conversation.

**Authentication:** Required

**Path Parameters:**
- `conversationId`: String (required)

**Request Body:**
```json
{
  "content": "string"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "string",
    "content": "string",
    "createdAt": "datetime",
    "senderId": "string",
    "isRead": "boolean"
  }
}
```

**Status Codes:**
- `201`: Message sent successfully
- `400`: Invalid input
- `401`: Unauthorized
- `404`: Conversation not found
- `500`: Server error

### Conversation

**Endpoint:** `POST /api/messages/conversation`

**Description:** Creates a new conversation or gets an existing one.

**Authentication:** Required

**Request Body:**
```json
{
  "participantId": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "participants": [
    {
      "id": "string",
      "name": "string",
      "image": "string"
    }
  ]
}
```

**Status Codes:**
- `200`: Success (existing conversation found)
- `201`: Success (new conversation created)
- `400`: Invalid input
- `401`: Unauthorized
- `500`: Server error

### Unread Messages

**Endpoint:** `GET /api/messages/unread`

**Description:** Gets the count of unread messages for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "unreadCount": "number"
}
```

**Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `500`: Server error

## Follow

**Endpoint:** `POST /api/follow`

**Description:** Follows or unfollows a user (toggles).

**Authentication:** Required

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response:**
```json
{
  "message": "User followed successfully" | "User unfollowed successfully",
  "isFollowing": true | false
}
```

**Status Codes:**
- `200`: Success (unfollowed)
- `201`: Success (followed)
- `400`: Invalid input
- `401`: Unauthorized
- `404`: User not found
- `500`: Server error

## File Upload

**Endpoint:** `POST /api/uploadthing`

**Description:** Uploads files using UploadThing service.

**Authentication:** Required

**Request:** Multipart form data

**Response:**
```json
{
  "success": "boolean",
  "fileUrl": "string"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid file
- `401`: Unauthorized
- `500`: Server error

---

*Note: All API responses include appropriate status codes and error messages for different scenarios. Authentication is handled through NextAuth.js sessions.* 
# Blog Portfolio - Backend

Express API with MongoDB (Mongoose) and Firebase Admin for token verification.

```bash
npm install
cp .env.example .env    # fill in the values
npm run seed            # optional sample blogs
npm run dev
```

| Method | Route | Access |
|---|---|---|
| GET | `/api/blogs` | public |
| GET | `/api/blogs/:id` | public |
| PATCH | `/api/blogs/:id/like` | logged in |
| POST | `/api/blogs` | admin |
| PUT | `/api/blogs/:id` | admin |
| DELETE | `/api/blogs/:id` | admin |
| GET | `/api/auth/me` | logged in |

Admins are the emails listed in `ADMIN_EMAILS`. Deploying to Vercel: see the main README.

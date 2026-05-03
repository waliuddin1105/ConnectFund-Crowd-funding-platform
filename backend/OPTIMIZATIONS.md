# Backend Optimizations – ConnectFund

This document describes every backend optimization applied to the ConnectFund crowdfunding platform. All changes are **non-breaking** and fully backward-compatible with the existing frontend.

---

## Table of Contents

1. [Database Indexing](#1-database-indexing)
2. [Caching Strategy (Flask-Caching)](#2-caching-strategy-flask-caching)
3. [Response Compression (Flask-Compress)](#3-response-compression-flask-compress)
4. [API Response Optimization – Pagination](#4-api-response-optimization--pagination)
5. [Eliminating N+1 Queries](#5-eliminating-n1-queries)
6. [Rate Limiting](#6-rate-limiting)
7. [New Files & Where to Find Them](#7-new-files--where-to-find-them)
8. [Configuration Reference](#8-configuration-reference)
9. [Upgrading to Redis](#9-upgrading-to-redis)

---

## 1. Database Indexing

Indexes were added directly in the SQLAlchemy models (`backend/api/models/cf_models.py`) using `__table_args__`. Indexes are created automatically when `db.create_all()` is called on a fresh database, and applied via `flask db upgrade` on an existing one.

| Table | Index name | Columns | Reason |
|---|---|---|---|
| `users` | `ix_users_role` | `role` | Fast role-based filtering (`donor`, `creator`, `admin`) |
| `campaigns` | `ix_campaigns_status` | `status` | Most queries filter by status |
| `campaigns` | `ix_campaigns_creator_id` | `creator_id` | Creator dashboard & listing |
| `campaigns` | `ix_campaigns_category` | `category` | Category-based browsing/filtering |
| `campaigns` | `ix_campaigns_raised_amount` | `raised_amount` | Sorting for highest-funded list |
| `campaigns` | `ix_campaigns_status_creator` | `(status, creator_id)` | Composite — active campaigns per creator |
| `donations` | `ix_donations_user_id` | `user_id` | Donor history & stats |
| `donations` | `ix_donations_campaign_id` | `campaign_id` | Campaign donation aggregates |
| `donations` | `ix_donations_user_campaign` | `(user_id, campaign_id)` | Composite — supporter lookups |
| `donations` | `ix_donations_created_at` | `created_at` | Date-ordered queries / recent donations |
| `follows` | `ix_follows_user_id` | `user_id` | Donor following list |
| `follows` | `ix_follows_campaign_id` | `campaign_id` | Campaign follower count |
| `follows` | `uq_follows_user_campaign` | `(user_id, campaign_id)` | Unique constraint – prevents duplicate follows |
| `comments` | `ix_comments_campaign_id` | `campaign_id` | Per-campaign comment fetch |
| `comments` | `ix_comments_user_id` | `user_id` | User's own comments |
| `payments` | `ix_payments_donation_id` | `donation_id` | Payment → donation join |
| `payments` | `ix_payments_status` | `payment_status` | Filtering by payment status |
| `admin_reviews` | `ix_admin_reviews_campaign_id` | `campaign_id` | Latest review per campaign |
| `admin_reviews` | `ix_admin_reviews_admin_id` | `admin_id` | Admin activity lookup |

> **Note:** The duplicate `liked_comments` relationship defined three times in `Users` was reduced to a single, correct definition (the `lazy="dynamic"` variant is kept).

---

## 2. Caching Strategy (Flask-Caching)

**New helper:** `backend/api/helpers/cache_helper.py`

Uses **Flask-Caching** with `SimpleCache` (in-process, zero-config) by default. The implementation is storage-agnostic — switching to Redis requires a one-line config change (see [Upgrading to Redis](#9-upgrading-to-redis)).

### Cached endpoints

| Endpoint | Cache key | TTL | Invalidated by |
|---|---|---|---|
| `GET /campaigns/fully-funded` | `fully_funded_campaigns` | 5 min | Campaign create / delete |
| `GET /campaigns/stats` | `campaign_stats` | 3 min | Campaign create / delete, new donation |
| `GET /campaigns/admin-key-stats` | `admin_key_stats` | 2 min | Campaign create / delete, new donation |
| `GET /campaigns/highest-funded` | `highest_funded` | 5 min | Campaign create / delete, new donation |
| `GET /donations/donor-stats/<donor_id>` | `donor_stats_<id>` | 3 min | New donation by same donor |

### Cache invalidation

Mutations that change the cached data call `cache.delete(key)` immediately after `db.session.commit()`:

- `POST /campaigns/create` → invalidates `fully_funded_campaigns`, `campaign_stats`, `admin_key_stats`
- `DELETE /campaigns/delete-campaign/<id>` → invalidates all four cache keys above
- `POST /donations` → invalidates `donor_stats_<donor_id>`, `campaign_stats`, `admin_key_stats`, `highest_funded`

---

## 3. Response Compression (Flask-Compress)

**Flask-Compress** was added to `backend/api/__init__.py`. It transparently compresses JSON (and other text) responses using **gzip** or **brotli** (chosen automatically based on the client's `Accept-Encoding` header).

Configuration:

```python
app.config["COMPRESS_REGISTER"] = True
app.config["COMPRESS_MIMETYPES"] = ["application/json", "text/html", ...]
app.config["COMPRESS_MIN_SIZE"] = 500   # bytes — only compress responses ≥ 500 B
```

No changes to route handlers are required; compression is applied at the WSGI middleware level.

Typical savings: **50–80 %** reduction in JSON payload size over the wire.

---

## 4. API Response Optimization – Pagination

All list endpoints now accept optional `page` / `per_page` query parameters. When `page` is **not** supplied the endpoint returns the full list exactly as before (100 % backward compatible).

| Endpoint | New query params | Paginated response extras |
|---|---|---|
| `GET /campaigns/` | `page`, `per_page` (default 20, max 100), `category` | `total`, `total_pages` |
| `GET /campaigns/fully-funded` | `page`, `per_page` | `total`, `total_pages` |
| `GET /donations/history/<donor_id>` | `page`, `per_page` | `total`, `total_pages` |
| `GET /comments/get-comments/<campaign_id>` | `page`, `per_page` | `total`, `total_pages` |

### Paginated response shape (example)

```json
{
  "success": true,
  "page": 2,
  "per_page": 20,
  "total": 87,
  "total_pages": 5,
  "campaigns": [ ... ]
}
```

The existing `GET /campaigns/get-creators` and `GET /campaigns/get-donors` endpoints already supported pagination; their `per_page` cap was added (max 100) to prevent accidental over-fetching.

### Category filtering

`GET /campaigns/?category=education` — the new `category` query param allows the frontend to request a single category without downloading the full list.

---

## 5. Eliminating N+1 Queries

Several routes iterated over a list of ORM objects and issued an additional SQL query **per item**. These were replaced with **aggregated subqueries joined back to the parent query** so the entire result set is fetched in at most 2 SQL statements regardless of list size.

### `/campaigns/get-creators`

**Before:** fetch N creators → loop → 2 extra queries per creator (campaign count + total raised) → **2N + 1 queries**

**After:** single `LEFT OUTER JOIN` against a `GROUP BY` subquery → **2 queries total** (count + data page)

### `/campaigns/get-donors`

**Before:** fetch N donors → loop → 2 extra queries per donor → **2N + 1 queries**

**After:** single `LEFT OUTER JOIN` against aggregated `Donations` subquery → **2 queries total**

### `/campaigns/highest-funded`

**Before:** fetch top-5 campaigns → loop → 1 extra `COUNT(DISTINCT user_id)` per campaign → **6 queries**

**After:** single query with `GROUP BY` and `COUNT(DISTINCT)` in the same SELECT → **1 query**

### `/creator/dashboard`

**Before:** fetch active campaigns → loop → 1 `SUM(amount)` query per campaign → **N + 3 queries**

**After:** single aggregated `LEFT OUTER JOIN` across `campaigns` + `donations` with `SUM` and `COUNT(DISTINCT)` → **3 queries total**

### `/creator/campaigns`

**Before:** fetch active campaigns → loop → 1 `COUNT(DISTINCT user_id)` per campaign → **N + 1 queries**

**After:** donor-count subquery joined to campaigns → **1 query**

### `/campaigns/status/rejected` (N+1 for rejection reason)

**Before:** fetch rejected campaigns → loop → 1 `AdminReviews` query per campaign → **N + 1 queries**

**After:** latest-review subquery using `DISTINCT ON (campaign_id)` joined once → **1 query**

### `/campaigns/stats` and `/campaigns/admin-key-stats`

**Before:** 4–7 separate `COUNT`/`SUM` scalar queries.

**After:** aggregated in 1–2 SQL statements using `CASE WHEN` expressions (`sa_case`).

---

## 6. Rate Limiting

**New helper:** `backend/api/helpers/limiter.py`

Uses **Flask-Limiter** (already imported by `admin_reviews.py`). The `limiter` instance is now properly initialised in `api/__init__.py` via `init_limiter(app)`, fixing the previously missing `limiter.py` that caused an `ImportError`.

Default storage: in-memory (development). Set `RATELIMIT_STORAGE_URI = "redis://..."` for production.

---

## 7. New Files & Where to Find Them

```
backend/
├── api/
│   ├── __init__.py                    ← added Flask-Compress, cache, limiter init
│   ├── helpers/
│   │   ├── cache_helper.py            ← NEW — Flask-Caching initialisation & docs
│   │   └── limiter.py                 ← NEW — Flask-Limiter initialisation
│   ├── models/
│   │   └── cf_models.py               ← added __table_args__ indexes to all models
│   └── routes/
│       ├── campaignsRoutes.py         ← N+1 fixes, caching, pagination, category filter
│       ├── creatorDashboardRoutes.py  ← N+1 fixes (dashboard, campaigns, donations)
│       ├── donationRoutes.py          ← per-donor caching, pagination on history
│       └── comments.py                ← pagination on get-comments
└── OPTIMIZATIONS.md                   ← THIS FILE
```

---

## 8. Configuration Reference

All tuneable settings live in `backend/api/__init__.py` (or can be overridden via environment variables when using `app.config.from_envvar`).

| Config key | Default | Description |
|---|---|---|
| `CACHE_TYPE` | `"SimpleCache"` | `"RedisCache"` for Redis |
| `CACHE_DEFAULT_TIMEOUT` | `300` | Seconds before a cached value expires |
| `CACHE_REDIS_URL` | `"redis://localhost:6379/0"` | Only used when `CACHE_TYPE="RedisCache"` |
| `COMPRESS_MIN_SIZE` | `500` | Minimum response bytes before compression kicks in |
| `RATELIMIT_STORAGE_URI` | *(in-memory)* | Redis URI for distributed rate limiting |

---

## 9. Upgrading to Redis

To switch from in-process `SimpleCache` to a real Redis instance:

1. Install the Redis driver:
   ```bash
   pip install redis
   ```

2. Update `backend/api/__init__.py`:
   ```python
   app.config["CACHE_TYPE"] = "RedisCache"
   app.config["CACHE_REDIS_URL"] = "redis://your-redis-host:6379/0"
   ```

3. (Optional) Switch rate-limiter storage:
   ```python
   app.config["RATELIMIT_STORAGE_URI"] = "redis://your-redis-host:6379/1"
   ```

No code changes are required in the route files — the `cache` object from `cache_helper.py` is storage-agnostic.

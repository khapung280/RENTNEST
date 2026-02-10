# Fix MongoDB Atlas Connection (querySrv ENOTFOUND)

The error `querySrv ENOTFOUND _mongodb._tcp.cluster0.hhhudm.mongodb.net` means the **cluster hostname in your `.env` is wrong or that cluster does not exist**. Each Atlas cluster has a unique hostname; you must use the one from your own cluster.

## Steps to fix

### 1. Get your real connection string

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and log in.
2. Open your **Project** → select your **Cluster** (e.g. **Cluster0**).
3. Click **Connect** on the cluster.
4. Choose **Drivers** (or "Connect your application").
5. Select **Node.js** and copy the connection string. It will look like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.XXXXX.mongodb.net/?retryWrites=true&w=majority
   ```
   The part `cluster0.XXXXX.mongodb.net` is your cluster hostname (e.g. `cluster0.abc12xy.mongodb.net`). **Yours may not be `cluster0.hhhudm.mongodb.net`.**

### 2. Update `Backend/.env`

1. Open `Backend/.env`.
2. Set `MONGO_URI` to the string you copied:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.XXXXX.mongodb.net/rentnest?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your **database user password** (the one you set in Atlas for that user).
4. Add the database name if missing: ensure `/rentnest` is before `?` (e.g. `....mongodb.net/rentnest?retryWrites=...`).

### 3. Passwords with special characters

If your password contains `#`, `@`, `%`, `/`, etc., they must be **URL-encoded** in the connection string:

| Character | Replace with |
|-----------|----------------|
| `#`       | `%23`         |
| `@`       | `%40`         |
| `%`       | `%25`         |
| `:`       | `%3A`         |
| `/`       | `%2F`         |

Example: password `Pass#123` → use `Pass%23123` in the URI.

### 4. Network access in Atlas

- In Atlas: **Network Access** → **Add IP Address**.
- For development you can use **Allow Access from Anywhere** (`0.0.0.0/0`).

### 5. Restart the backend

```bash
cd Backend
npm start
```

You should see: **MongoDB Connected Successfully**.

---

**Summary:** The hostname `cluster0.hhhudm.mongodb.net` in your current `.env` is not valid for your cluster. Replace `MONGO_URI` in `.env` with the **exact** connection string from Atlas (Connect → Drivers), then replace `<password>` (with URL encoding if needed) and restart the server.

# Google Maps + Places API Setup

## STEP 1 — Google Cloud Configuration

### 1. Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Open **APIs & Services** → **Library**
4. Search and enable:
   - **Maps JavaScript API** — for map display and markers
   - **Places API** — for nearby places search

### 2. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the key (you will restrict it next)

### 3. Restrict API Key (Security)

1. Click the newly created API key
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add allowed referrers:
     - `http://localhost:5173/*` (local dev)
     - `http://localhost:5174/*` (alternative dev)
     - `https://yourdomain.com/*` (production)
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose only: **Maps JavaScript API** and **Places API**
4. Save

### 4. Security Best Practices

- Never commit API keys to git (use `.env` and `.gitignore`)
- Use separate keys for development and production
- Enable billing alerts in Google Cloud to avoid unexpected charges
- Restrict keys by HTTP referrer and API

---

## STEP 2 — Frontend Package Setup

### 1. Install Package

```bash
npm install @react-google-maps/api
```

### 2. Environment Variable

Create or edit `frontend/.env`:

```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Restart After Adding .env

After adding or changing `.env`:

1. Stop the Vite dev server (Ctrl+C)
2. Start again: `npm run dev`

Vite loads env vars at startup; changes require a restart.

---

## Usage in RentNest

- **PropertyMap** component: map + nearby places (1km)
- Uses `property.latitude` and `property.longitude` only
- No geocoding from district name
- No hardcoded coordinates
- Nearby places are fetched from Places API each time (not stored in MongoDB)

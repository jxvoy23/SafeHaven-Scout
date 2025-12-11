# SafeHaven Scout - Debugging Guide

## "Something Went Wrong" Error - Troubleshooting

If you see "Something went wrong" when trying to search, follow these steps:

### Step 1: Check Your API Key
1. Open `.env.local` in the project root
2. Verify the line exists: `VITE_API_KEY=AIzaSy...`
3. If missing or empty, get a new API key:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key to `.env.local`

### Step 2: Open Developer Console
1. **On Mac**: Press `Cmd + Option + I` or `Cmd + Shift + J`
2. **On Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
3. Go to the **Console** tab
4. Look for red error messages - these are critical clues!

### Step 3: Common Error Messages & Fixes

#### ❌ "API Key is missing"
- **Cause**: `.env.local` doesn't have `VITE_API_KEY`
- **Fix**: Add your key to `.env.local`, then refresh the page (Cmd+R or F5)

#### ❌ "API key authentication failed"
- **Cause**: The API key in `.env.local` is invalid or revoked
- **Fix**: Get a fresh key from [Google AI Studio](https://aistudio.google.com/app/apikey)

#### ❌ "API quota exceeded"
- **Cause**: You've exceeded your free tier limit
- **Fix**: 
  - Check your usage at [Google AI Console](https://console.cloud.google.com)
  - Wait 24 hours for the quota to reset, OR
  - Set up a billing account for higher limits

#### ❌ "Invalid request format sent to Gemini API"
- **Cause**: Possible issue with schema or prompt structure
- **Fix**: This is a bug - check `services/geminiService.ts` for recent changes

#### ❌ Other generic errors
- Check the full error message in the console
- Look at the stack trace (click arrow to expand)

### Step 4: Check Network Activity
1. Open Developer Console → **Network** tab
2. Try searching again
3. Look for requests to `generativelanguage.googleapis.com`
4. Click on any failed requests and check:
   - Status code (401, 403, 400, 500, etc.)
   - Response tab for error details

### Step 5: Restart Everything
If nothing works:
```bash
# Stop the dev server (Ctrl+C in terminal)
# Clear cache and restart
npm run dev
```
Then refresh the browser page (Cmd+R or F5).

### Step 6: Reset Environment
If still stuck:
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

## Debugging Features Enabled ✅

Recent updates added better error tracking:

### 1. **Console Logging**
The Gemini service now logs:
- When API is called with parameters
- When response is received
- Detailed error information with stack traces
- First 200 chars of response for inspection

**Watch for logs like:**
```
Starting Gemini API call with params: {city: "Seattle", state: "WA", ...}
Gemini API call successful, parsing response...
Raw response text: {"summary": "...", ...}
```

### 2. **Better Error Messages**
Error messages now include:
- What went wrong specifically
- Hints about how to fix it
- Reminder to check the console for details

### 3. **Error Boundary**
If a React component crashes:
- Shows "Something went wrong" with a Refresh button
- In development (npm run dev), shows full error details below
- Can see stack trace and error message

## Manual Testing Steps

### Test 1: Verify Environment
1. Open browser console (F12)
2. Type: `import.meta.env.VITE_API_KEY`
3. You should see your API key (partially masked)
4. If it shows `undefined`, the `.env.local` isn't loaded

### Test 2: Verify Firebase
1. Open browser console (F12)
2. Type: `console.log("Firebase loaded")`
3. You should see: `Firebase loaded`

### Test 3: Manual API Call (Advanced)
Paste this in the console to test Gemini directly:
```javascript
import.meta.env.VITE_API_KEY
```
If you see your key, the environment is set up correctly.

## Still Stuck?

1. **Screenshot the error** from the console
2. **Check the error message** displayed on screen
3. **Look at Recent Changes** - did you modify `geminiService.ts`, `firebaseConfig.ts`, or `App.tsx`?
4. **Try a different city/state** - maybe that specific location is causing issues
5. **Check your API quota** - Google Gemini free tier has limits

## Quick Reference: Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Unauthorized (Bad API key) | Check `.env.local` API key |
| 403 | Forbidden (Quota/Billing) | Check Google Cloud Console quota |
| 400 | Bad Request (Invalid input) | Check search parameters |
| 500 | Server Error | Try again in a few minutes |
| UNAUTHENTICATED | Firebase auth failed | Sign out and sign in again |
| PERMISSION_DENIED | Firestore access denied | Check Firebase Security Rules |

---

Last updated: December 2025

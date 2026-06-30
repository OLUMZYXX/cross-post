# Cross-Post Pro — IAP Setup & Submission Checklist

Complete these in order, then build and submit. No secrets live in this file.

Reference values used by the code (do not change without updating code):

- Entitlement id: `pro`
- Product ids: `crosspost_pro_monthly`, `crosspost_pro_6month`, `crosspost_pro_yearly`
- Bundle id: `com.crosspostapp.mobile`
- Webhook path: `POST /api/subscription/webhook`
- Client key env var: `EXPO_PUBLIC_REVENUECAT_IOS_KEY`
- Server env var: `REVENUECAT_WEBHOOK_AUTH`
- Owner (always Pro): `akinwumiemmanuel02@gmail.com` (`PRO_ALLOWLIST_EMAILS`)

Target NGN prices: Monthly ₦5,000 · 6-month ₦24,000 · Yearly ₦43,000 (7-day free trial on yearly).

---

## 1. App Store Connect — create the subscriptions

App Store Connect → your app → **Monetization → Subscriptions**.

1. Create a **Subscription Group**: `Cross-Post Pro`.
2. Add three **auto-renewable** subscriptions:
   - Product ID `crosspost_pro_monthly` — duration 1 month — price ≈ ₦5,000
   - Product ID `crosspost_pro_6month` — duration 6 months — price ≈ ₦24,000
   - Product ID `crosspost_pro_yearly` — duration 1 year — price ≈ ₦43,000
3. On the **yearly** product, add an **Introductory Offer → Free → 7 days**.
4. For each: add localized **display name** + **description**, and a **review screenshot** (a screenshot of the in-app paywall is fine).
5. Status should reach **Ready to Submit** (they get reviewed together with the app build).

## 2. App Store Connect — shared secret

Users and Access → **Integrations → In-App Purchase** → copy the **App-Specific Shared Secret** (you'll paste it into RevenueCat).

## 3. RevenueCat — app, key, entitlement, offering

At https://app.revenuecat.com (browser, not the App Store):

1. **Project settings → Apps → + New app → App Store**, bundle id `com.crosspostapp.mobile`. Paste the **shared secret** from step 2.
2. **Project settings → API keys** → copy the key that starts with **`appl_`** (public). This is the production client key.
3. **Entitlements → + New** → identifier `pro`.
4. **Products** → add/import the 3 App Store products → attach each to the `pro` entitlement.
5. **Offerings** → create one, mark it **current**, add 3 packages using standard types:
   - Monthly (`$rc_monthly`) → `crosspost_pro_monthly`
   - 6 Month (`$rc_six_month`) → `crosspost_pro_6month`
   - Annual (`$rc_annual`) → `crosspost_pro_yearly`

## 4. RevenueCat — webhook

Project settings → **Integrations → Webhooks → + Add**:

- URL: `https://<your-server-domain>/api/subscription/webhook`
- Authorization header: any strong secret string (save it for step 6).

## 5. Client build key (EAS, not .env.local)

`.env.local` is gitignored and not uploaded to EAS, so set the production key as an EAS env var:

```
cd client
eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value appl_XXXX --environment production
```

## 6. Server env + deploy

Set on the server host (Render/Railway/etc.):

```
REVENUECAT_WEBHOOK_AUTH=<the same secret from step 4>
PRO_ALLOWLIST_EMAILS=akinwumiemmanuel02@gmail.com
```

Redeploy the server so the webhook is live.

## 7. Build & submit

```
cd client
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

Then in App Store Connect, on the app **version** page, attach the 3 subscriptions under **In-App Purchases / Subscriptions** and submit them **with** the build for review.

## 8. Test before release

- Use a **Sandbox tester** (Users and Access → Sandbox Testers) on a device, or test via TestFlight.
- Verify: paywall shows 3 plans with NGN prices, purchase unlocks Pro (Twitter/X connect works), Restore Purchases works, and `akinwumiemmanuel02@gmail.com` is Pro without buying.

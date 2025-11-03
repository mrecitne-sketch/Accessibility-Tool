## GitHub App Setup for AllyFix (PR Automation)

Use this guide to enable real “Create PR” from AllyFix using a GitHub App. You can complete it later; nothing else is blocked.

### 1) Create a GitHub App

1. GitHub → Settings → Developer settings → GitHub Apps → New GitHub App
2. Name: anything (e.g., "AllyFix")
3. Homepage URL: your app URL (dev: `http://localhost:3000`)
4. Callback URL (OAuth): `http://localhost:3000/api/github/oauth/callback`
5. Post Installation URL: `http://localhost:3000/api/github/install/callback`
6. Webhook (optional for MVP): skip for now

### 2) Permissions (Repository level)

- Contents: Read and write
- Pull requests: Read and write
- Metadata: Read (default)

Reason: AllyFix needs to create a branch/commit and open a PR.

### 3) Generate credentials

- App ID (copy from App settings)
- Client ID (copy from App settings)
- Client Secret (click “Generate new client secret”)
- Private key (click “Generate a private key”, download the `.pem`)
- App Slug (shown next to the App name, used in install URL)

### 4) Install the App

From your App page, click “Install App”, pick your account/org, and choose which repositories to grant access. After install, GitHub will redirect to AllyFix, which stores the `installation_id`.

### 5) Add environment variables (.env.local)

```
# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GITHUB_APP_SLUG=your-app-slug

# GitHub App (required)
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
...your pem key content...
-----END RSA PRIVATE KEY-----
GITHUB_CLIENT_ID=Iv1.abc123
GITHUB_CLIENT_SECRET=shhhhh-secret

# Optional dev fallback (PAT) – not needed for end users
# GITHUB_TOKEN=ghp_...
```

Notes:
- Keep the PEM exactly as downloaded, including BEGIN/END lines and newlines.
- If your environment has trouble with multiline values, store the PEM in a file and load it into the env at runtime (or escape newlines as `\n`).
- Restart the dev server after changing envs.

### 6) Verify

- Open the scan page: the banner should show “Connect GitHub” linking to `https://github.com/apps/<slug>/installations/new`.
- Install the app → return to AllyFix.
- Select violations → “Create PR” → fill repo (`owner/name`), base branch, new branch → submit.
- You should receive a real PR URL when the installation is valid for that repo.

### FAQ

- Do I need the OAuth flow?
  - We include it for future features (user linking). For PR creation, the installation token is sufficient.

- What repos does AllyFix see?
  - Only those you select during installation (principle of least privilege).

- Can I tighten permissions?
  - You can, but AllyFix requires write access to `contents` and `pull requests` to create branches/PRs.

---

If you get stuck, share your App ID (not secrets) and we can help validate settings.



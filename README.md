# Branch Marketing Console — standalone version

This is a self-contained web app for tracking branch marketing outreach,
lease-based marketing benefits, the content calendar, and assets sent —
for Travelex / Tourvest Forex. It runs entirely outside claude.ai: a small
Node.js server, a PostgreSQL database, and one shared password to keep it
private.

It starts with the same 47 branches and Standard Benefit Defaults as the
Excel tracker and Claude-hosted version.

## What's in this folder

- `server.js` — the web server (routes, login, the data API)
- `db.js` — talks to the Postgres database
- `seedData.js` — the 47 branches used to seed the database on first run
- `public/` — the app itself (HTML, CSS, JS) that runs in your browser
- `render.yaml` — a blueprint that tells Render how to deploy this in one go

## Deploying to Render (free tier)

Render will host both the app and its database for free. The free web
service goes to sleep after 15 minutes with no visitors, and takes 30–50
seconds to wake back up on your next visit — worth knowing for a solo daily
tool, but otherwise no different to use.

**1. Put this folder in a GitHub repository.**
If you don't already use GitHub: create a free account at github.com,
create a new repository (e.g. `branch-marketing-console`), and upload
everything in this folder to it (GitHub's "Add file → Upload files" in
the browser works fine — you don't need any command-line tools).

**2. Create a free Render account.**
Go to render.com and sign up (you can sign up directly with your GitHub
account, which makes step 3 easier). No credit card required for the free
tier.

**3. Create a new Blueprint deployment.**
In the Render dashboard: **New → Blueprint**, then connect the GitHub
repository you created in step 1. Render will read `render.yaml` and
propose creating two things: a web service and a Postgres database.
Click through to create them.

**4. Set your password.**
During setup (or afterwards, under the web service's **Environment** tab),
set the `APP_PASSWORD` environment variable to whatever password you want
to use to sign in. This is the only manual value you need to set —
`DATABASE_URL` and `COOKIE_SECRET` are filled in automatically.

**5. Wait for it to deploy, then open it.**
Render will show a URL like `https://branch-marketing-console.onrender.com`.
Open it, enter the password you set in step 4, and you're in. Bookmark
that URL — it's yours to keep.

## Changing your password later

Go to your web service in the Render dashboard → **Environment** → edit
`APP_PASSWORD` → save. Render will redeploy automatically with the new
password.

## Backing up your data

Click **Export backup** in the app's top bar at any time to download a
JSON snapshot of everything (branches, benefits, calendar, assets). Keep
occasional backups — Render's free database plan is fine for a solo tool
like this, but nothing beats having your own copy.

## Running it locally (optional, for testing)

If you have Node.js and PostgreSQL installed on your own machine:

```
cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres, and pick an APP_PASSWORD
npm install
npm start
```

Then open `http://localhost:3000`.

## A note on the password protection

This app uses one shared password for the whole app rather than individual
accounts, since it's meant for a single person. It's a reasonable level of
protection for an internal working tool, but it isn't bank-grade security —
don't put anything more sensitive than what's already in this tracker
behind it, and don't share the URL and password casually.

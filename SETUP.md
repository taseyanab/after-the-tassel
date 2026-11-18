# After the Tassel

A post grad planning app. Answers and uploaded documents are saved in each visitor's own browser.
The AI plan and the Ask tab run through a Netlify Edge Function that calls the Claude API.

## Deploy

Drag and drop deploys (Netlify Drop) do NOT run edge functions, so use one of these:

### Option A: GitHub (recommended)
1. Unzip this folder and push it to a new GitHub repo.
2. In Netlify: Add new site > Import an existing project > pick the repo.
   Leave the build command empty. Publish directory: `.`
3. Site configuration > Environment variables > add `ANTHROPIC_API_KEY`
   (get one at console.anthropic.com).
4. Deploys > Trigger deploy.

### Option B: Netlify CLI
```
npm install -g netlify-cli
cd after-the-tassel
netlify login
netlify init
netlify env:set ANTHROPIC_API_KEY your_key_here
netlify deploy --prod
```

## Optional settings
- `ANTHROPIC_MODEL` changes the Claude model (default `claude-sonnet-5-5`).

## Costs and safety
Anyone who opens the site uses your API key through the function. Set a monthly
spend limit in the Anthropic Console before sharing the link widely.

## Without a key
The question flow still works. Users get a starter checklist instead of an AI written plan.

import crypto from 'crypto'

// Helpers to work with GitHub App auth
// Required envs:
// - GITHUB_APP_ID
// - GITHUB_APP_PRIVATE_KEY (PEM)
// - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (for user OAuth if needed)

export function createAppJWT(): string {
  const appId = process.env.GITHUB_APP_ID
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY
  if (!appId || !privateKey) throw new Error('GitHub App not configured')

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60, // 9 minutes
    iss: appId,
  }
  const enc = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url')
  const unsigned = `${enc(header)}.${enc(payload)}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  const signature = signer.sign(privateKey, 'base64url')
  return `${unsigned}.${signature}`
}

export async function createInstallationAccessToken(installationId: number): Promise<string> {
  const jwt = createAppJWT()
  const url = `https://api.github.com/app/installations/${installationId}/access_tokens`
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'allyfix-app'
    },
  })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`Failed to create installation token: ${r.status} ${text}`)
  }
  const j = await r.json() as { token: string }
  return j.token
}

export async function createBranchAndPr(params: {
  installationId: number,
  repo: string, // owner/name
  baseBranch: string,
  newBranch: string,
  commitMessage: string,
  files: Array<{ path: string; content: string }>, // full file contents to write
  title: string,
  body?: string,
}): Promise<{ prUrl: string; prNumber: number }> {
  const token = await createInstallationAccessToken(params.installationId)
  const [owner, name] = params.repo.split('/')
  const gh = async (path: string, init?: RequestInit) => {
    const r = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'allyfix-app',
        ...(init?.headers || {}),
      }
    })
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)
    return r.json()
  }

  // 1) Get base branch SHA
  const baseRef = await gh(`/repos/${owner}/${name}/git/ref/heads/${params.baseBranch}`)
  const baseSha = baseRef.object.sha

  // 2) Create new branch
  await gh(`/repos/${owner}/${name}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${params.newBranch}`, sha: baseSha })
  })

  // 3) Create tree with file changes (assumes text files; content should be base64)
  const tree = await gh(`/repos/${owner}/${name}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseSha,
      tree: params.files.map(f => ({ path: f.path, mode: '100644', type: 'blob', content: f.content }))
    })
  })

  // 4) Create commit
  const commit = await gh(`/repos/${owner}/${name}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message: params.commitMessage, tree: tree.sha, parents: [baseSha] })
  })

  // 5) Update branch ref
  await gh(`/repos/${owner}/${name}/git/refs/heads/${params.newBranch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: true })
  })

  // 6) Open PR
  const pr = await gh(`/repos/${owner}/${name}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: params.title,
      head: params.newBranch,
      base: params.baseBranch,
      body: params.body || ''
    })
  })

  return { prUrl: pr.html_url, prNumber: pr.number }
}



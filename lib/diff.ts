// Generate a minimal unified diff with 3 lines of context using a simple LCS-based algorithm
export function generateUnifiedDiff(before: string, after: string, filePath: string = "snippet.html"): string {
  const a = (before || '').split('\n');
  const b = (after || '').split('\n');

  // Compute LCS table
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // Backtrack to build edit script
  type Edit = { type: 'equal' | 'delete' | 'insert'; line: string; ai: number; bi: number };
  const edits: Edit[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      edits.push({ type: 'equal', line: a[i], ai: i, bi: j }); i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      edits.push({ type: 'delete', line: a[i], ai: i, bi: j }); i++;
    } else {
      edits.push({ type: 'insert', line: b[j], ai: i, bi: j }); j++;
    }
  }
  while (i < n) { edits.push({ type: 'delete', line: a[i], ai: i, bi: j }); i++; }
  while (j < m) { edits.push({ type: 'insert', line: b[j], ai: i, bi: j }); j++; }

  // Group into hunks with 3 lines of context
  const context = 3;
  interface Hunk { aStart: number; aLen: number; bStart: number; bLen: number; lines: string[] }
  const hunks: Hunk[] = [];
  let aLine = 1, bLine = 1; // 1-based for headers
  let idx = 0;
  while (idx < edits.length) {
    // Skip equals until a change
    let preContext: string[] = [];
    while (idx < edits.length && edits[idx].type === 'equal') {
      if (preContext.length >= context) preContext.shift();
      preContext.push(' ' + edits[idx].line);
      aLine++; bLine++; idx++;
    }
    if (idx >= edits.length) break;
    // Start new hunk
    const hunkLines: string[] = [...preContext];
    const aStart = aLine - preContext.length;
    const bStart = bLine - preContext.length;
    let aCount = preContext.length;
    let bCount = preContext.length;

    // Consume changes and trailing context
    let trail: string[] = [];
    while (idx < edits.length) {
      const e = edits[idx];
      if (e.type === 'equal') {
        if (trail.length < context) {
          trail.push(' ' + e.line);
          aLine++; bLine++; idx++;
          continue;
        } else {
          // close hunk; do not include extra equal lines
          break;
        }
      }
      // if we had any trailing context buffered, move it into hunk and reset
      if (trail.length) {
        hunkLines.push(...trail);
        aCount += trail.length; bCount += trail.length;
        trail = [];
      }
      if (e.type === 'delete') {
        hunkLines.push('-' + e.line); aLine++; aCount++; idx++;
      } else { // insert
        hunkLines.push('+' + e.line); bLine++; bCount++; idx++;
      }
    }
    // append whatever trailing context accumulated
    if (trail.length) {
      hunkLines.push(...trail);
      aCount += trail.length; bCount += trail.length;
    }
    hunks.push({ aStart, aLen: aCount || 0, bStart, bLen: bCount || 0, lines: hunkLines });
  }

  const header = [`--- a/${filePath}`, `+++ b/${filePath}`];
  const body = hunks.length === 0
    ? ['@@ -1,0 +1,0 @@']
    : hunks.flatMap(h => [
        `@@ -${h.aStart},${h.aLen} +${h.bStart},${h.bLen} @@`,
        ...h.lines,
      ]);
  return [...header, ...body].join('\n');
}



// mst.js
// Minimum Spanning Tree using Kruskal or Prim
// Run: node mst.js

const readline = require("readline");

// --------------------------
// Union-Find for Kruskal
// --------------------------
class DisjointSet {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;

    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else {
      this.parent[rb] = ra;
      this.rank[ra] += 1;
    }
    return true;
  }
}

// --------------------------
// Kruskal MST (edge list)
// --------------------------
function kruskalMST(n, edges) {
  const ds = new DisjointSet(n);
  const sorted = [...edges].sort((a, b) => a.w - b.w);

  const mst = [];
  let total = 0;

  for (const { u, v, w } of sorted) {
    if (ds.union(u, v)) {
      mst.push({ u, v, w });
      total += w;
      if (mst.length === n - 1) break;
    }
  }

  if (mst.length !== n - 1) {
    throw new Error("Graph is not connected. MST cannot be formed.");
  }

  return { mst, total };
}

// --------------------------
// Prim MST (adjacency list)
// We'll implement a simple MinHeap priority queue
// --------------------------
class MinHeap {
  constructor() {
    this.data = [];
  }

  push(item) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop() {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const end = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = end;
      this.bubbleDown(0);
    }
    return top;
  }

  bubbleUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.data[p].w <= this.data[i].w) break;
      [this.data[p], this.data[i]] = [this.data[i], this.data[p]];
      i = p;
    }
  }

  bubbleDown(i) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;

      if (l < n && this.data[l].w < this.data[smallest].w) smallest = l;
      if (r < n && this.data[r].w < this.data[smallest].w) smallest = r;

      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }

  get size() {
    return this.data.length;
  }
}

function buildAdj(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const { u, v, w } of edges) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }
  return adj;
}

function primMST(n, adj, start = 0) {
  const visited = Array(n).fill(false);
  const heap = new MinHeap();

  const mst = [];
  let total = 0;

  visited[start] = true;
  for (const e of adj[start]) heap.push({ w: e.w, u: start, v: e.to });

  while (heap.size > 0 && mst.length < n - 1) {
    const { w, u, v } = heap.pop();
    if (visited[v]) continue;

    visited[v] = true;
    mst.push({ u, v, w });
    total += w;

    for (const e of adj[v]) {
      if (!visited[e.to]) heap.push({ w: e.w, u: v, v: e.to });
    }
  }

  if (mst.length !== n - 1) {
    throw new Error("Graph is not connected. MST cannot be formed.");
  }

  return { mst, total };
}

// --------------------------
// CLI input (Bonus)
// --------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  console.log("=== Minimum Spanning Tree Builder (Kruskal / Prim) ===\n");

  const n = parseInt(await ask("Number of computers (vertices): "), 10);
  if (!Number.isInteger(n) || n <= 0) {
    console.log("Invalid number of vertices.");
    rl.close();
    return;
  }

  console.log("\nEnter edges as: u v weight (0-based vertices)");
  console.log("Type 'done' when finished.\n");

  const edges = [];
  while (true) {
    const line = (await ask("> ")).trim();
    if (line.toLowerCase() === "done") break;

    const parts = line.split(/\s+/);
    if (parts.length !== 3) {
      console.log("Invalid. Example: 0 2 15");
      continue;
    }

    const u = parseInt(parts[0], 10);
    const v = parseInt(parts[1], 10);
    const w = parseInt(parts[2], 10);

    if (![u, v, w].every(Number.isInteger)) {
      console.log("Please enter integers only.");
      continue;
    }
    if (u < 0 || u >= n || v < 0 || v >= n) {
      console.log(`Vertices must be between 0 and ${n - 1}`);
      continue;
    }
    if (u === v) {
      console.log("No self-loops allowed.");
      continue;
    }
    if (w < 0) {
      console.log("Weight should be non-negative.");
      continue;
    }

    edges.push({ u, v, w });
  }

  if (edges.length === 0) {
    console.log("No edges entered. Cannot build MST.");
    rl.close();
    return;
  }

  const choice = (await ask("\nChoose algorithm: (1) Kruskal  (2) Prim : ")).trim();

  try {
    let result;
    let algo;

    if (choice === "1") {
      algo = "Kruskal";
      result = kruskalMST(n, edges);
    } else {
      algo = "Prim";
      const adj = buildAdj(n, edges);
      result = primMST(n, adj, 0);
    }

    console.log(`\n--- ${algo}'s MST ---`);
    for (const e of result.mst) {
      console.log(`${e.u} -- ${e.v}  (cost ${e.w})`);
    }
    console.log(`Total cost: ${result.total}`);
  } catch (err) {
    console.log("Error:", err.message);
  } finally {
    rl.close();
  }
}

main();

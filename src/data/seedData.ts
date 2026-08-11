import type { KnowledgeNode, NodePosition } from '../types';

const now = Date.now();

export const seedNodes: KnowledgeNode[] = [
  {
    id: 'la-vectors',
    title: 'Vector Spaces & Operations',
    category: 'formula',
    difficulty: 'beginner',
    latex: '\\vec{a} \\cdot \\vec{b} = \\sum_{i=1}^{n} a_i b_i = |\\vec{a}||\\vec{b}|\\cos\\theta',
    tags: ['linear-algebra', 'vectors'],
    prerequisites: [],
    description: 'Vectors form the foundation of linear algebra. The dot product measures alignment between vectors, while the cross product yields a perpendicular vector. These operations are fundamental to physics, computer graphics, and machine learning.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'la-matrices',
    title: 'Matrix Operations',
    category: 'formula',
    difficulty: 'beginner',
    latex: '(AB)_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}',
    prerequisites: ['la-vectors'],
    tags: ['linear-algebra', 'matrices'],
    code: `const A = [[1,2],[3,4]];\nconst B = [[5,6],[7,8]];\nconst result = math.multiply(A, B);\nconsole.log("A =", JSON.stringify(A));\nconsole.log("B =", JSON.stringify(B));\nconsole.log("A × B =", JSON.stringify(result));`,
    description: 'Matrix multiplication is the cornerstone of linear transformations. The product AB combines the transformations represented by A and B into a single operation.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'la-determinants',
    title: 'Determinants & Properties',
    category: 'formula',
    difficulty: 'intermediate',
    latex: '\\det(A) = \\sum_{j=1}^{n} (-1)^{1+j} a_{1j} M_{1j}',
    prerequisites: ['la-matrices'],
    tags: ['linear-algebra', 'determinants'],
    description: 'The determinant quantifies how a matrix scales area or volume. A zero determinant indicates a singular matrix with linearly dependent columns.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'la-eigenvalues',
    title: 'Eigenvalues & Eigenvectors',
    category: 'theorem',
    difficulty: 'intermediate',
    latex: 'A\\vec{v} = \\lambda\\vec{v} \\implies \\det(A - \\lambda I) = 0',
    prerequisites: ['la-determinants'],
    tags: ['linear-algebra', 'eigenvalues'],
    description: 'Eigenvectors are directions preserved under a linear transformation, scaled by their eigenvalue. They decompose complex transformations into simple scaling operations along principal axes.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'la-svd',
    title: 'Singular Value Decomposition',
    category: 'theorem',
    difficulty: 'advanced',
    latex: 'A = U\\Sigma V^T, \\quad \\sigma_i = \\sqrt{\\lambda_i(A^T A)}',
    prerequisites: ['la-eigenvalues'],
    tags: ['linear-algebra', 'svd', 'dimensionality-reduction'],
    description: 'SVD factorizes any matrix into rotation, scaling, and rotation components. It powers dimensionality reduction (PCA), recommendation systems, and image compression.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'gt-basics',
    title: 'Graph Fundamentals',
    category: 'concept',
    difficulty: 'beginner',
    mermaid: 'graph TD\n    A["Node A"] -->|weight: 3| B["Node B"]\n    A -->|weight: 5| C["Node C"]\n    B -->|weight: 2| D["Node D"]\n    C -->|weight: 4| D\n    D -->|weight: 1| E["Node E"]\n    B -->|weight: 6| E',
    prerequisites: [],
    tags: ['graph-theory'],
    description: 'A graph G=(V,E) consists of vertices and edges. Directed graphs add orientation to edges, enabling modeling of dependencies, networks, and state machines.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'gt-traversal',
    title: 'BFS & DFS Traversal',
    category: 'algorithm',
    difficulty: 'intermediate',
    prerequisites: ['gt-basics'],
    code: `// BFS Traversal\nfunction bfs(graph, start) {\n  const visited = new Set();\n  const queue = [start];\n  const order = [];\n  visited.add(start);\n  while (queue.length > 0) {\n    const node = queue.shift();\n    order.push(node);\n    for (const neighbor of (graph[node] || [])) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return order;\n}\n\nconst graph = {\n  A: ['B', 'C'],\n  B: ['D', 'E'],\n  C: ['D'],\n  D: ['E'],\n  E: []\n};\nconsole.log("BFS from A:", bfs(graph, 'A').join(' → '));`,
    tags: ['graph-theory', 'traversal'],
    description: 'BFS explores level by level using a queue, finding shortest unweighted paths. DFS explores depth-first using a stack, useful for topological sorting and cycle detection.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'gt-shortest-path',
    title: "Dijkstra's Algorithm",
    category: 'algorithm',
    difficulty: 'intermediate',
    latex: 'd[v] = \\min(d[v],\\; d[u] + w(u,v))',
    prerequisites: ['gt-traversal'],
    code: `// Dijkstra's Algorithm\nfunction dijkstra(graph, start) {\n  const dist = {};\n  const visited = new Set();\n  for (const node in graph) dist[node] = Infinity;\n  dist[start] = 0;\n  while (true) {\n    let u = null, minDist = Infinity;\n    for (const node in dist) {\n      if (!visited.has(node) && dist[node] < minDist) {\n        u = node; minDist = dist[node];\n      }\n    }\n    if (u === null) break;\n    visited.add(u);\n    for (const [v, w] of graph[u]) {\n      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n    }\n  }\n  return dist;\n}\n\nconst g = {\n  A: [['B',3],['C',5]],\n  B: [['D',2],['E',6]],\n  C: [['D',4]],\n  D: [['E',1]],\n  E: []\n};\nconsole.log("Distances from A:", JSON.stringify(dijkstra(g, 'A')));`,
    tags: ['graph-theory', 'shortest-path'],
    description: "Dijkstra's algorithm finds shortest paths from a source vertex to all others in a weighted graph with non-negative edges using a greedy approach with a priority queue.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'gt-mst',
    title: 'Minimum Spanning Trees',
    category: 'algorithm',
    difficulty: 'intermediate',
    latex: '\\text{Cut Property: For any cut }(S, V\\setminus S)\\text{, the min-weight crossing edge is in some MST}',
    prerequisites: ['gt-basics', 'gt-shortest-path'],
    mermaid: 'graph LR\n    A["A"] ---|4| B["B"]\n    A ---|2| C["C"]\n    B ---|5| C\n    B ---|3| D["D"]\n    C ---|1| D\n    D ---|6| E["E"]\n    C ---|7| E',
    tags: ['graph-theory', 'mst'],
    description: 'A minimum spanning tree connects all vertices with minimum total edge weight. Kruskal and Prim algorithms efficiently construct MSTs with applications in network design.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'gt-network-flow',
    title: 'Network Flow & Max-Flow',
    category: 'theorem',
    difficulty: 'advanced',
    latex: '\\max |f| = \\min_{(S,T)} c(S,T)',
    prerequisites: ['gt-mst'],
    tags: ['graph-theory', 'network-flow'],
    description: 'The Max-Flow Min-Cut theorem states that maximum flow equals minimum cut capacity. Ford-Fulkerson and Edmonds-Karp algorithms solve max-flow with applications in bipartite matching.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'sd-load-balancing',
    title: 'Load Balancing Strategies',
    category: 'architecture',
    difficulty: 'intermediate',
    mermaid: 'graph TD\n    Client["Clients"] --> LB["Load Balancer"]\n    LB -->|Round Robin| S1["Server 1"]\n    LB -->|Least Conn| S2["Server 2"]\n    LB -->|IP Hash| S3["Server 3"]\n    S1 --> DB[("Database")]\n    S2 --> DB\n    S3 --> DB',
    prerequisites: [],
    tags: ['system-design', 'distributed'],
    description: 'Load balancers distribute incoming traffic across multiple servers to ensure high availability. Strategies include round-robin, least connections, and consistent hashing.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'sd-caching',
    title: 'Caching Strategies',
    category: 'architecture',
    difficulty: 'intermediate',
    mermaid: 'graph LR\n    App["Application"] --> L1["L1 Cache\\nIn-Memory"]\n    L1 -->|Miss| L2["L2 Cache\\nRedis/Memcached"]\n    L2 -->|Miss| DB[("Database")]\n    DB -->|Update| L2\n    L2 -->|Update| L1',
    prerequisites: ['sd-load-balancing'],
    tags: ['system-design', 'caching'],
    description: 'Caching reduces latency and database load by storing frequently accessed data closer to the application. Multi-tier cache hierarchies balance speed with consistency.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'sd-databases',
    title: 'Database Sharding & Replication',
    category: 'architecture',
    difficulty: 'advanced',
    mermaid: 'graph TD\n    App["Application"] --> Router["Shard Router"]\n    Router --> S1["Shard 1\\nA-M"]\n    Router --> S2["Shard 2\\nN-Z"]\n    S1 --> R1["Replica 1a"]\n    S1 --> R2["Replica 1b"]\n    S2 --> R3["Replica 2a"]\n    S2 --> R4["Replica 2b"]',
    prerequisites: ['sd-caching'],
    tags: ['system-design', 'databases'],
    description: 'Sharding horizontally partitions data across multiple databases for scalability. Replication provides fault tolerance with primary-replica or multi-primary configurations.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'sd-microservices',
    title: 'Microservices Architecture',
    category: 'architecture',
    difficulty: 'advanced',
    mermaid: 'graph TD\n    GW["API Gateway"] --> Auth["Auth Service"]\n    GW --> Users["User Service"]\n    GW --> Orders["Order Service"]\n    GW --> Catalog["Catalog Service"]\n    Users --> MQ["Message Queue"]\n    Orders --> MQ\n    MQ --> Notify["Notification Service"]\n    Users --> DB1[("User DB")]\n    Orders --> DB2[("Order DB")]\n    Catalog --> DB3[("Catalog DB")]',
    prerequisites: ['sd-load-balancing', 'sd-caching'],
    tags: ['system-design', 'microservices'],
    description: 'Microservices decompose applications into independently deployable services. Each service owns its data, communicates via APIs or message queues, enabling team autonomy and scalability.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'sd-cap-theorem',
    title: 'CAP Theorem',
    category: 'theorem',
    difficulty: 'intermediate',
    latex: '\\text{In a distributed system, choose at most 2 of: }\\underbrace{C}_{\\text{Consistency}} + \\underbrace{A}_{\\text{Availability}} + \\underbrace{P}_{\\text{Partition Tolerance}}',
    prerequisites: ['sd-databases'],
    tags: ['system-design', 'distributed'],
    description: 'The CAP theorem states that distributed systems cannot simultaneously guarantee consistency, availability, and partition tolerance. Systems must make trade-offs based on requirements.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'algo-complexity',
    title: 'Big-O Notation',
    category: 'concept',
    difficulty: 'beginner',
    latex: 'f(n) = O(g(n)) \\iff \\exists\\, c, n_0 : f(n) \\leq c \\cdot g(n), \\; \\forall n \\geq n_0',
    code: `// Comparing complexity classes\nfunction linear(n) { let s=0; for(let i=0;i<n;i++) s+=i; return s; }\nfunction quadratic(n) { let s=0; for(let i=0;i<n;i++) for(let j=0;j<n;j++) s++; return s; }\n\nconst n = 1000;\nlet t1 = performance.now();\nlinear(n);\nconsole.log("O(n) with n=" + n + ": " + (performance.now()-t1).toFixed(3) + "ms");\nt1 = performance.now();\nquadratic(n);\nconsole.log("O(n²) with n=" + n + ": " + (performance.now()-t1).toFixed(3) + "ms");`,
    prerequisites: [],
    tags: ['algorithms', 'complexity'],
    description: 'Big-O notation describes the upper bound of algorithm growth rates. It abstracts away constants and lower-order terms to classify algorithms by their scalability behavior.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'algo-sorting',
    title: 'Sorting Algorithms',
    category: 'algorithm',
    difficulty: 'intermediate',
    latex: 'T(n) = 2T(n/2) + O(n) \\implies T(n) = O(n\\log n)',
    code: `// QuickSort Implementation\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const mid = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), ...mid, ...quickSort(right)];\n}\n\nconst data = [38, 27, 43, 3, 9, 82, 10];\nconsole.log("Input:", JSON.stringify(data));\nconsole.log("Sorted:", JSON.stringify(quickSort(data)));`,
    prerequisites: ['algo-complexity'],
    tags: ['algorithms', 'sorting'],
    description: 'Comparison-based sorting has a lower bound of O(n log n). QuickSort achieves this on average with in-place partitioning, while MergeSort guarantees it with O(n) extra space.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'algo-dp',
    title: 'Dynamic Programming',
    category: 'algorithm',
    difficulty: 'advanced',
    latex: '\\text{OPT}(i, w) = \\max\\big(\\text{OPT}(i-1, w),\\; v_i + \\text{OPT}(i-1, w-w_i)\\big)',
    code: `// 0-1 Knapsack Problem\nfunction knapsack(weights, values, capacity) {\n  const n = weights.length;\n  const dp = Array.from({length: n+1}, () => Array(capacity+1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    for (let w = 0; w <= capacity; w++) {\n      dp[i][w] = dp[i-1][w];\n      if (weights[i-1] <= w) {\n        dp[i][w] = Math.max(dp[i][w], values[i-1] + dp[i-1][w-weights[i-1]]);\n      }\n    }\n  }\n  return dp[n][capacity];\n}\n\nconst weights = [2, 3, 4, 5];\nconst values = [3, 4, 5, 6];\nconst capacity = 8;\nconsole.log("Items: weights="+JSON.stringify(weights)+", values="+JSON.stringify(values));\nconsole.log("Capacity:", capacity);\nconsole.log("Max value:", knapsack(weights, values, capacity));`,
    prerequisites: ['algo-complexity', 'algo-sorting'],
    tags: ['algorithms', 'dynamic-programming'],
    description: 'Dynamic programming solves optimization problems by breaking them into overlapping subproblems. The key insight is optimal substructure: optimal solutions contain optimal sub-solutions.',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'algo-trees',
    title: 'Binary Search Trees',
    category: 'algorithm',
    difficulty: 'intermediate',
    code: `// BST Implementation\nclass BSTNode {\n  constructor(val) { this.val=val; this.left=null; this.right=null; }\n}\nfunction insert(root, val) {\n  if (!root) return new BSTNode(val);\n  if (val < root.val) root.left = insert(root.left, val);\n  else root.right = insert(root.right, val);\n  return root;\n}\nfunction inorder(root, result=[]) {\n  if (!root) return result;\n  inorder(root.left, result);\n  result.push(root.val);\n  inorder(root.right, result);\n  return result;\n}\n\nlet root = null;\n[5, 3, 7, 1, 4, 6, 8].forEach(v => root = insert(root, v));\nconsole.log("BST Inorder:", inorder(root).join(' → '));`,
    prerequisites: ['algo-complexity'],
    tags: ['algorithms', 'data-structures', 'trees'],
    description: 'Binary search trees maintain sorted order with O(log n) average case for search, insert, and delete. Self-balancing variants (AVL, Red-Black) guarantee worst-case O(log n).',
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'algo-hashing',
    title: 'Hash Tables & Collision Resolution',
    category: 'concept',
    difficulty: 'intermediate',
    latex: '\\alpha = \\frac{n}{m}, \\quad E[\\text{probes}] = \\frac{1}{1-\\alpha}',
    prerequisites: ['algo-complexity'],
    tags: ['algorithms', 'data-structures', 'hashing'],
    description: 'Hash tables provide O(1) average-case lookups by mapping keys to array indices via hash functions. Open addressing and chaining handle collisions with different space-time tradeoffs.',
    createdAt: now,
    updatedAt: now
  }
];

export const seedEdges: { source: string; target: string }[] = seedNodes.flatMap(node => 
  (node.prerequisites || []).map(prereq => ({
    source: prereq,
    target: node.id
  }))
);

export const seedPositions: NodePosition[] = [
  // Linear Algebra cluster: top-left (x:50-600, y:50-500)
  { nodeId: 'la-vectors', x: 100, y: 80 },
  { nodeId: 'la-matrices', x: 100, y: 280 },
  { nodeId: 'la-determinants', x: 350, y: 280 },
  { nodeId: 'la-eigenvalues', x: 350, y: 480 },
  { nodeId: 'la-svd', x: 600, y: 480 },
  // Graph Theory cluster: top-right (x:900-1500, y:50-500)
  { nodeId: 'gt-basics', x: 950, y: 80 },
  { nodeId: 'gt-traversal', x: 950, y: 280 },
  { nodeId: 'gt-shortest-path', x: 1200, y: 280 },
  { nodeId: 'gt-mst', x: 1200, y: 480 },
  { nodeId: 'gt-network-flow', x: 1450, y: 480 },
  // System Design cluster: bottom-left (x:50-600, y:650-1100)
  { nodeId: 'sd-load-balancing', x: 100, y: 700 },
  { nodeId: 'sd-caching', x: 350, y: 700 },
  { nodeId: 'sd-databases', x: 350, y: 900 },
  { nodeId: 'sd-microservices', x: 600, y: 700 },
  { nodeId: 'sd-cap-theorem', x: 600, y: 900 },
  // Algorithms cluster: bottom-right (x:900-1500, y:650-1100)
  { nodeId: 'algo-complexity', x: 950, y: 700 },
  { nodeId: 'algo-sorting', x: 1200, y: 700 },
  { nodeId: 'algo-dp', x: 1200, y: 900 },
  { nodeId: 'algo-trees', x: 950, y: 900 },
  { nodeId: 'algo-hashing', x: 1450, y: 900 },
];

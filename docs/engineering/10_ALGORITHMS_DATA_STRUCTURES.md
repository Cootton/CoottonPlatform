# Algorithms và data structures

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-ALG-001` · Kiến thức LLD, không mandates thay PostgreSQL bằng in-memory structures. Giữ IDs `LLD-ALG-SEARCH-001`, `LLD-DS-LINKEDLIST-001` historical claims.

## Complexity và lựa chọn structures

Big-O mô tả growth, phân biệt worst/average/amortized và time/auxiliary space; constants/IO/GC/data size vẫn cần measurement. Hai vòng loops không luôn O(n²) nếu disjoint/bounded; recursive depth tiêu stack. Sorting thường O(n log n), hash lookup expected O(1) nhưng worst-case/collision/memory matters. Không binary-search linked list để mong random access O(1).

| Structure | Operations thường gặp | Cootton relevance |
|---|---|---|
| Array/dynamic array | Indexed access O(1); scan O(n); middle insert/delete O(n); append amortized O(1) | Bounded DTO lists/batch processing |
| HashMap/Set | Expected lookup/insert O(1); memory overhead | Dedupe/traversal; durable dedupe cần DB không chỉ HashSet |
| Stack/Queue/Deque | Push/pop/enqueue/dequeue O(1) với suitable implementation | DFS/BFS; queue in memory không durable job system |
| Heap | Peek O(1), insert/remove min/max O(log n) | Priority scheduling khi use case cần, tie-breaking rõ |
| Balanced BST | Search/insert/delete O(log n); plain BST worst O(n) | Ordered range reasoning; DB B-tree implementation khác |
| Linked list | Sequential lookup O(n), pointer mutation O(1) nếu đủ references | LRU internals, không canonical orders |
| Graph/tree | Adjacency lists O(V+E), matrix O(V²) storage | Categories/dependencies/workflows/link graph |

LRU thường HashMap+doubly linked list cho expected O(1) lookup/move/evict; không tự viết cache nếu library đáp ứng. Bloom filter LATER: no false negatives trong static correctly maintained set, false positives có; outdated population/delete design phá membership assumptions. Union-find dùng union by rank+path compression amortized gần O(1) cho undirected connectivity.

## Graph algorithms

BFS queue tìm shortest edge-count path unweighted, DFS stack/recursion traversal/cycle reasoning; O(V+E) với adjacency lists. Directed cycle detection cần on-stack/color hoặc topo processing, visited alone không đủ phân biệt cycle. Topological sort chỉ DAG, failed full ordering→cycle; category hierarchy/workflow dependency không chạy vô hạn.

Dijkstra với min-heap cho nonnegative weighted shortest path (typical O((V+E)log V)); negative weights không dùng Dijkstra. Bellman–Ford O(VE), phát hiện reachable negative cycles; Floyd–Warshall O(V³), O(V²) memory cho all-pairs nhỏ, khác Floyd linked-list cycle algorithm. MST: Kruskal sort edges+union-find hoặc Prim heap cho weighted undirected connectivity, khác shortest path. SCC (Tarjan/Kosaraju) O(V+E) cho directed strongly connected components. Chọn theo graph model, không mọi “graph” cần graph DB.

Cootton: taxonomy cycle rejection, bounded internal link graph, dependency ordering; shortest path/MST primarily LATER/reference chưa business need. Every traversal cap nodes/edges/depth/time, validate references và authorization; agent workflow thường graph stateful cần budgets/progress guards.

## Tree traversal

Preorder node→left→right cho parent-first serialization; inorder left→node→right cho sorted output chỉ khi BST property đúng; postorder left→right→node cho child-before-parent; level-order BFS cho levels. O(n) time, DFS auxiliary O(h), BFS O(width), worst skew DFS h=n. Kiểm cycles dù domain “tree” nếu dữ liệu/reference chưa guaranteed; deletion cần domain/recovery rules, không tự dùng postorder delete production.

## LLD-ALG-SEARCH-001 — 6 binary-search patterns

| Pattern | Invariant / result | Time và constraints |
|---|---|---|
| Standard | Sorted random-access sequence, return matching value/index or absent | O(log n); duplicates may return any match |
| Lower bound | First position with value≥x, return n if none | O(log n); works absent/duplicates |
| Upper bound | First position with value>x, return n if none | O(log n); count equal = upper−lower |
| Rotation point | Find minimum/pivot in sorted rotated sequence | O(log n) with distinct values; duplicates may degrade O(n) |
| Peak element | Use neighbor slope under explicit boundary/property assumptions | Standard strict adjacent-unequal variant O(log n); equal plateaus require policy |
| Search on answer | First feasible/last feasible in monotonic predicate range | O(log range × predicate cost); prove monotonicity first |

Safe boundary kernel (pseudocode, first true in [lo,hi)):

```text
while lo < hi:
    mid = lo + floor((hi - lo) / 2)
    if predicate(mid): hi = mid
    else: lo = mid + 1
return lo
```

Maintain all positions before lo false, positions from hi onward true; bounds progress every iteration. Test empty, all false/true, first/last, duplicates and integer bounds. Lower uses `a[mid]>=x`, upper `a[mid]>x`; insertion index n isn't found element. Capacity search only if measured feasibility monotonic; adding workers can increase DB contention, so algorithm không thay load testing. PostgreSQL range indexes share ordered-boundary idea, không same array implementation.

## LLD-DS-LINKEDLIST-001 — 10 patterns

| Pattern | Invariant / caution | Complexity |
|---|---|---|
| Traversal | Follow next until null; bounded or cycle-aware | O(n), O(1) auxiliary if acyclic |
| Two pointers gap | Advance fast k, then both; kth-from-end definitions/invalid k clear | O(n), O(1) |
| Fast/slow | fast2/slow1; even-length middle convention explicit | O(n), O(1) |
| Cycle detection | Floyd meeting, reset one to head to find entry | O(n), O(1); deterministic next chain |
| Reverse in place | Save next before flipping curr.next | O(n), O(1); exclusive mutation/ownership required |
| Dummy head | Sentinel makes predecessor uniform for head deletion | O(n) typical operation, O(1) auxiliary |
| Merge sorted | Take smaller head; preserve order | O(n+m), O(1) auxiliary iterative relinking; inputs ownership/aliasing |
| Split half | Slow/fast then sever boundary with predecessor | O(n), O(1); empty/single/even cases |
| Palindrome | Split/reverse half/compare; restore if contract needs | O(n), O(1) with mutation; concurrent readers unsafe |
| Remove duplicates | Sorted neighbors vs unsorted seen set | Sorted O(n)/O(1); unsorted expected O(n)/O(n) or quadratic no-set |

O(1) deletion cần đúng node/predecessor (doubly list node đủ), search cost vẫn O(n). Copy-next trick cho singly node không tail và đổi logical identity, không generic safe delete. Không reverse shared lists giữa requests. Floyd không giải arbitrary branching agent graph; dùng graph algorithms/budgets. Trace D01/D09/D10, ENG-SEC-001, GATE-CONTRACT-001.
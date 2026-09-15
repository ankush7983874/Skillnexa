export interface SeedQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SeedAssessmentConfig {
  title: string;
  type: 'Technical' | 'Coding' | 'Aptitude' | 'Soft Skills';
  skillName: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  passingScore: number;
  description: string;
  questions: SeedQuestion[];
}

export const TECHNICAL_ASSESSMENTS_SEED: SeedAssessmentConfig[] = [
  // 1. C Programming
  {
    title: 'C Programming & Low-Level Memory Competency',
    type: 'Technical',
    skillName: 'C',
    category: 'Programming',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Mastery evaluation of C pointers, memory allocation, structs, preprocessor directives, and output prediction.',
    questions: [
      {
        questionText: 'What is the output of the following C code snippet?\nint a = 5;\nprintf("%d %d", a++, ++a);',
        options: ['5 7', '6 7', 'Undefined behavior due to unsequenced modifications', '5 6'],
        correctOptionIndex: 2,
        explanation: 'Modifying a variable multiple times without a sequence point between them results in Undefined Behavior in C.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which standard function is used to dynamically reallocate memory previously allocated with malloc or calloc?',
        options: ['realloc()', 'free()', 'alloc()', 'memreset()'],
        correctOptionIndex: 0,
        explanation: 'realloc() changes the size of the memory block pointed to by ptr to size bytes.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What does the keyword "volatile" prevent the compiler from performing on a variable in C?',
        options: ['Type casting', 'Compiler optimizations that cache variable values in registers', 'Memory allocation', 'Scope resolution'],
        correctOptionIndex: 1,
        explanation: 'Volatile tells the compiler that the variable value may change unexpectedly (e.g. hardware registers or threads), disabling caching optimizations.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'What is the size of a union containing an int (4 bytes), char[20] (20 bytes), and double (8 bytes)?',
        options: ['32 bytes', '20 bytes (or aligned to max member alignment)', '8 bytes', '4 bytes'],
        correctOptionIndex: 1,
        explanation: 'The size of a union is determined by the size of its largest member (20 bytes), rounded up for alignment if needed.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Scenario: A C function returns the address of a local automatic variable. What issue occurs when caller accesses it?',
        options: ['Memory leak', 'Dangling pointer / Undefined Behavior', 'Segmentation fault during compilation', 'Stack overflow'],
        correctOptionIndex: 1,
        explanation: 'Local automatic variables are destroyed when function exits; returning their address leaves a dangling pointer.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'What will sizeof(struct Empty {}) evaluate to in C (GCC extension standard behavior)?',
        options: ['0 bytes (or 1 byte depending on compiler)', '4 bytes', '8 bytes', 'Compilation Error always'],
        correctOptionIndex: 0,
        explanation: 'In C, an empty struct is a GNU extension (size 0), whereas in C++ it is 1 byte.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'Which header file must be included to use NULL, size_t, and dynamic allocation functions like malloc()?',
        options: ['<stdio.h>', '<stdlib.h>', '<string.h>', '<math.h>'],
        correctOptionIndex: 1,
        explanation: '<stdlib.h> declares allocation, conversion, and environment management functions.',
        difficulty: 'Beginner',
      },
    ],
  },

  // 2. C++
  {
    title: 'C++ Object-Oriented & STL Architecture',
    type: 'Technical',
    skillName: 'C++',
    category: 'Programming',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Evaluation covering C++ OOP, RAII, Smart Pointers, Templates, STL containers, and virtual functions.',
    questions: [
      {
        questionText: 'Which mechanism ensures virtual function table lookup and dynamic dispatch in C++ classes?',
        options: ['vptr (Virtual Pointer) and vtable (Virtual Table)', 'RTTI only', 'Template Metaprogramming', 'Static Binding'],
        correctOptionIndex: 0,
        explanation: 'Classes with virtual methods store a vptr pointing to the class vtable to resolve method calls at runtime.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'What type of smart pointer in C++11 enforces exclusive ownership of a dynamically allocated object?',
        options: ['std::shared_ptr', 'std::unique_ptr', 'std::weak_ptr', 'std::auto_ptr'],
        correctOptionIndex: 1,
        explanation: 'std::unique_ptr cannot be copied, guaranteeing single exclusive ownership.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What is the consequence of deleting a derived class object through a base class pointer without a virtual destructor?',
        options: ['Undefined behavior and potential memory leak of derived members', 'Compilation error', 'Automatic safe deletion', 'Stack overflow'],
        correctOptionIndex: 0,
        explanation: 'Without a virtual destructor in the base class, deleting via a base pointer fails to invoke the derived destructor.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'In C++ STL, what is the worst-case time complexity of inserting an element into std::unordered_map?',
        options: ['O(1)', 'O(log n)', 'O(n) due to hash collisions', 'O(n log n)'],
        correctOptionIndex: 2,
        explanation: 'Average lookup/insertion is O(1), but in the worst case (all keys hash to same bucket) it degrades to O(n).',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Scenario: You need a container with O(1) random access and fast append at the end. Which STL container is optimal?',
        options: ['std::list', 'std::vector', 'std::set', 'std::map'],
        correctOptionIndex: 1,
        explanation: 'std::vector uses contiguous memory, offering O(1) indexing and amortized O(1) push_back.',
        difficulty: 'Beginner',
      },
    ],
  },

  // 3. Java
  {
    title: 'Java Core, OOP & Multithreading Competency',
    type: 'Technical',
    skillName: 'Java',
    category: 'Programming',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Comprehensive evaluation of Core Java, JVM internals, Collections Framework, Interfaces, and Concurrency.',
    questions: [
      {
        questionText: 'Which OOP principle is implemented when a subclass provides a specific implementation for a method defined in a superclass?',
        options: ['Method Overloading', 'Method Overriding', 'Encapsulation', 'Abstraction'],
        correctOptionIndex: 1,
        explanation: 'Method Overriding allows a subclass to provide a specific implementation of a method already declared in its parent class.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What happens when a key-value pair is put into a Java HashMap that already contains the key?',
        options: ['Key is duplicated', 'Old value is replaced and returned by put()', 'Throws DuplicateKeyException', 'Operation ignored'],
        correctOptionIndex: 1,
        explanation: 'HashMap replaces the existing value associated with the key and returns the previous value.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which Java memory area stores class structures, method data, field data, and static variables since Java 8?',
        options: ['PermGen', 'Metaspace (Native Memory)', 'Heap Memory', 'Java Stack'],
        correctOptionIndex: 1,
        explanation: 'Java 8 replaced PermGen with Metaspace, which is allocated out of native memory.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'Scenario: Two threads try to access a synchronized block on the same monitor object. What is the state of the second thread?',
        options: ['WAITING', 'BLOCKED', 'RUNNABLE', 'TIMED_WAITING'],
        correctOptionIndex: 1,
        explanation: 'A thread waiting to acquire a monitor lock enters the BLOCKED state.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'What is the output of System.out.println(10 + 20 + "Java" + 10 + 20); in Java?',
        options: ['30Java1020', '1020Java1020', '30Java30', 'Compilation Error'],
        correctOptionIndex: 0,
        explanation: 'Evaluation goes left to right: 10+20=30, then string concatenation produces "30Java", then "30Java10" and "30Java1020".',
        difficulty: 'Beginner',
      },
    ],
  },

  // 4. Python
  {
    title: 'Python Data Structures, Async & Advanced Language Mechanics',
    type: 'Technical',
    skillName: 'Python',
    category: 'Programming',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Evaluation of Pythonic paradigms, decorators, generators, GIL, memory management, and dictionary internals.',
    questions: [
      {
        questionText: 'What is the Global Interpreter Lock (GIL) in CPython?',
        options: ['A database lock', 'A mutex that allows only one native thread to execute Python bytecode at a time', 'A memory optimizer', 'A security sandbox'],
        correctOptionIndex: 1,
        explanation: 'The GIL prevents multiple threads from executing CPython bytecode simultaneously in multi-core processors.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'What does the "yield" keyword do inside a Python function?',
        options: ['Returns a value and terminates function', 'Turns the function into a generator object that lazily yields values', 'Raises a StopIteration exception', 'Executes code asynchronously'],
        correctOptionIndex: 1,
        explanation: 'Yield suspends function execution and returns a generator iterator that remembers execution state.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What is the result of list(set([1, 2, 2, 3, 4, 4])) in Python?',
        options: ['Unordered list of unique elements [1, 2, 3, 4]', 'Original list preserved', 'Syntax Error', 'Tuple of values'],
        correctOptionIndex: 0,
        explanation: 'Set removes duplicate elements, and list() converts the set back to a list.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What is the time complexity of checking membership (item in container) for a Python set vs list?',
        options: ['O(1) average for Set, O(n) for List', 'O(n) for both', 'O(log n) for Set, O(1) for List', 'O(n²) for Set'],
        correctOptionIndex: 0,
        explanation: 'Python sets are hash tables providing O(1) average lookup, while lists require linear O(n) scanning.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Scenario: You want to measure execution time of multiple functions without modifying their internal code. What pattern is optimal?',
        options: ['Decorator function using @wraps', 'Inheritance', 'Global variable tracking', 'Monkey patching'],
        correctOptionIndex: 0,
        explanation: 'Python decorators wrap functions to add functionality like timing cleanly.',
        difficulty: 'Intermediate',
      },
    ],
  },

  // 5. JavaScript
  {
    title: 'JavaScript Modern ES6+, Async & Event Loop Mechanics',
    type: 'Technical',
    skillName: 'JavaScript',
    category: 'Programming',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Assessment covering JS closures, prototypes, Event Loop, Microtasks, Promises, and ES6+ features.',
    questions: [
      {
        questionText: 'What is a Closure in JavaScript?',
        options: ['A function bundled together with references to its surrounding lexical environment', 'A method to close browser windows', 'A private variable keyword', 'An async callback'],
        correctOptionIndex: 0,
        explanation: 'A closure gives a inner function access to an outer function\'s scope even after the outer function has returned.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'In the JavaScript Event Loop, which queue has higher priority: Microtask Queue or Macrotask (Callback) Queue?',
        options: ['Microtask Queue (Promises, process.nextTick)', 'Macrotask Queue (setTimeout, setInterval)', 'Equal priority', 'FIFO random queue'],
        correctOptionIndex: 0,
        explanation: 'The event loop processes all pending microtasks before executing the next macrotask.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'What is the output of console.log(typeof null) in JavaScript?',
        options: ['"null"', '"object"', '"undefined"', '"number"'],
        correctOptionIndex: 1,
        explanation: '`typeof null` returning `"object"` is a legacy bug in JS since its initial implementation.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What does Promise.all([p1, p2, p3]) do if one of the promises rejects?',
        options: ['Immediately rejects with the error of the first rejected promise', 'Waits for remaining promises then returns partial results', 'Resolves with null', 'Ignores rejected promise'],
        correctOptionIndex: 0,
        explanation: 'Promise.all has fail-fast behavior: if any input promise rejects, the returned promise immediately rejects.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which array method returns a new array with all sub-array elements concatenated recursively up to a specified depth?',
        options: ['map()', 'flat()', 'reduce()', 'slice()'],
        correctOptionIndex: 1,
        explanation: 'Array.prototype.flat() creates a new array with sub-array elements flattened up to the specified depth.',
        difficulty: 'Beginner',
      },
    ],
  },

  // 6. SQL
  {
    title: 'Relational SQL & Database Query Optimization',
    type: 'Technical',
    skillName: 'SQL',
    category: 'Database',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Evaluation of SQL JOINs, GROUP BY, Aggregate functions, Subqueries, Window Functions, and Indexing.',
    questions: [
      {
        questionText: 'Which SQL JOIN returns all rows from the left table and matching rows from the right table (filling NULLs for non-matches)?',
        options: ['INNER JOIN', 'LEFT (OUTER) JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
        correctOptionIndex: 1,
        explanation: 'LEFT JOIN returns all records from left table and matched records from right table.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What is the difference between WHERE and HAVING clauses in SQL?',
        options: ['WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY', 'No difference', 'HAVING applies to joins only', 'WHERE applies to subqueries only'],
        correctOptionIndex: 0,
        explanation: 'WHERE filters individual records before grouping, whereas HAVING filters grouped rows after aggregation.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which SQL Window function assigns a unique sequential integer to rows within a partition starting from 1?',
        options: ['RANK()', 'DENSE_RANK()', 'ROW_NUMBER()', 'NTILE()'],
        correctOptionIndex: 2,
        explanation: 'ROW_NUMBER() assigns a unique incrementing integer to each row in the partition without gaps or ties.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Scenario: A table has 10,000,000 rows. A query selecting by email takes 5 seconds. How can lookup speed be optimized to under 5ms?',
        options: ['Add a B-Tree Index on the email column', 'Use SELECT * instead', 'Run query at midnight', 'Split table into 10 databases'],
        correctOptionIndex: 0,
        explanation: 'Creating a B-Tree index reduces lookup complexity from O(n) full table scan to O(log n) tree index traversal.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What does the SQL command TRUNCATE TABLE do compared to DELETE FROM TABLE?',
        options: ['TRUNCATE is a DDL operation that quickly resets table storage and cannot be easily rolled back in some DBs', 'DELETE is faster', 'TRUNCATE removes table structure', 'Both are identical'],
        correctOptionIndex: 0,
        explanation: 'TRUNCATE deallocates data pages (DDL), making it faster than row-by-row DELETE (DML) logging.',
        difficulty: 'Intermediate',
      },
    ],
  },

  // 7. DBMS Architecture
  {
    title: 'Database Management Systems & ACID Architecture',
    type: 'Technical',
    skillName: 'DBMS',
    category: 'Database',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Evaluation of ACID properties, Normalization (1NF to 3NF/BCNF), Concurrency Control, Deadlocks, and Transactions.',
    questions: [
      {
        questionText: 'What does the "A" in ACID database properties guarantee?',
        options: ['Atomicity: All operations in a transaction complete successfully, or none are applied', 'Availability', 'Accuracy', 'Authentication'],
        correctOptionIndex: 0,
        explanation: 'Atomicity ensures that a transaction is treated as a single "all-or-nothing" unit of work.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'A database table is in 2NF if it is in 1NF and satisfies which additional condition?',
        options: ['No partial dependency (all non-key attributes fully depend on primary key)', 'No transitive dependency', 'No multi-valued dependency', 'Must use UUID primary keys'],
        correctOptionIndex: 0,
        explanation: '2NF requires eliminating partial functional dependencies of non-prime attributes on composite candidate keys.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which isolation level prevents Dirty Reads but allows Non-Repeatable Reads in SQL transactions?',
        options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
        correctOptionIndex: 1,
        explanation: 'READ COMMITTED ensures a transaction reads only committed data, preventing dirty reads.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'Which algorithm is widely used in DBMS to prevent deadlock during lock acquisition?',
        options: ['Banker\'s Algorithm / Wait-Die / Wound-Wait', 'Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm', 'Round Robin'],
        correctOptionIndex: 0,
        explanation: 'Wait-Die and Wound-Wait schemes use transaction timestamps to prevent cyclic waiting (deadlocks).',
        difficulty: 'Intermediate',
      },
    ],
  },

  // 8. Data Structures & Algorithms
  {
    title: 'DSA & Algorithmic Problem Solving Competency',
    type: 'Technical',
    skillName: 'Data Structures & Algorithms',
    category: 'Programming',
    difficulty: 'Advanced',
    durationMinutes: 20,
    passingScore: 60,
    description: 'Comprehensive evaluation of Arrays, Trees, Dynamic Programming, Graph Traversals, and Complexity Analysis.',
    questions: [
      {
        questionText: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
        correctOptionIndex: 2,
        explanation: 'QuickSort worst-case performance is O(n²) when the pivot selected is consistently the smallest or largest element.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which data structure is primarily used for Breadth-First Search (BFS) in a graph?',
        options: ['Stack', 'Queue', 'PriorityQueue', 'HashTable'],
        correctOptionIndex: 1,
        explanation: 'BFS uses a Queue data structure (FIFO order) to explore graph nodes level by level.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'Which algorithmic paradigm solves a problem by combining solutions to subproblems using memoization?',
        options: ['Greedy Approach', 'Divide and Conquer', 'Dynamic Programming', 'Backtracking'],
        correctOptionIndex: 2,
        explanation: 'Dynamic Programming stores subproblem solutions (memoization / tabulation) to avoid redundant computation.',
        difficulty: 'Advanced',
      },
      {
        questionText: 'What is the space complexity of an in-order traversal of a balanced Binary Search Tree with N nodes?',
        options: ['O(1)', 'O(log N) auxiliary call stack space', 'O(N)', 'O(N²)'],
        correctOptionIndex: 1,
        explanation: 'For a balanced tree of height log N, recursive call stack uses O(log N) auxiliary memory.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'In a Min-Heap with N elements, what is the time complexity to insert a new element and heapify?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctOptionIndex: 1,
        explanation: 'Inserting at the end and bubbling up in a binary heap takes O(log N) comparisons.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'Which algorithm finds single-source shortest paths in a weighted graph with non-negative edge weights?',
        options: ['Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal\'s Algorithm'],
        correctOptionIndex: 0,
        explanation: 'Dijkstra\'s algorithm uses a greedy approach to find shortest paths when edge weights are non-negative.',
        difficulty: 'Intermediate',
      },
    ],
  },

  // 9. Web Development
  {
    title: 'Full-Stack Web Development & Modern Web Architecture',
    type: 'Technical',
    skillName: 'Web Development',
    category: 'Engineering',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Assessment covering HTML5, CSS Flexbox/Grid, REST APIs, HTTP Status codes, React Hooks, and Web Security.',
    questions: [
      {
        questionText: 'Which HTTP status code signifies that a requested resource was successfully created on the server?',
        options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
        correctOptionIndex: 1,
        explanation: '201 Created indicates that the request succeeded and a new resource was created as a result.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'In React, what rule must be followed when invoking Hooks like useState or useEffect?',
        options: ['Must be called at the top level of functional components, not inside loops/conditions', 'Can be called inside regular JS functions anywhere', 'Must be wrapped in try/catch', 'Only allowed in class components'],
        correctOptionIndex: 0,
        explanation: 'Hooks must be called at the top level to guarantee they are invoked in the exact same order on every render.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'What browser security mechanism prevents a script on domain A from making AJAX requests to domain B without explicit headers?',
        options: ['CORS (Cross-Origin Resource Sharing)', 'CSRF Protection', 'XSS Sanitization', 'Content Security Policy (CSP)'],
        correctOptionIndex: 0,
        explanation: 'Same-Origin Policy restricts scripts on one origin from interacting with resources from another origin unless CORS headers permit it.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which CSS layout module provides a two-dimensional grid-based layout system for rows and columns?',
        options: ['Flexbox', 'CSS Grid', 'Positioning (Absolute/Relative)', 'Float Layout'],
        correctOptionIndex: 1,
        explanation: 'CSS Grid is a 2D layout system handling both columns and rows simultaneously, whereas Flexbox is primarily 1D.',
        difficulty: 'Beginner',
      },
    ],
  },

  // 10. Cloud Computing & DevOps
  {
    title: 'Cloud Computing, Microservices & DevOps Infrastructure',
    type: 'Technical',
    skillName: 'Cloud',
    category: 'Infrastructure',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Evaluation of Cloud Service Models (IaaS, PaaS, SaaS), Docker Containerization, Kubernetes, and Serverless.',
    questions: [
      {
        questionText: 'Which cloud service model provides virtualized computing resources such as VMs, storage, and networking over the internet?',
        options: ['SaaS (Software as a Service)', 'PaaS (Platform as a Service)', 'IaaS (Infrastructure as a Service)', 'FaaS (Function as a Service)'],
        correctOptionIndex: 2,
        explanation: 'IaaS (e.g. AWS EC2, GCP Compute Engine) delivers fundamental compute, storage, and networking resources.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'What is the primary benefit of Docker containerization compared to traditional virtual machines?',
        options: ['Containers share the host OS kernel, making them lightweight with fast startup times', 'Containers require dedicated OS installed inside each container', 'Containers run slower than VMs', 'Containers can only run on Linux'],
        correctOptionIndex: 0,
        explanation: 'Containers virtualize at the OS level, sharing host kernel resources rather than running full hypervisor guest OSs.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'In Kubernetes, what is the smallest deployable object that represents a set of running containers?',
        options: ['Node', 'Pod', 'Service', 'Deployment'],
        correctOptionIndex: 1,
        explanation: 'A Pod is the smallest execution unit in Kubernetes containing one or more tightly coupled containers.',
        difficulty: 'Intermediate',
      },
    ],
  },

  // 11. AI / ML
  {
    title: 'AI, Machine Learning & Neural Network Foundations',
    type: 'Technical',
    skillName: 'AI/ML',
    category: 'Data Science',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    passingScore: 60,
    description: 'Evaluation of Supervised/Unsupervised Learning, Overfitting, Confusion Matrix metrics, and Neural Networks.',
    questions: [
      {
        questionText: 'What issue occurs when a Machine Learning model performs exceptionally well on training data but poorly on unseen test data?',
        options: ['Underfitting', 'Overfitting (High Variance)', 'High Bias', 'Data Imbalance'],
        correctOptionIndex: 1,
        explanation: 'Overfitting happens when a model learns noise and specific details of training data rather than generalizable patterns.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'Which evaluation metric measures the proportion of actual positive cases that were correctly identified by the model?',
        options: ['Precision', 'Recall (Sensitivity)', 'Accuracy', 'F1 Score'],
        correctOptionIndex: 1,
        explanation: 'Recall = True Positives / (True Positives + False Negatives), measuring the coverage of actual positive instances.',
        difficulty: 'Intermediate',
      },
      {
        questionText: 'Which non-linear activation function outputs values in the range (0, 1) and is commonly used in binary classification output layers?',
        options: ['ReLU (Rectified Linear Unit)', 'Sigmoid', 'Softmax', 'Tanh'],
        correctOptionIndex: 1,
        explanation: 'Sigmoid maps real numbers to (0, 1), representing probability estimates for binary classification.',
        difficulty: 'Beginner',
      },
      {
        questionText: 'Which unsupervised learning algorithm partitions N observations into K clusters where each observation belongs to the cluster with nearest mean?',
        options: ['K-Means Clustering', 'K-Nearest Neighbors (KNN)', 'Decision Tree', 'Random Forest'],
        correctOptionIndex: 0,
        explanation: 'K-Means is an unsupervised clustering algorithm that groups unlabeled data into K distinct clusters based on centroid distance.',
        difficulty: 'Intermediate',
      },
    ],
  },
];

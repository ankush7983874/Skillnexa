"""
AI Career & Technical Assistant Router — Phase 10
Endpoint: /assistant/chat
General-Purpose Technical, Coding, DSA, CS Fundamentals, and Career Assistant.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import re

router = APIRouter(prefix="/assistant", tags=["Career Assistant"])


class AssistantMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class CareerAssistantRequest(BaseModel):
    message: str
    studentProfile: dict = {}
    conversationHistory: List[AssistantMessage] = []


# ─────────────────────────────────────────────────────────────────────────────
# 1. Intent Detection & Context Tracking
# ─────────────────────────────────────────────────────────────────────────────

def detect_intent(message: str, history: List[AssistantMessage] = []) -> Dict[str, Any]:
    msg = message.lower().strip()

    # Context analysis from history
    last_assistant_msg = ""
    last_user_msg = ""
    for m in reversed(history):
        if m.role == "assistant" and not last_assistant_msg:
            last_assistant_msg = m.content
        elif m.role == "user" and not last_user_msg:
            last_user_msg = m.content

    # Follow-up intent checks
    if any(w in msg for w in ["explain level", "level 1", "level 2", "level 3", "level 4", "level 5", "level 6", "level 7", "level 8", "level 9", "level 10", "level 11", "level 12", "level 13"]):
        return {"intent": "DSA_LEVEL_EXPLANATION", "category": "DSA"}

    if any(w in msg for w in ["give solutions", "give solution", "solution of these", "solutions of these"]):
        return {"intent": "PRACTICE_SOLUTIONS", "category": "DSA"}

    if any(w in msg for w in ["convert", "in java", "to java", "in python", "to python", "in c++", "to c++"]) and ("solution" in msg or "code" in msg or "previous" in msg or "above" in msg or len(msg) < 30):
        return {"intent": "CODE_TRANSLATION", "category": "PROGRAMMING"}

    if "practice questions" in msg or "practice problems" in msg or "dsa practice" in msg:
        return {"intent": "PRACTICE_QUESTIONS", "category": "DSA"}

    # Performance & Analytics Queries
    if any(w in msg for w in ["performance", "analytics", "my score", "my scores", "my progress", "how am i doing"]):
        return {"intent": "PERFORMANCE_ANALYTICS", "category": "ANALYTICS"}

    # DSA Roadmap check
    if "roadmap" in msg and ("dsa" in msg or "data structure" in msg or "algorithm" in msg):
        return {"intent": "DSA_ROADMAP", "category": "DSA"}


    # Role Roadmaps check
    if "roadmap" in msg:
        return {"intent": "ROLE_ROADMAP", "category": "CAREER"}

    # Placement Plan check
    if "placement" in msg and ("plan" in msg or "preparation" in msg or "month" in msg or "3 month" in msg):
        return {"intent": "PLACEMENT_PLAN", "category": "CAREER"}

    # DSA Specific questions
    if any(w in msg for w in ["binary search", "bubble sort", "quick sort", "merge sort", "heap sort", "insertion sort", "selection sort", "bfs", "dfs", "stack and queue", "stack vs queue", "linked list", "time complexity", "space complexity", "recursion", "backtracking", "dynamic programming", "knapsack", "lcs", "lis", "dijkstra"]):
        if any(w in msg for w in ["code", "write", "implement", "program", "in c", "in c++", "in java", "in python"]):
            return {"intent": "CODE_REQUEST", "category": "PROGRAMMING"}
        return {"intent": "DSA_CONCEPT", "category": "DSA"}

    # Code Requests
    if any(w in msg for w in ["code", "write a program", "write code", "implement in", "python code", "java code", "c++ code", "c code"]):
        return {"intent": "CODE_REQUEST", "category": "PROGRAMMING"}

    # Technical CS Concepts
    if any(w in msg for w in ["oop", "polymorphism", "inheritance", "encapsulation", "abstraction", "dbms", "normalization", "acid", "osi model", "tcp", "udp", "dns", "http", "https", "operating system", "process vs thread", "deadlock", "api", "rest api", "react", "node", "mongodb", "system design"]):
        return {"intent": "TECHNICAL_CONCEPT", "category": "CS_FUNDAMENTALS"}

    # Interview / Viva questions
    if any(w in msg for w in ["interview questions", "viva questions", "mock interview", "ask me", "interview prep"]):
        return {"intent": "INTERVIEW_QUESTIONS", "category": "INTERVIEW"}

    # Skill Improvement
    if any(w in msg for w in ["improve my java", "improve my dsa", "improve my coding", "improve my skills", "how to improve"]):
        return {"intent": "SKILL_IMPROVEMENT", "category": "SKILL"}

    # Profile & Job Matching
    if any(w in msg for w in ["my profile", "suitable for me", "my skill gap", "shortlisted", "my resume"]):
        return {"intent": "PROFILE_CAREER_MATCH", "category": "PROFILE"}

    # Performance & Analytics Queries
    if any(w in msg for w in ["my performance", "performance analytics", "why is my performance", "low performance", "my scores", "my progress", "how am i doing", "performance summary", "why is my score"]):
        return {"intent": "PERFORMANCE_ANALYTICS", "category": "ANALYTICS"}

    return {"intent": "GENERAL_TECHNICAL", "category": "GENERAL"}



# ─────────────────────────────────────────────────────────────────────────────
# 2. Knowledge Engine & Response Generators
# ─────────────────────────────────────────────────────────────────────────────

def get_dsa_roadmap_response(profile: dict) -> str:
    skills = [s.get("name", "") for s in profile.get("skills", [])]
    user_lang = "Java/C++/Python"
    for s in skills:
        if s in ["Java", "C++", "Python", "JavaScript", "C"]:
            user_lang = s
            break

    return (
        "# 🚀 Complete 13-Level Data Structures & Algorithms (DSA) Roadmap\n\n"
        f"*Tailored for placements & technical interviews (Primary Language: **{user_lang}**)*\n\n"
        "---\n\n"
        "### **LEVEL 1 — Programming Fundamentals**\n"
        "• **Core Concepts**: Variables, Data Types, Operators, Conditionals, Loops, Functions\n"
        "• **Key Topic**: Basic Recursion & Mathematical logic (GCD, Prime, Fibonacci, Factorial)\n"
         f"• **Input/Output**: Fast I/O in {user_lang}\n\n"
        "### **LEVEL 2 — Complexity Analysis**\n"
        "• **Asymptotic Notation**: Big O, Big Omega, Big Theta\n"
        "• **Analysis**: Time Complexity, Space Complexity, Auxiliary Space\n"
        "• **Calculations**: Loop counting, Recurrence relations, Master Theorem\n\n"
        "### **LEVEL 3 — Arrays**\n"
        "• **Fundamental**: Traversal, Insertion, Deletion, Searching (Linear & Binary)\n"
        "• **Sorting**: Bubble, Selection, Insertion, Merge Sort, Quick Sort\n"
        "• **Techniques**: Two Pointers, Sliding Window, Prefix Sum, Kadane's Algorithm (Max Subarray)\n\n"
        "### **LEVEL 4 — Strings**\n"
        "• **Operations**: String Manipulation, Character Frequency Counting, Substrings\n"
        "• **Patterns**: Palindrome, Anagram, Reverse Words\n"
        "• **Algorithms**: Pattern Matching (KMP, Rabin-Karp, Z-Algorithm)\n\n"
        "### **LEVEL 5 — Linked List**\n"
        "• **Types**: Singly Linked List, Doubly Linked List, Circular Linked List\n"
        "• **Operations**: Insertion, Deletion, Reverse Linked List (Iterative & Recursive)\n"
        "• **Key Problems**: Fast & Slow Pointers (Floyd's Cycle Detection), Find Middle, Merge Two Sorted Lists\n\n"
        "### **LEVEL 6 — Stack & Queue**\n"
        "• **Stack**: LIFO, Array & Linked List Implementation, Balanced Parentheses, Min Stack\n"
        "• **Queue**: FIFO, Circular Queue, Deque, Priority Queue\n"
        "• **Advanced**: Monotonic Stack (Next Greater Element, Trapping Rainwater)\n\n"
        "### **LEVEL 7 — Hashing**\n"
        "• **Structures**: Hash Map, Hash Set, Frequency Map\n"
        "• **Concepts**: Hash Functions, Collision Resolution (Chaining, Open Addressing)\n"
        "• **Problems**: 2-Sum, Subarray with 0 Sum, Longest Consecutive Sequence\n\n"
        "### **LEVEL 8 — Trees**\n"
        "• **Binary Tree**: Traversals (Pre-order, In-order, Post-order, Level-order), Height, Depth\n"
        "• **Binary Search Tree (BST)**: Search, Insert, Delete, Validate BST, LCA\n"
        "• **Heap / Priority Queue**: Min Heap, Max Heap, Heapify, Heap Sort, Top K Elements\n\n"
        "### **LEVEL 9 — Graphs**\n"
        "• **Representation**: Adjacency Matrix, Adjacency List\n"
        "• **Traversals**: Breadth-First Search (BFS), Depth-First Search (DFS)\n"
        "• **Algorithms**: Dijkstra's Shortest Path, Topological Sort (Kahn's), Cycle Detection, MST (Kruskal/Prim)\n\n"
        "### **LEVEL 10 — Recursion & Backtracking**\n"
        "• **Concepts**: Decision Tree, Base Cases, Backtracking State Reset\n"
        "• **Standard Problems**: Subsets, Permutations, Combination Sum, N-Queens, Sudoku Solver, Rat in a Maze\n\n"
        "### **LEVEL 11 — Greedy Algorithms**\n"
        "• **Strategy**: Local optimal choice leading to global optimum\n"
        "• **Classic Problems**: Activity Selection, Fractional Knapsack, Job Sequencing, Huffman Coding, Interval Merging\n\n"
        "### **LEVEL 12 — Dynamic Programming (DP)**\n"
        "• **Approaches**: Top-down (Memoization) vs Bottom-up (Tabulation)\n"
        "• **1D DP**: Fibonacci, Climbing Stairs, House Robber, Coin Change\n"
        "• **2D & Grid DP**: 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), Edit Distance\n\n"
        "### **LEVEL 13 — Advanced Data Structures**\n"
        "• **Trie**: Prefix Tree, Word Dictionary, Autocomplete\n"
        "• **Segment Tree & Fenwick Tree (BIT)**: Range Query & Point Update\n"
        "• **Disjoint Set Union (DSU)**: Union-Find with Path Compression & Rank\n\n"
        "---\n"
        '💡 **Next Step**: Type `"Explain Level 3"` to dive deep into Arrays, or type `"Give me DSA practice questions"` for hand-picked problems!'
    )


def get_binary_search_response() -> str:
    return (
        "# 🔍 Binary Search — Complete Technical Guide\n\n"
        "### **Definition**\n"
        "Binary Search is an efficient algorithm for finding an element in a **sorted array or range**. It repeatedly divides the search interval in half.\n\n"
        "---\n\n"
        "### **How It Works**\n"
        "1. Maintain two pointers: `left = 0` and `right = n - 1`.\n"
        "2. Find the middle index: `mid = left + (right - left) / 2`.\n"
        "3. If `arr[mid] == target`, target is found.\n"
        "4. If `arr[mid] < target`, discard left half: `left = mid + 1`.\n"
        "5. If `arr[mid] > target`, discard right half: `right = mid - 1`.\n"
        "6. Repeat until `left > right`.\n\n"
        "---\n\n"
        "### **Code Implementation (Java / C++ / Python)**\n\n"
        "```java\n"
        "// Binary Search in Java\n"
        "public class BinarySearch {\n"
        "    public static int search(int[] arr, int target) {\n"
        "        int left = 0, right = arr.length - 1;\n"
        "        while (left <= right) {\n"
        "            int mid = left + (right - left) / 2;\n"
        "            if (arr[mid] == target) return mid;\n"
        "            if (arr[mid] < target) left = mid + 1;\n"
        "            else right = mid - 1;\n"
        "        }\n"
        "        return -1; // Target not found\n"
        "    }\n\n"
        "    public static void main(String[] args) {\n"
        "        int[] arr = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};\n"
        "        int target = 23;\n"
        "        int result = search(arr, target);\n"
        "        System.out.println(\"Element found at index: \" + result); // Output: 5\n"
        "    }\n"
        "}\n"
        "```\n\n"
        "---\n\n"
        "### **Complexity Analysis**\n"
        "| Metric | Complexity | Reason |\n"
        "| :--- | :--- | :--- |\n"
        "| **Time Complexity** | O(log n) | Search space is halved at every step. |\n"
        "| **Space Complexity** | O(1) | Iterative implementation uses constant extra space. |\n\n"
        "---\n\n"
        "### **When to Use**\n"
        "• The array **MUST be sorted**.\n"
        "• Searching in a monotonic search space (e.g. finding minimum in rotated array, capacity problems)."
    )


def get_sorting_code_response(algorithm: str, lang: str = "Java") -> str:
    alg_clean = algorithm.title()
    if "Bubble" in alg_clean:
        return (
            f"# 🫧 Bubble Sort Algorithm ({lang})\n\n"
            "### **Overview**\n"
            "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.\n\n"
            "```c\n"
            "// Bubble Sort in C\n"
            "#include <stdio.h>\n\n"
            "void bubbleSort(int arr[], int n) {\n"
            "    for (int i = 0; i < n - 1; i++) {\n"
            "        int swapped = 0;\n"
            "        for (int j = 0; j < n - i - 1; j++) {\n"
            "            if (arr[j] > arr[j + 1]) {\n"
            "                int temp = arr[j];\n"
            "                arr[j] = arr[j + 1];\n"
            "                arr[j + 1] = temp;\n"
            "                swapped = 1;\n"
            "            }\n"
            "        }\n"
            "        if (!swapped) break; // Optimization\n"
            "    }\n"
            "}\n\n"
            "int main() {\n"
            "    int arr[] = {64, 34, 25, 12, 22, 11, 90};\n"
            "    int n = sizeof(arr) / sizeof(arr[0]);\n"
            "    bubbleSort(arr, n);\n"
            "    printf(\"Sorted array: \");\n"
            "    for (int i = 0; i < n; i++) printf(\"%d \", arr[i]);\n"
            "    return 0;\n"
            "}\n"
            "```\n\n"
            "### **Complexity**\n"
            "• **Best Case**: O(n) (already sorted)\n"
            "• **Worst / Average Case**: O(n^2)\n"
            "• **Space Complexity**: O(1) auxiliary"
        )

    elif "Quick" in alg_clean:
        return (
            f"# ⚡ Quick Sort Algorithm ({lang})\n\n"
            "### **Overview**\n"
            "Quick Sort is a Divide and Conquer algorithm. It picks an element as a **pivot** and partitions the array around the pivot.\n\n"
            "```java\n"
            "// Quick Sort in Java\n"
            "public class QuickSort {\n"
            "    private static int partition(int[] arr, int low, int high) {\n"
            "        int pivot = arr[high];\n"
            "        int i = low - 1;\n"
            "        for (int j = low; j < high; j++) {\n"
            "            if (arr[j] < pivot) {\n"
            "                i++;\n"
            "                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;\n"
            "            }\n"
            "        }\n"
            "        int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;\n"
            "        return i + 1;\n"
            "    }\n\n"
            "    public static void quickSort(int[] arr, int low, int high) {\n"
            "        if (low < high) {\n"
            "            int pi = partition(arr, low, high);\n"
            "            quickSort(arr, low, pi - 1);\n"
            "            quickSort(arr, pi + 1, high);\n"
            "        }\n"
            "    }\n\n"
            "    public static void main(String[] args) {\n"
            "        int[] arr = {10, 7, 8, 9, 1, 5};\n"
            "        quickSort(arr, 0, arr.length - 1);\n"
            "        for (int val : arr) System.out.print(val + \" \");\n"
            "    }\n"
            "}\n"
            "```\n\n"
            "### **Complexity**\n"
            "• **Average / Best Case**: O(n log n)\n"
            "• **Worst Case**: O(n^2) (when array is already sorted and bad pivot is chosen)\n"
            "• **Space Complexity**: O(log n) (recursion stack)"
        )

    else: # Merge sort
        return (
            f"# 🔀 Merge Sort Algorithm ({lang})\n\n"
            "```java\n"
            "// Merge Sort in Java\n"
            "public class MergeSort {\n"
            "    public static void merge(int[] arr, int l, int m, int r) {\n"
            "        int n1 = m - l + 1, n2 = r - m;\n"
            "        int[] L = new int[n1], R = new int[n2];\n"
            "        for (int i = 0; i < n1; ++i) L[i] = arr[l + i];\n"
            "        for (int j = 0; j < n2; ++j) R[j] = arr[m + 1 + j];\n\n"
            "        int i = 0, j = 0, k = l;\n"
            "        while (i < n1 && j < n2) {\n"
            "            if (L[i] <= R[j]) arr[k++] = L[i++];\n"
            "            else arr[k++] = R[j++];\n"
            "        }\n"
            "        while (i < n1) arr[k++] = L[i++];\n"
            "        while (j < n2) arr[k++] = R[j++];\n"
            "    }\n\n"
            "    public static void sort(int[] arr, int l, int r) {\n"
            "        if (l < r) {\n"
            "            int m = l + (r - l) / 2;\n"
            "            sort(arr, l, m);\n"
            "            sort(arr, m + 1, r);\n"
            "            merge(arr, l, m, r);\n"
            "        }\n"
            "    }\n\n"
            "    public static void main(String[] args) {\n"
            "        int[] arr = {12, 11, 13, 5, 6, 7};\n"
            "        sort(arr, 0, arr.length - 1);\n"
            "        for (int x : arr) System.out.print(x + \" \");\n"
            "    }\n"
            "}\n"
            "```\n\n"
            "### **Complexity**\n"
            "• **Time Complexity**: O(n log n) in all cases (Worst, Average, Best)\n"
            "• **Space Complexity**: O(n) extra space"
        )


def get_stack_vs_queue_response() -> str:
    return (
        "# 🥞 Stack vs 📬 Queue — Comprehensive Comparison\n\n"
        "### **Key Differences Table**\n\n"
        "| Feature | Stack | Queue |\n"
        "| :--- | :--- | :--- |\n"
        "| **Principle** | **LIFO** (Last In, First Out) | **FIFO** (First In, First Out) |\n"
        "| **Insertion Point** | Top (`push`) | Rear (`enqueue`) |\n"
        "| **Deletion Point** | Top (`pop`) | Front (`dequeue`) |\n"
        "| **Pointers** | Single pointer (`top`) | Two pointers (`front`, `rear`) |\n"
        "| **Real-world Analogy**| Stack of plates | Queue at a ticket counter |\n"
        "| **Use Cases** | Function call stack, Undo/Redo, Expression parsing | CPU task scheduling, BFS graph traversal, Printer buffer |\n\n"
        "---\n\n"
        "### **Code Implementation Example (Java)**\n\n"
        "```java\n"
        "import java.util.Stack;\n"
        "import java.util.LinkedList;\n"
        "import java.util.Queue;\n\n"
        "public class StackQueueDemo {\n"
        "    public static void main(String[] args) {\n"
        "        // Stack (LIFO)\n"
        "        Stack<Integer> stack = new Stack<>();\n"
        "        stack.push(10);\n"
        "        stack.push(20);\n"
        "        System.out.println(\"Stack Pop: \" + stack.pop()); // Output: 20\n\n"
        "        // Queue (FIFO)\n"
        "        Queue<Integer> queue = new LinkedList<>();\n"
        "        queue.add(10);\n"
        "        queue.add(20);\n"
        "        System.out.println(\"Queue Poll: \" + queue.poll()); // Output: 10\n"
        "    }\n"
        "}\n"
        "```"
    )


def get_oop_polymorphism_response() -> str:
    return (
        "# ☕ OOP & Polymorphism in Java\n\n"
        "### **What is OOP?**\n"
        "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of **objects** containing data and methods.\n\n"
        "The **4 Pillars of OOP**:\n"
        "1. **Encapsulation**: Bundling data (variables) and methods into a single class, restricting direct access.\n"
        "2. **Abstraction**: Hiding internal implementation details and showing only essential functionality.\n"
        "3. **Inheritance**: Allowing a child class to inherit properties and behavior from a parent class.\n"
        "4. **Polymorphism**: The ability of an object or method to take on multiple forms.\n\n"
        "---\n\n"
        "### **Polymorphism Types in Java**\n\n"
        "#### 1. Compile-Time Polymorphism (Method Overloading)\n"
        "Same method name with **different parameters** within the same class.\n\n"
        "```java\n"
        "class Calculator {\n"
        "    int add(int a, int b) { return a + b; }\n"
        "    double add(double a, double b) { return a + b; }\n"
        "}\n"
        "```\n\n"
        "#### 2. Runtime Polymorphism (Method Overriding)\n"
        "Child class provides a specific implementation of a method already declared in its parent class.\n\n"
        "```java\n"
        "class Animal {\n"
        "    void makeSound() { System.out.println(\"Animal makes a sound\"); }\n"
        "}\n\n"
        "class Dog extends Animal {\n"
        "    @Override\n"
        "    void makeSound() { System.out.println(\"Dog barks 🐶\"); }\n"
        "}\n\n"
        "public class Main {\n"
        "    public static void main(String[] args) {\n"
        "        Animal myDog = new Dog(); // Upcasting\n"
        "        myDog.makeSound(); // Output: Dog barks 🐶 (Resolved at Runtime)\n"
        "    }\n"
        "}\n"
        "```\n\n"
        "---\n\n"
        "### **Interview Tip**\n"
        "Runtime polymorphism is achieved through **Dynamic Method Dispatch**. Java resolves the method call based on the actual object being referred to at runtime, not the reference variable type."
    )


def get_dbms_normalization_response() -> str:
    return (
        "# 🗄️ DBMS Normalization — Step-by-Step Guide\n\n"
        "### **What is Normalization?**\n"
        "Normalization is the process of organizing data in a database to **reduce redundancy** and **eliminate data anomalies** (Insertion, Update, Deletion anomalies).\n\n"
        "---\n\n"
        "### **Normal Forms Breakdown**\n\n"
        "| Normal Form | Rule / Requirement | Solution Provided |\n"
        "| :--- | :--- | :--- |\n"
        "| **1NF** (First Normal Form) | Each column must contain **atomic (indivisible) values**. No repeating groups. | Split comma-separated values into separate rows. |\n"
        "| **2NF** (Second Normal Form) | Must be in 1NF + All non-key attributes must be **fully functionally dependent** on the primary key (No partial dependency). | Move partial dependencies into a separate table. |\n"
        "| **3NF** (Third Normal Form) | Must be in 2NF + No **transitive dependency** (non-key column depending on another non-key column). | Move transitive dependencies into a separate lookup table. |\n"
        "| **BCNF** (Boyce-Codd NF) | Must be in 3NF + For every functional dependency X -> Y, X MUST be a **super key**. | Stricter version of 3NF for overlapping candidate keys. |\n\n"
        "---\n\n"
        "### **ACID Properties Quick Reference**\n"
        "• **Atomicity**: All operations in a transaction succeed, or all fail (All-or-Nothing).\n"
        "• **Consistency**: Database transitions from one valid state to another.\n"
        "• **Isolation**: Concurrent transactions execute without interfering with each other.\n"
        "• **Durability**: Committed data is permanently saved, even after a crash."
    )


def get_cs_core_response(topic: str) -> str:
    topic_lower = topic.lower()
    if "osi" in topic_lower:
        return (
            "# 🌐 OSI Model — 7 Layers Explained\n\n"
            "The Open Systems Interconnection (OSI) model conceptualizes network communication in 7 layers:\n\n"
            "1. **Application Layer (Layer 7)**: User interface & network services. *(Protocols: HTTP, HTTPS, FTP, SMTP, DNS)*\n"
            "2. **Presentation Layer (Layer 6)**: Data translation, encryption & compression. *(SSL/TLS, JPEG, ASCII)*\n"
            "3. **Session Layer (Layer 5)**: Manages sessions between applications. *(NetBIOS, RPC)*\n"
            "4. **Transport Layer (Layer 4)**: End-to-end delivery & flow control. *(TCP, UDP, Ports)*\n"
            "5. **Network Layer (Layer 3)**: Routing & logical addressing across networks. *(IP, ICMP, Routers)*\n"
            "6. **Data Link Layer (Layer 2)**: Physical addressing & framing. *(MAC Addresses, Switches, Ethernet)*\n"
            "7. **Physical Layer (Layer 1)**: Transmission of raw binary bits over physical medium. *(Cables, Hubs, Fiber)*"
        )

    elif "tcp" in topic_lower:
        return (
            "# 🔌 TCP vs UDP — Transport Protocols\n\n"
            "### **TCP (Transmission Control Protocol)**\n"
            "• **Connection-Oriented**: Requires 3-way handshake (`SYN` -> `SYN-ACK` -> `ACK`) before data transfer.\n"
            "• **Reliable**: Guarantees packet delivery, ordering, and error checking.\n"
            "• **Speed**: Slower due to overhead.\n"
            "• **Use Cases**: Web browsing (HTTP/HTTPS), Email (SMTP), File transfer (FTP).\n\n"
            "### **UDP (User Datagram Protocol)**\n"
            "• **Connectionless**: Sends packets (\"datagrams\") without establishing a connection.\n"
            "• **Unreliable**: No guarantee of delivery or ordering.\n"
            "• **Speed**: Very fast with minimal overhead.\n"
            "• **Use Cases**: Video streaming, Online Gaming, VoIP calls, DNS lookup."
        )

    elif "dns" in topic_lower:
        return (
            "# 🌐 DNS (Domain Name System) — How It Works\n\n"
            "DNS translates human-readable domain names (e.g., `skillnexa.com`) into machine-readable IP addresses (e.g., `192.0.2.1`).\n\n"
            "### **Resolution Steps**:\n"
            "1. **Browser Cache**: Checks local browser/OS cache.\n"
            "2. **Recursive Resolver**: Queries your ISP's DNS resolver.\n"
            "3. **Root Name Server**: Directs resolver to `.com` TLD server.\n"
            "4. **TLD Name Server**: Directs resolver to `skillnexa.com` authoritative server.\n"
            "5. **Authoritative Server**: Returns the IP address `192.0.2.1` to the browser."
        )

    else:
        return (
            f"# 💻 Technical Overview: {topic.title()}\n\n"
            "### **Core Definition**\n"
            f"{topic.title()} is a fundamental computer science concept widely evaluated in technical interviews and software development.\n\n"
            "### **Key Highlights**\n"
            "• **Core Purpose**: Optimizes system design, execution efficiency, and maintainability.\n"
            "• **Best Practices**: Clean modular code, proper error handling, adhering to standard design patterns.\n"
            "• **Interview Significance**: Commonly tested in technical rounds for software engineering roles."
        )


def get_role_roadmap_response(role: str) -> str:
    role_clean = role.title()
    return (
        f"# 🗺️ Complete Career Roadmap: {role_clean}\n\n"
        "---\n\n"
        "### **PHASE 1 — Prerequisites & Computer Science Basics**\n"
        "• **Language Fundamentals**: Master at least one core language (JavaScript/TypeScript for Frontend, Node/Python/Java for Backend)\n"
        "• **Data Structures & Algorithms**: Arrays, Strings, HashMaps, Recursion, Time Complexity\n"
        "• **Git & Version Control**: Repositories, Branching, Pull Requests, Merge Conflict Resolution\n\n"
        "### **PHASE 2 — Core Technical Stack**\n"
        "• **Frontend**: HTML5, CSS3, JavaScript (ES6+), React.js, TailwindCSS\n"
        "• **Backend**: Node.js + Express / Python FastAPI / Java Spring Boot\n"
        "• **Database**: MongoDB (NoSQL) & PostgreSQL/MySQL (Relational)\n"
        "• **APIs**: RESTful API Design, JSON Data Exchange, Authentication (JWT/OAuth)\n\n"
        "### **PHASE 3 — Tools & Infrastructure**\n"
        "• **DevOps Basics**: Docker Containerization, Linux Commands, Shell Scripting\n"
        "• **Cloud Platforms**: Vercel, Render, AWS Free Tier (EC2, S3)\n"
        "• **Testing**: Unit Testing, API Testing (Postman)\n\n"
        "### **PHASE 4 — Real-World Projects**\n"
        "1. **Full-Stack Application**: CRUD app with authentication and database.\n"
        "2. **Domain Project**: Real-time app (WebSockets) or API integration project.\n"
        "3. **Portfolio Deployment**: Host code on GitHub with professional README documentation.\n\n"
        "### **PHASE 5 — Interview & Job Preparation**\n"
        "• **Resume Building**: ATS keyword optimization using SkillNexa Resume Analyzer.\n"
        "• **Mock Interviews**: Practice coding & technical Q&A on SkillNexa AI Interview Prep.\n"
        "• **Job Applications**: Apply through SkillNexa Job Board with verified skills."
    )


def get_placement_plan_response() -> str:
    return (
        "# 📅 3-Month Intensive Placement Preparation Plan\n\n"
        "---\n\n"
        "### **MONTH 1 — Fundamentals & DSA Core**\n"
        "• **Weeks 1–2**: Language mastery + Complexity Analysis + Arrays & Strings\n"
        "• **Weeks 3–4**: Linked Lists, Stacks, Queues, Hashing, Recursion\n"
        "• **Daily Routine**: Solve 2–3 DSA problems daily + Review solutions\n\n"
        "### **MONTH 2 — Advanced DSA + CS Core + Projects**\n"
        "• **Weeks 5–6**: Binary Trees, BST, Graph Traversal (BFS/DFS), Dynamic Programming\n"
        "• **Weeks 7–8**: DBMS (SQL, Normalization), OS (Processes, Deadlocks), Networks (OSI, TCP)\n"
        "• **Project**: Complete 1 major full-stack project and push to GitHub\n\n"
        "### **MONTH 3 — System Design + Mock Interviews + Applications**\n"
        "• **Weeks 9–10**: System Design basics (Load Balancers, Caching, REST APIs)\n"
        "• **Weeks 11–12**: Resume optimization, 5+ Mock Interviews, Apply to 10+ jobs weekly\n\n"
        "---\n"
        "💡 **Pro Tip**: Use SkillNexa verified assessments to earn badges that boost your candidate match score!"
    )


def get_skill_improvement_response(topic: str, profile: dict) -> str:
    skills = [s.get("name", "") for s in profile.get("skills", [])]
    return (
        f"# 📈 Skill Improvement Plan: {topic.title()}\n\n"
        "### **1. Current Level Assessment**\n"
        f"• Current profile skills detected: **{', '.join(skills[:4]) if skills else 'None listed'}**\n"
        f"• Target Goal: Deepen domain expertise in **{topic.title()}** for technical interviews.\n\n"
        "---\n\n"
        "### **2. Structured Learning Plan**\n"
        "• **Week 1 (Foundations)**: Syntax, core features, standard libraries.\n"
        "• **Week 2 (Core Concepts)**: OOP / Advanced data structures, error handling, async programming.\n"
        "• **Week 3 (Hands-on Practice)**: Solve 20+ topic-specific coding challenges.\n"
        f"• **Week 4 (Project Application)**: Build a production-ready project incorporating {topic.title()}.\n\n"
        "---\n\n"
        "### **3. Recommended Next Steps**\n"
        f"1. Take the **SkillNexa Assessment** for {topic.title()} to verify your skills.\n"
        "2. Update your SkillNexa profile with your newest project repo.\n"
        "3. Check **Skill Gap Analysis** in your AI workspace to track missing skills for your target role."
    )


def get_interview_questions_response(topic: str) -> str:
    topic_clean = topic.title()
    return (
        f"# 🎯 Top Interview Questions: {topic_clean}\n\n"
        "---\n\n"
        "### **1. Beginner Level**\n"
        f"**Q1: What is the primary purpose of {topic_clean}?**\n"
        "> *Answer*: It provides a structured, scalable approach to building software components, improving performance, and maintaining clean code.\n\n"
        "**Q2: What is the difference between value types and reference types?**\n"
        "> *Answer*: Value types store data directly in memory (stack), whereas reference types store a pointer to the memory location of the object (heap).\n\n"
        "---\n\n"
        "### **2. Intermediate Level**\n"
        "**Q3: How do you handle exceptions and error states cleanly?**\n"
        "> *Answer*: Using `try-catch-finally` blocks, custom exception classes, and logging errors without swallowing stack traces.\n\n"
        "**Q4: Explain memory management and garbage collection.**\n"
        "> *Answer*: Automatic memory management identifies objects that are no longer reachable in the heap and reclaims their memory space.\n\n"
        "---\n\n"
        "### **3. Advanced Level**\n"
        f"**Q5: How would you optimize the performance of a high-load system using {topic_clean}?**\n"
        "> *Answer*: By using efficient indexing, caching frequently accessed results (Redis), avoiding synchronous blocking calls, and optimizing algorithm time complexity."
    )


def get_practice_questions_response(topic: str = "DSA") -> str:
    return (
        "# 📝 DSA Practice Questions & Problems\n\n"
        "Here are 5 hand-picked practice problems frequently asked in technical interviews:\n\n"
        "1. **Two Sum**: Find two numbers in an array that add up to a target value. *(Arrays / Hashing)*\n"
        "2. **Reverse a Linked List**: Reverse a singly linked list in O(n) time and O(1) space. *(Linked List)*\n"
        "3. **Valid Parentheses**: Determine if an input string of brackets is valid. *(Stack)*\n"
        "4. **Binary Tree Level Order Traversal**: Print nodes level by level. *(Trees / BFS)*\n"
        "5. **Longest Substring Without Repeating Characters**: Find length of longest substring. *(Sliding Window)*\n\n"
        "---\n"
        '💡 **Want Solutions?** Type `"Give solutions of these questions"` or `"Convert the solution to Java"`!'
    )


def get_practice_solutions_response(lang: str = "Java") -> str:
    return (
        f"# 💡 Solutions to Practice Problems ({lang})\n\n"
        "### **Problem 1: Two Sum (O(n) using HashMap)**\n\n"
        "```java\n"
        "import java.util.HashMap;\n\n"
        "public class TwoSum {\n"
        "    public static int[] twoSum(int[] nums, int target) {\n"
        "        HashMap<Integer, Integer> map = new HashMap<>();\n"
        "        for (int i = 0; i < nums.length; i++) {\n"
        "            int complement = target - nums[i];\n"
        "            if (map.containsKey(complement)) {\n"
        "                return new int[] { map.get(complement), i };\n"
        "            }\n"
        "            map.put(nums[i], i);\n"
        "        }\n"
        "        return new int[] {};\n"
        "    }\n\n"
        "    public static void main(String[] args) {\n"
        "        int[] result = twoSum(new int[] {2, 7, 11, 15}, 9);\n"
        "        System.out.println(\"Indices: [\" + result[0] + \", \" + result[1] + \"]\"); // Output: [0, 1]\n"
        "    }\n"
        "}\n"
        "```\n\n"
        "### **Problem 2: Reverse Linked List (O(n) Time, O(1) Space)**\n\n"
        "```java\n"
        "class ListNode {\n"
        "    int val; ListNode next;\n"
        "    ListNode(int val) { this.val = val; }\n"
        "}\n\n"
        "public class ReverseList {\n"
        "    public static ListNode reverseList(ListNode head) {\n"
        "        ListNode prev = null, curr = head;\n"
        "        while (curr != null) {\n"
        "            ListNode nextTemp = curr.next;\n"
        "            curr.next = prev;\n"
        "            prev = curr;\n"
        "            curr = nextTemp;\n"
        "        }\n"
        "        return prev;\n"
        "    }\n"
        "}\n"
        "```"
    )


def get_profile_match_response(profile: dict, message: str) -> str:
    skills = [s.get("name", "") for s in profile.get("skills", [])]
    projects = profile.get("projects", [])
    cgpa = profile.get("cgpa", 0)
    target_role = profile.get("targetRole", "Software Engineer")

    from app.routers.career import ROLE_SKILL_MAP
    role_skills = ROLE_SKILL_MAP.get(target_role, [])
    skills_lower = [s.lower() for s in skills]
    missing = [s for s in role_skills if s.lower() not in skills_lower]

    return (
        "# 🎯 Personalized Profile & Career Match Analysis\n\n"
        "Based on your actual SkillNexa profile data:\n"
        f"• **Detected Skills**: {', '.join(skills) if skills else 'None listed — add skills in Portfolio'}\n"
        f"• **Academic CGPA**: {cgpa if cgpa > 0 else 'Not set'}\n"
        f"• **Projects Completed**: {len(projects)}\n"
        f"• **Target Career Role**: **{target_role}**\n\n"
        "---\n\n"
        "### **Key Insights**:\n"
        f"1. **Match Status**: You currently match **{round(((len(skills) - len(missing)) / max(1, len(role_skills))) * 100)}%** of requirements for {target_role}.\n"
        f"2. **Missing Skills to Acquire**: {', '.join(missing[:4]) if missing else 'None — your skill set aligns well!'}\n"
        "3. **Recommended Actions**:\n"
        "   • Complete SkillNexa skill assessments for verified badges.\n"
        f"   • Add GitHub repository links for your {len(projects)} project(s).\n"
        "   • Use the **Skill Gap** and **Resume Analyzer** tools in your AI workspace."
    )


# ─────────────────────────────────────────────────────────────────────────────
# 3. Main Chat Endpoint Router
# ─────────────────────────────────────────────────────────────────────────────

def get_performance_analytics_response(profile: dict) -> str:
    skills = profile.get("skills", [])
    cgpa = profile.get("cgpa", 0)
    projects = profile.get("projects", [])
    internships = profile.get("internships", [])
    
    verified_skills = [s.get("name", s) if isinstance(s, dict) else str(s) for s in skills if isinstance(s, dict) and s.get("verified")]
    
    return (
        "# 📊 Student Performance Analytics & AI Feedback\n\n"
        "### Overall Performance Overview\n"
        f"- **Academic Standing (CGPA)**: `{cgpa}/10.0`\n"
        f"- **Verified Skills**: `{len(verified_skills)}` ({', '.join(verified_skills) if verified_skills else 'None verified yet'})\n"
        f"- **Portfolio Projects**: `{len(projects)}` project(s)\n"
        f"- **Industry Internships**: `{len(internships)}` internship(s)\n\n"
        "---\n\n"
        "### Key Data-Grounded Insights\n\n"
        "#### 🟢 Strengths\n"
        f"- **Academic Foundation**: CGPA of `{cgpa}/10` provides solid eligibility across top campus placements.\n"
        f"- **Hands-on Projects**: Created `{len(projects)}` project(s) demonstrating technical application.\n\n"
        "#### 🟠 Areas for Improvement\n"
        "- **Skill Verification**: Earn verified badges by completing proctored skill assessments.\n"
        "- **DSA & Problem Solving**: Practice Array, String, and Tree topics to boost placement matching score.\n\n"
        "---\n\n"
        "### Recommended Next Steps\n"
        "1. Navigate to the **AI Command Center → Performance Analytics** section to view your full Subject-wise and DSA topic breakdown.\n"
        "2. Complete 2 additional skill assessments to build a verified historical trend.\n"
        "3. Review your **Skill Gap** dashboard to prioritize missing skills for your target role.\n"
    )


@router.post("/chat")
def career_assistant_chat(req: CareerAssistantRequest):

    if not req.message or len(req.message.strip()) < 2:
        return {"success": False, "error": "Message is too short"}

    msg = req.message.strip()
    analysis = detect_intent(msg, req.conversationHistory)
    intent = analysis["intent"]

    response_text = ""
    topics = []
    recommendations = []
    personalized = False

    # Route based on intent
    if intent == "DSA_ROADMAP":
        response_text = get_dsa_roadmap_response(req.studentProfile)
        topics = ["DSA", "Arrays", "Trees", "Graphs", "DP"]
        recommendations = ["Explain Level 3", "Give me DSA practice questions"]
        personalized = True

    elif intent == "DSA_LEVEL_EXPLANATION":
        response_text = (
            "# 📊 Level 3 Breakdown — Arrays & Searching/Sorting\n\n"
            "Arrays are contiguous memory blocks. Mastering Level 3 requires understanding:\n\n"
            "1. **Fundamental Operations**:\n"
            "   • Access: O(1)\n"
            "   • Search: O(n) Linear, O(log n) Binary Search (Sorted)\n"
            "   • Insertion / Deletion: O(n)\n\n"
            "2. **Core Patterns to Practice**:\n"
            "   • **Two Pointers**: Used in 2-Sum, Palindrome, Reverse Array.\n"
            "   • **Sliding Window**: Maximum sum subarray of size K, Longest substring.\n"
            "   • **Prefix Sum**: Subarray sum equals K queries.\n"
            "   • **Kadane's Algorithm**: Maximum contiguous subarray sum in O(n) time."
        )
        topics = ["Arrays", "Two Pointers", "Sliding Window"]
        recommendations = ["Give me practice questions", "Give bubble sort code"]

    elif intent == "DSA_CONCEPT":
        msg_lower = msg.lower()
        if "binary search" in msg_lower:
            response_text = get_binary_search_response()
        elif "stack" in msg_lower or "queue" in msg_lower:
            response_text = get_stack_vs_queue_response()
        else:
            response_text = get_binary_search_response()
        topics = ["DSA", "Search", "Complexity"]

    elif intent == "CODE_REQUEST" or intent == "CODE_TRANSLATION":
        msg_lower = msg.lower()
        lang = "Java"
        if "python" in msg_lower: lang = "Python"
        elif "c++" in msg_lower or "cpp" in msg_lower: lang = "C++"
        elif "in c" in msg_lower or "c code" in msg_lower: lang = "C"

        if "bubble sort" in msg_lower:
            response_text = get_sorting_code_response("Bubble", lang)
        elif "quick sort" in msg_lower:
            response_text = get_sorting_code_response("Quick", lang)
        elif "merge sort" in msg_lower:
            response_text = get_sorting_code_response("Merge", lang)
        else:
            response_text = get_sorting_code_response("Quick", lang)
        topics = ["Coding", lang, "Algorithms"]

    elif intent == "TECHNICAL_CONCEPT":
        msg_lower = msg.lower()
        if "polymorphism" in msg_lower or "oop" in msg_lower:
            response_text = get_oop_polymorphism_response()
        elif "dbms" in msg_lower or "normalization" in msg_lower or "acid" in msg_lower:
            response_text = get_dbms_normalization_response()
        else:
            response_text = get_cs_core_response(msg)
        topics = ["CS Core", "Software Engineering"]

    elif intent == "ROLE_ROADMAP":
        response_text = get_role_roadmap_response(msg)
        topics = ["Career", "Roadmap"]

    elif intent == "PLACEMENT_PLAN":
        response_text = get_placement_plan_response()
        topics = ["Placement", "Career Prep"]

    elif intent == "SKILL_IMPROVEMENT":
        response_text = get_skill_improvement_response(msg, req.studentProfile)
        personalized = True

    elif intent == "INTERVIEW_QUESTIONS":
        response_text = get_interview_questions_response(msg)
        topics = ["Interview Prep"]

    elif intent == "PRACTICE_QUESTIONS":
        response_text = get_practice_questions_response(msg)

    elif intent == "PRACTICE_SOLUTIONS":
        response_text = get_practice_solutions_response("Java")

    elif intent == "PROFILE_CAREER_MATCH":
        response_text = get_profile_match_response(req.studentProfile, msg)
        personalized = True

    elif intent == "PERFORMANCE_ANALYTICS":
        response_text = get_performance_analytics_response(req.studentProfile)
        personalized = True
        topics = ["Performance Analytics", "Skill Progress"]

    else:
        # General technical fallback
        response_text = get_cs_core_response(msg)


    return {
        "success": True,
        "response": response_text,
        "answer": response_text,
        "intent": intent,
        "topics": topics,
        "recommendations": recommendations,
        "personalized": personalized,
        "providerUsed": "skillnexa_technical_ai_engine",
    }

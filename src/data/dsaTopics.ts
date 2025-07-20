import { Topic } from "@/types";

export const dsaTopics: Topic[] = [
  {
    id: "alien-dictionary",
    title: "Alien Dictionary",
    difficulty: "easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "Determine if words are sorted lexicographically according to order of letters in an alien language.",
    content: `# Alien Dictionary

## Problem Statement
Given a list of words from an alien language, determine if the words are sorted lexicographically according to the order of letters in the alien language.

## Approach
1. Compare adjacent words to find character relationships
2. Build a directed graph of character dependencies
3. Use topological sort to determine the valid ordering

## Solution
\`\`\`python
def alien_dictionary(words):
    # Implementation here
    pass
\`\`\`

## Time Complexity: O(n)
## Space Complexity: O(1)`
  },
  {
    id: "basic-calculator",
    title: "Basic Calculator",
    difficulty: "medium",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    description: "Implement a basic calculator to evaluate a simple expression string.",
    content: `# Basic Calculator

## Problem Statement
Implement a basic calculator to evaluate a simple expression string containing non-negative integers, +, -, *, / operators and parentheses.

## Approach
1. Use a stack to handle operations and parentheses
2. Process characters one by one
3. Handle operator precedence correctly

## Solution
\`\`\`python
def calculate(s):
    # Implementation here
    pass
\`\`\`

## Time Complexity: O(n)
## Space Complexity: O(n)`
  },
  {
    id: "binary-search-tree-iterator",
    title: "Binary Search Tree Iterator",
    difficulty: "medium",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    description: "Implement an iterator over a binary search tree (BST).",
    content: `# Binary Search Tree Iterator

## Problem Statement
Implement an iterator over a binary search tree (BST). Your iterator will be initialized with the root node of a BST.

## Approach
1. Use a stack to store nodes
2. Initialize by pushing all left nodes
3. For next(), pop and return the node, then push its right subtree's left nodes

## Solution
\`\`\`python
class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self._leftmost_inorder(root)
    
    def _leftmost_inorder(self, root):
        while root:
            self.stack.append(root)
            root = root.left
    
    def next(self):
        topmost_node = self.stack.pop()
        if topmost_node.right:
            self._leftmost_inorder(topmost_node.right)
        return topmost_node.val
    
    def hasNext(self):
        return len(self.stack) > 0
\`\`\`

## Time Complexity: O(n)
## Space Complexity: O(n)`
  },
  {
    id: "best-time-buy-sell-stock-ii",
    title: "Best Time to Buy and Sell Stock II",
    difficulty: "easy",
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    description: "Find the maximum profit from buying and selling stocks with multiple transactions allowed.",
    content: `# Best Time to Buy and Sell Stock II

## Problem Statement
You are given an array where the ith element is the price of a given stock on day i. Find the maximum profit you can achieve by completing as many transactions as you like.

## Approach
1. Buy and sell on consecutive days if price increases
2. Sum all positive price differences

## Solution
\`\`\`python
def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i-1]:
            profit += prices[i] - prices[i-1]
    return profit
\`\`\`

## Time Complexity: O(n)
## Space Complexity: O(1)`
  },
  {
    id: "binary-tree-maximum-path-sum",
    title: "Binary Tree Maximum Path Sum",
    difficulty: "hard",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    description: "Find the maximum path sum in a binary tree where a path can start and end at any nodes.",
    content: `# Binary Tree Maximum Path Sum

## Problem Statement
A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once.

## Approach
1. Use recursive DFS to calculate maximum path sum
2. For each node, consider: node only, node + left, node + right, node + left + right
3. Update global maximum at each step

## Solution
\`\`\`python
def maxPathSum(root):
    max_sum = float('-inf')
    
    def max_gain(node):
        nonlocal max_sum
        if not node:
            return 0
        
        left_gain = max(max_gain(node.left), 0)
        right_gain = max(max_gain(node.right), 0)
        
        price_newpath = node.val + left_gain + right_gain
        max_sum = max(max_sum, price_newpath)
        
        return node.val + max(left_gain, right_gain)
    
    max_gain(root)
    return max_sum
\`\`\`

## Time Complexity: O(n)
## Space Complexity: O(n)`
  }
];
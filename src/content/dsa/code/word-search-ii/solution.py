class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        # Build Trie
        root = TrieNode()
        for word in words:
            node = root
            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.word = word
        
        result = []
        m, n = len(board), len(board[0])
        
        def dfs(i: int, j: int, node: TrieNode):
            if not node:
                return
            
            char = board[i][j]
            if char not in node.children:
                return
            
            node = node.children[char]
            if node.word:
                result.append(node.word)
                node.word = None  # avoid duplicates
            
            board[i][j] = '#'
            
            for di, dj in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                ni, nj = i + di, j + dj
                if 0 <= ni < m and 0 <= nj < n and board[ni][nj] != '#':
                    dfs(ni, nj, node)
            
            board[i][j] = char
        
        for i in range(m):
            for j in range(n):
                dfs(i, j, root)
        
        return result
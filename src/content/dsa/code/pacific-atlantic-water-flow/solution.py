class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        if not heights:
            return []
        
        m, n = len(heights), len(heights[0])
        pacific = [[False] * n for _ in range(m)]
        atlantic = [[False] * n for _ in range(m)]
        
        def dfs(visited, i, j):
            visited[i][j] = True
            for di, dj in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                x, y = i + di, j + dj
                if (0 <= x < m and 0 <= y < n and 
                    not visited[x][y] and heights[x][y] >= heights[i][j]):
                    dfs(visited, x, y)
        
        for i in range(m):
            dfs(pacific, i, 0)
            dfs(atlantic, i, n - 1)
        
        for j in range(n):
            dfs(pacific, 0, j)
            dfs(atlantic, m - 1, j)
        
        result = []
        for i in range(m):
            for j in range(n):
                if pacific[i][j] and atlantic[i][j]:
                    result.append([i, j])
        
        return result
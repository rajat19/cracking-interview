class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        row, col = len(grid), len(grid[0])
        rotting = {(i, j) for i in range(row) for j in range(col) if grid[i][j] == 2}
        fresh = {(i, j) for i in range(row) for j in range(col) if grid[i][j] == 1}
        timer = 0
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        while fresh:
            if not rotting: return -1
            infected = set()
            for i, j in rotting:
                for di, dj in directions:
                    if (i+di, j+dj) in fresh:
                        infected.add((i+di, j+dj))
            rotting = infected
            fresh -= rotting
            timer += 1
        return timer
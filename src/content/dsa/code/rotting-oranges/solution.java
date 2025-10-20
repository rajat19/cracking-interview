class Solution {
    public int orangesRotting(int[][] grid) {
        int n = grid.length, m=grid[0].length;
        Queue<Point> q = new LinkedList<>();
        for(int i=0; i<n; i++) {
            for(int j=0; j<m; j++) {
                if (grid[i][j] == 2) {
                    q.offer(new Point(i, j));
                }
            }
        }
        int steps = 0;
        int[] dir = new int[]{0, -1, 0, 1, 0};
        int[][] checked = new int[n][m];
        while(q.size() > 0) {
            int qs = q.size();
            for(int k=0; k<qs; k++) {
                Point p = q.poll();
                grid[p.x][p.y] = 2;
                for(int i=0; i<4; i++) {
                    int nx = p.x+dir[i], ny = p.y+dir[i+1];
                    if (nx>=0 && nx<n && ny>=0 && ny<m && grid[nx][ny] == 1 && checked[nx][ny]==0) {
                        checked[nx][ny] = 1;
                        q.offer(new Point(nx, ny));
                    } 
                }
            }
            if(q.size() > 0) steps++;
        }
        for(int i=0; i<n; i++) {
            for(int j=0; j<m; j++) {
                if (grid[i][j] == 1) {
                    return -1;
                }
            }
        }
        return steps;
    }
}

class Point {
    int x; int y;
    Point(int a, int b) {
        x=a; y=b;
    }
}
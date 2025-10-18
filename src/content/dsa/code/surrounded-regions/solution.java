class Solution {
    public void solve(char[][] board) {
        int n = board.length, m = board[0].length;
        for(int i=0; i<n; i++) {
            for(int j=0; j<m; j++) {
                if (board[i][j] == 'O' && (i==0 || j==0 || i==n-1 || j==m-1)) {
                    dfs(board, i, j, n, m);
                }
            }
        }
        for(int i=0; i<n; i++) {
            for(int j=0; j<m; j++) {
                if (board[i][j] == 'O') {
                    board[i][j] = 'X';
                } else if (board[i][j] == '1') {
                    board[i][j] = 'O';
                }
            }
        }
    }
    
    private void dfs(char[][] board, int x, int y, int n, int m) {
        board[x][y] = '1';
        int[] dir = new int[]{-1,0,1,0,-1};
        for(int i=0; i<4; i++) {
            int nx = x+dir[i], ny = y+dir[i+1];
            if (nx>=0 && ny>=0 && nx<n && ny<m && board[nx][ny] == 'O') {
                dfs(board, nx, ny, n, m);
            }
        }
    }
}
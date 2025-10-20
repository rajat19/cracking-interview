import java.util.*;

class Solution {
    private List<String> res;
    private int n;
    
    public List<String> generateParenthesis(int n) {
        this.n = n;
        this.res = new ArrayList<>();
        dfs("", 0, 0);
        return res;
    }
    
    private void dfs(String s, int open, int close) {
        // base case
        if (s.length() == 2 * n) {
            res.add(s);
            return;
        }

        if (open < n) {
            // add an opening parenthesis and increment the open count
            dfs(s + "(", open + 1, close);
        }
        
        if (close < open) {
            // add a closing parenthesis and increment the close count
            dfs(s + ")", open, close + 1);
        }
    }
}
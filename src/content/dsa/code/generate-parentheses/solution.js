function generateParenthesis(n) {
    const res = [];

    function dfs(s, open, close) {
        // base case
        if (s.length === 2 * n) {
            res.push(s);
            return;
        }

        if (open < n) {
            // add an opening parenthesis and increment the open count
            dfs(s + '(', open + 1, close);
        }
        
        if (close < open) {
            // add a closing parenthesis and increment the close count
            dfs(s + ')', open, close + 1);
        }
    }

    dfs("", 0, 0);
    return res;
}
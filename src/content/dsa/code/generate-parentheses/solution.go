func generateParenthesis(n int) []string {
    var result []string
    
    var dfs func(string, int, int)
    dfs = func(s string, open, close int) {
        // base case
        if len(s) == 2*n {
            result = append(result, s)
            return
        }

        if open < n {
            // add an opening parenthesis and increment the open count
            dfs(s+"(", open+1, close)
        }
        
        if close < open {
            // add a closing parenthesis and increment the close count
            dfs(s+")", open, close+1)
        }
    }
    
    dfs("", 0, 0)
    return result
}
#include <vector>
#include <string>
using namespace std;

class Solution {
private:
    vector<string> res;
    int n;
    
    void dfs(string s, int open, int close) {
        // base case
        if (s.length() == 2 * n) {
            res.push_back(s);
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
    
public:
    vector<string> generateParenthesis(int n) {
        this->n = n;
        dfs("", 0, 0);
        return res;
    }
};
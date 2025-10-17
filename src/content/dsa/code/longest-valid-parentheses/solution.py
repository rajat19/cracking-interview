class Solution:
    def longestValidParentheses(self, s: str) -> int:
        longest, l = 0, len(s)
        stack = []
        for i in range(l):
            if s[i] == ')' and stack and s[stack[-1]] == '(':
                stack.pop()
                continue
            stack.append(i)
        if not stack: return l
        a, b = l, 0
        while stack:
            b = stack.pop()
            longest = max(longest, a-b-1)
            a = b
        longest = max(longest, a)
        return longest
            
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        count = {}
        for char in s:
            count[char] = count.get(char, 0) + 1
        for char in t:
            count[char] = count.get(char, 0) - 1
            if count[char] < 0:
                return False
        return True
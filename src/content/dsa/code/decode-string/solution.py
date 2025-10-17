class Solution:
    def decodeString(self, s: str) -> str:
        queue = []
        for c in s:
            queue.append(c)
        return self.helper(queue)

    def helper(self, queue) -> str:
        s = ''
        num = 0
        while len(queue) > 0:
            el = queue.pop(0)
            if el == '[':
                sub = self.helper(queue)
                s += num *sub
                num = 0
            elif '0' <= el <= '9':
                num = num*10 + int(el)
            elif el == ']':
                break
            else:
                s += el
        return s

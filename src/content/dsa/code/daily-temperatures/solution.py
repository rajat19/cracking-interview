class Solution:
    def dailyTemperatures(self, temps):
        n = len(temps)
        result = [0] * n
        stack = []

        for i in range(n):
            while stack and temps[i] > temps[stack[-1]]:
                idx = stack.pop()
                result[idx] = i - idx
            stack.append(i)

        return result
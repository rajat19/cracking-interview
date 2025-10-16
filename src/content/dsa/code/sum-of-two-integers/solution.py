class Solution:
    def getSum(self, a: int, b: int) -> int:
        # 32-bit mask
        mask = 0xFFFFFFFF
        
        while b != 0:
            carry = ((a & b) << 1) & mask
            a = (a ^ b) & mask
            b = carry
        
        # Handle negative numbers
        if a > 0x7FFFFFFF:
            return ~(a ^ mask)
        return a
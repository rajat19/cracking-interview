class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        if not intervals:
            return []
        
        intervals.sort()
        result = []
        current = intervals[0]
        
        for i in range(1, len(intervals)):
            if intervals[i][0] <= current[1]:
                current[1] = max(current[1], intervals[i][1])
            else:
                result.append(current)
                current = intervals[i]
        result.append(current)
        
        return result
class MedianFinder:
    def __init__(self):
        # Max heap for left half (smaller values)
        self.max_heap = []
        # Min heap for right half (larger values)
        self.min_heap = []

    def addNum(self, num: int) -> None:
        # Add to max heap (left half) by default
        heapq.heappush(self.max_heap, -num)
        
        # Balance: move largest from left to right
        if self.max_heap and self.min_heap and -self.max_heap[0] > self.min_heap[0]:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        
        # Balance sizes
        if len(self.max_heap) > len(self.min_heap) + 1:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        elif len(self.min_heap) > len(self.max_heap):
            val = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -val)

    def findMedian(self) -> float:
        if len(self.max_heap) == len(self.min_heap):
            return (-self.max_heap[0] + self.min_heap[0]) / 2.0
        return -self.max_heap[0]
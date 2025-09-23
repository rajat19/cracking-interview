class Solution:
    # @param A : list of integers
    # @param B : list of integers
    # @return a list of integers
    def order(self, A, B):
        res = []
        people = [[A[i],B[i]] for i in range(len(A))]
        people.sort(key = lambda a: (-a[0],a[1]))
        for i in people:
            res.insert(i[1],i[0])
        return res
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rightSideView(self, root: TreeNode) -> List[int]:
        if root is None: return []
        stack = [(root, 0)]
        prev = -1
        res = []
        while stack:
            node, h = stack.pop(0)
            # print((node.val, h))
            if h > prev:
                prev = h
                res.append(node.val)
            if node.right:
                stack.append((node.right, h+1))
            if node.left:
                stack.append((node.left, h+1))
        return res
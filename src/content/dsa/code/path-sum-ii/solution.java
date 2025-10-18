/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<List<Integer>> pathSum(TreeNode root, int targetSum) {
        List<List<Integer>> result = new ArrayList<>();
        backtrack(root, targetSum, new ArrayList<>(), result);
        return result;
    }

    private void backtrack(TreeNode root, int target, List<Integer> path, List<List<Integer>> result) {
        if (root == null) return;
        path.add(root.val);
        if (root.left == null && root.right == null) {
            if (target - root.val == 0) {
                result.add(new ArrayList<>(path));
            }
            path.remove(path.size() - 1);
            return;
        }
        if (root.left != null) {
            backtrack(root.left, target - root.val, path, result);
        }
        if (root.right != null) {
            backtrack(root.right, target - root.val, path, result);
        }
        path.remove(path.size() - 1);
    }
}
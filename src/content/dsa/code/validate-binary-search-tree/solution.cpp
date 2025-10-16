class Solution {
public:
    bool isValidBST(TreeNode* root) {
        return isValidBST(root, nullptr, nullptr);
    }
    
private:
    bool isValidBST(TreeNode* node, TreeNode* minNode, TreeNode* maxNode) {
        if (!node) return true;
        
        if ((minNode && node->val <= minNode->val) || 
            (maxNode && node->val >= maxNode->val)) {
            return false;
        }
        
        return isValidBST(node->left, minNode, node) && 
               isValidBST(node->right, node, maxNode);
    }
};
class WordDictionary {
private:
    struct TrieNode {
        TrieNode* children[26] = {};
        bool isEnd = false;
    };
    
    TrieNode* root;
    
    bool searchHelper(string& word, int index, TrieNode* node) {
        if (index == word.length()) {
            return node->isEnd;
        }
        
        char c = word[index];
        if (c == '.') {
            for (int i = 0; i < 26; i++) {
                if (node->children[i] && searchHelper(word, index + 1, node->children[i])) {
                    return true;
                }
            }
            return false;
        } else {
            int idx = c - 'a';
            if (!node->children[idx]) {
                return false;
            }
            return searchHelper(word, index + 1, node->children[idx]);
        }
    }
    
public:
    WordDictionary() {
        root = new TrieNode();
    }
    
    void addWord(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int idx = c - 'a';
            if (!node->children[idx]) {
                node->children[idx] = new TrieNode();
            }
            node = node->children[idx];
        }
        node->isEnd = true;
    }
    
    bool search(string word) {
        return searchHelper(word, 0, root);
    }
};
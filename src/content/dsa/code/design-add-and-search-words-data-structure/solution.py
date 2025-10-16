class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class WordDictionary:
    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True

    def search(self, word: str) -> bool:
        def search_helper(index: int, node: TrieNode) -> bool:
            if index == len(word):
                return node.is_end
            
            char = word[index]
            if char == '.':
                for child in node.children.values():
                    if search_helper(index + 1, child):
                        return True
                return False
            else:
                if char not in node.children:
                    return False
                return search_helper(index + 1, node.children[char])
        
        return search_helper(0, self.root)
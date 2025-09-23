class Solution {
    private static final int ALPHABET_COUNT = 26;

    public String alienOrder(String[] words) {
        final boolean[][] graph = new boolean[ALPHABET_COUNT][ALPHABET_COUNT];
        final boolean[] characters = new boolean[ALPHABET_COUNT];

        for(int i=0; i<words.length-1; i++){
            markAvailableCharacters(words[i], characters);
            for(int charIndex=0; charIndex < words[i].length(); charIndex++){
                final int currentWordChar = words[i].charAt(charIndex) - 'a';
                final int nextWordChar = words[i+1].charAt(charIndex) - 'a';
                if (currentWordChar != nextWordChar) {
                    if (graph[nextWordChar][currentWordChar]) {
                        return "";
                    }
                    graph[currentWordChar][nextWordChar] = true;
                    break;
                }
            }
        }
        markAvailableCharacters(words[words.length-1], characters);

        final int[] indegrees = new int[ALPHABET_COUNT];
        for(int i=0; i<ALPHABET_COUNT; i++){
            for(int j=0; j<ALPHABET_COUNT; j++){
                if (i != j && graph[i][j]) {
                    indegrees[j]++;
                }
            }
        }

        final Queue<Integer> queue = new LinkedList<>();
        for(int i=0; i<ALPHABET_COUNT; i++){
            if (characters[i] && indegrees[i] == 0) {
                queue.offer(i);
            }
        }
        final StringBuilder result = new StringBuilder();
        while (!queue.isEmpty()) {
            final int index = queue.poll();
            result.append((char)(index + 'a'));
            for (int i=0; i<ALPHABET_COUNT; i++){
                if (i != index && graph[index][i]) {
                    if (--indegrees[i] == 0) {
                        queue.offer(i);
                    }
                }
            }
        }

        return result.length() < characters.length ? result.toString() : "";
    }

    private void markAvailableCharacters(final String word, final boolean[] characters) {
        for(int i=0; i<word.length(); i++){
            characters[word.charAt(i) - 'a'] = true;
        }
    }
}
public class Solution {
    public int[] order(int[] A, int[] B) {
        int n = A.length;
        int[][] combined = new int[n][2];
        for(int i=0; i<n; i++) {
            combined[i] = new int[]{A[i], B[i]};
        }
        Arrays.sort(combined, (a, b) -> {
            if (a[0] != b[0]) return Integer.compare(-a[0], -b[0]);
            return Integer.compare(a[1], b[1]);
        });
        
        List<Integer> result = new ArrayList<>();
        for(int[] comb: combined) {
            if (comb[1] > n) {
                result.add(comb[0]);
            } else {
                result.add(comb[1], comb[0]);
            }
        }
        
        return result.stream().mapToInt(Integer::intValue).toArray();
    }
}

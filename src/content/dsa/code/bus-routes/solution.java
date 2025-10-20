class Solution {
    public int numBusesToDestination(int[][] routes, int source, int target) {
        if(source == target) return 0;
        Map<Integer, List<Integer>> stopsToBuses = new HashMap<>();
        for (int i = 0; i < routes.length; i++) {
            for (int j = 0; j < routes[i].length; j++) {
                stopsToBuses.computeIfAbsent(routes[i][j], k -> new ArrayList<>()).add(i);
            }
        }
        if(!stopsToBuses.containsKey(source) || !stopsToBuses.containsKey(target)) return -1;
        int[] visitedBus = new int[routes.length];
        Set<Integer> visitedStops = new HashSet<>();
        Queue<int[]> q = new LinkedList<>();

        // add all stops coming in path of buses going to source
        for (int bus : stopsToBuses.get(source)) {
            visitedBus[bus] = 1;
            for (int i = 0; i < routes[bus].length; i++) {
                if (visitedStops.contains(routes[bus][i])) {
                    continue;
                }
                visitedStops.add(routes[bus][i]);
                q.offer(new int[] { routes[bus][i], 1 });
            }
        }

        while (!q.isEmpty()) {
            int[] p = q.poll();
            int stop = p[0];
            int count = p[1];
            if (stop == target)
                return count;
            for (int bus : stopsToBuses.get(stop)) {
                if (visitedBus[bus] == 1)
                    continue;
                visitedBus[bus] = 1;
                for (int i = 0; i < routes[bus].length; i++) {
                    if (visitedStops.contains(routes[bus][i])) {
                        continue;
                    }
                    visitedStops.add(routes[bus][i]);
                    q.offer(new int[] { routes[bus][i], count+1 });
                }
            }
        }
        return -1;
    }
}
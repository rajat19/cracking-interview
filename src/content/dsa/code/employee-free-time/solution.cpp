class Solution {

    public:
    vector<Interval> employeeFreeTime(vector<vector<Interval>> A) {
        map<int, int> m;
        for (auto &v : A) {
            for (auto &it : v) {
                m[it.start]++;
                m[it.end]--;
            }
        }
        vector<Interval> ans;
        int cnt = 0;
        for (auto it = m.begin(); it != m.end(); ++it) {
            cnt += it->second;
            if (cnt) continue;
            int start = it->first;
            ++it;
            if (it == m.end()) break;
            cnt += it->second;
            ans.emplace_back(start, it->first);
        }
        return ans;
    }
};
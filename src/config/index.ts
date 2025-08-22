import { ITopicCategory } from "@/types/topic";
import { isDifficultyEnabled, isFeatureEnabled, getContentType } from "./categoryConfig";

const config = {
    getContentType,
    hasSolutions: (category: ITopicCategory) => isFeatureEnabled(category, 'solutionTabs'),
    shouldUseMDXRenderer: (category: ITopicCategory) => isFeatureEnabled(category, 'mdxRenderer'),
    showDifficulty: (category: ITopicCategory) => isDifficultyEnabled(category),
    hasIndex: (category: ITopicCategory) => isFeatureEnabled(category, "index"),
};

export default config;

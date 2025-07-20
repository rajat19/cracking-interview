import { DocsLayout } from "@/components/DocsLayout";
import { systemDesignTopics } from "@/data/systemDesignTopics";

const SystemDesign = () => {
  return (
    <DocsLayout
      title="System Design"
      description="Learn to design scalable systems with real-world examples"
      topics={systemDesignTopics}
      category="system-design"
    />
  );
};

export default SystemDesign;
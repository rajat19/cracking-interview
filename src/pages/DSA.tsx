import { DocsLayout } from "@/components/DocsLayout";
import { dsaTopics } from "@/data/dsaTopics";

const DSA = () => {
  return (
    <DocsLayout
      title="Data Structures & Algorithms"
      description="Master coding interviews with comprehensive DSA topics"
      topics={dsaTopics}
      category="dsa"
    />
  );
};

export default DSA;
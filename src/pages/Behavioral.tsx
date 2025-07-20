import { DocsLayout } from "@/components/DocsLayout";
import { behavioralTopics } from "@/data/behavioralTopics";

const Behavioral = () => {
  return (
    <DocsLayout
      title="Behavioral Interviews"
      description="Ace behavioral interviews with proven frameworks"
      topics={behavioralTopics}
      category="behavioral"
    />
  );
};

export default Behavioral;
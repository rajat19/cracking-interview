import { BookOpen } from 'lucide-react';

export default function TopicDefault() {
  const title = 'Select a topic to get started';
  const description = 'Choose from the topics to begin your learning journey.';

  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <div className="text-center">
        <BookOpen className="mx-auto mb-4 h-16 w-16 opacity-50" />
        <h3 className="mb-2 text-lg font-medium">{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

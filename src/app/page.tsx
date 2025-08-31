'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, Code, Users, BookOpen, Video, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { loadTopicsList } from '@/lib/contentLoader';
import { categoryConfig, getConfig } from '@/config/categoryConfig';
import { ITopicCategory } from '@/types/topic';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    dsaQuestions: 0,
    systemDesignQuestions: 0,
    oodQuestions: 0,
    behavioralQuestions: 0,
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Load only topic metadata for faster stats calculation
        const [dsa, systemDesign, ood, behavioral] = await Promise.all([
          loadTopicsList('dsa'),
          loadTopicsList('system-design'),
          loadTopicsList('ood'),
          loadTopicsList('behavioral'),
        ]);
        setStats({
          dsaQuestions: dsa.length,
          systemDesignQuestions: systemDesign.length,
          oodQuestions: ood.length,
          behavioralQuestions: behavioral.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const categories = Object.keys(categoryConfig).map((categoryId: string) => {
    const conf = getConfig(categoryId as ITopicCategory);
    const display = conf.display;
    const Icon = display?.icon ?? Code;
    return {
      id: categoryId,
      title: conf.title,
      description: conf.description,
      icon: Icon,
      gradient: display?.gradient ?? 'from-blue-500 to-cyan-500',
      path: `/topics/${categoryId}`,
      stats: `${stats[display?.statsKey ?? 'dsaQuestions']}+ ${display?.statsLabel ?? 'Items'}`,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-6 py-10">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 text-5xl font-bold">
            Master Your Next <span className="gradient-text">Tech Interview</span>
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-xl text-muted-foreground">
            Comprehensive preparation platform with curated problems, system design concepts, and
            behavioral interview strategies used by engineers at top tech companies.
          </p>

          {/* Mock Interview CTA */}
          <div className="mx-auto max-w-2xl">
            <div className="card border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="card-body text-center">
                <Video className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-3 text-2xl font-bold text-foreground">
                  Practice with AI Mock Interviews
                </h3>
                <p className="mb-6 text-muted-foreground">
                  Experience realistic interview scenarios with our AI interviewer. Get instant
                  feedback and improve your performance.
                </p>
                <Link href="/mock-interview">
                  <Button size="lg" className="btn-primary">
                    Start Mock Interview
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-4">
        <div className="container mx-auto">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 xl:grid-cols-4">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.path}
                  className="group"
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div
                    className={`topic-card relative flex h-80 flex-col justify-between overflow-hidden ${
                      hoveredCard === category.id ? 'scale-105' : ''
                    } transition-all duration-300`}
                  >
                    {/* Background gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 transition-opacity duration-300 group-hover:opacity-10`}
                    />

                    <div className="relative z-10">
                      <div
                        className={`h-16 w-16 rounded-xl bg-gradient-to-r ${category.gradient} mb-6 flex items-center justify-center`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>

                      <h3 className="mb-4 text-2xl font-bold text-foreground">{category.title}</h3>

                      <p className="leading-relaxed text-muted-foreground">
                        {category.description}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{category.stats}</span>
                      <Button variant="ghost" size="sm" className="group-hover:bg-primary/10">
                        Start Learning →
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-border px-6 py-12">
        <div className="container mx-auto text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-r from-primary to-accent">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="gradient-text font-bold">Cracking Interview</span>
          </div>
          <p className="text-muted-foreground">
            Empowering developers to succeed in technical interviews
          </p>
        </div>
      </footer>
    </div>
  );
}

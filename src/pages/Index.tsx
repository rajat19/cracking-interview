import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Brain, Code, Users, BookOpen, Target, TrendingUp, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsCard } from "@/components/StatsCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    dsaQuestions: 0,
    systemDesignQuestions: 0,
    behavioralQuestions: 0
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dsaResult, systemDesignResult, behavioralResult] = await Promise.all([
          supabase.from('dsa_questions').select('id', { count: 'exact', head: true }),
          supabase.from('system_design_questions').select('id', { count: 'exact', head: true }),
          supabase.from('behavioral_questions').select('id', { count: 'exact', head: true })
        ]);

        setStats({
          dsaQuestions: dsaResult.count || 0,
          systemDesignQuestions: systemDesignResult.count || 0,
          behavioralQuestions: behavioralResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const categories = [
    {
      id: "dsa",
      title: "Data Structures & Algorithms",
      description: "Master coding interviews with comprehensive DSA topics, from arrays to dynamic programming.",
      icon: Code,
      gradient: "from-blue-500 to-cyan-500",
      path: "/dsa",
      stats: `${stats.dsaQuestions}+ Problems`
    },
    {
      id: "system-design",
      title: "System Design",
      description: "Learn to design scalable systems with real-world examples and best practices.",
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      path: "/system-design",
      stats: `${stats.systemDesignQuestions}+ Designs`
    },
    {
      id: "behavioral",
      title: "Behavioral",
      description: "Ace behavioral interviews with proven frameworks and example scenarios.",
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
      path: "/behavioral",
      stats: `${stats.behavioralQuestions}+ Questions`
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">Cracking Interview</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <Link to="/bookmarks">
                <Button variant="outline" size="sm">
                  Bookmarks
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Master Your Next{" "}
            <span className="gradient-text">Tech Interview</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Comprehensive preparation platform with curated problems, system design concepts, 
            and behavioral interview strategies used by engineers at top tech companies.
          </p>
          
          <div className="flex justify-center items-center space-x-8 mb-16">
            <StatsCard icon={Target} value="500+" label="Problems Solved" />
            <StatsCard icon={Users} value="10K+" label="Students" />
            <StatsCard icon={TrendingUp} value="85%" label="Success Rate" />
          </div>

          {/* Mock Interview CTA */}
          <div className="max-w-2xl mx-auto">
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="card-body text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  Practice with AI Mock Interviews
                </h3>
                <p className="text-muted-foreground mb-6">
                  Experience realistic interview scenarios with our AI interviewer. 
                  Get instant feedback and improve your performance.
                </p>
                <Link to="/mock-interview">
                  <Button size="lg" className="btn-primary">
                    Start Mock Interview
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  to={category.path}
                  className="group"
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`topic-card h-80 flex flex-col justify-between relative overflow-hidden ${
                    hoveredCard === category.id ? 'scale-105' : ''
                  } transition-all duration-300`}>
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center mb-6`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-foreground mb-4">
                        {category.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {category.stats}
                      </span>
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
      <footer className="border-t border-border py-12 px-6 mt-20">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">Interview Prep Hub</span>
          </div>
          <p className="text-muted-foreground">
            Empowering developers to succeed in technical interviews
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

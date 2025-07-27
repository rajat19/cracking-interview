import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Calendar as CalendarIcon, Video, Clock, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCall } from '@/components/VideoCall';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface InterviewEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
}

const MockInterview = () => {
  const { user } = useAuth();
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [events, setEvents] = useState<InterviewEvent[]>([
    {
      id: '1',
      title: 'System Design Interview',
      start: new Date(2024, 11, 25, 10, 0),
      end: new Date(2024, 11, 25, 11, 0),
      type: 'system-design'
    },
    {
      id: '2',
      title: 'DSA Interview',
      start: new Date(2024, 11, 26, 14, 0),
      end: new Date(2024, 11, 26, 15, 0),
      type: 'dsa'
    }
  ]);

  const interviewTypes = [
    {
      id: 'dsa',
      title: 'Data Structures & Algorithms',
      description: 'Practice coding problems and algorithmic thinking',
      icon: Target,
      duration: '60 minutes',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'system-design',
      title: 'System Design',
      description: 'Design scalable systems and architecture',
      icon: Users,
      duration: '90 minutes',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'behavioral',
      title: 'Behavioral Interview',
      description: 'Practice behavioral questions and storytelling',
      icon: Clock,
      duration: '45 minutes',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleStartInstantInterview = (type: string) => {
    setShowVideoCall(true);
  };

  const handleScheduleInterview = (type: string) => {
    if (selectedSlot) {
      const newEvent: InterviewEvent = {
        id: Date.now().toString(),
        title: `${interviewTypes.find(t => t.id === type)?.title} Interview`,
        start: selectedSlot,
        end: new Date(selectedSlot.getTime() + 60 * 60 * 1000), // 1 hour later
        type
      };
      setEvents([...events, newEvent]);
      setSelectedSlot(null);
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedSlot(start);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center p-8">
          <Video className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-4 text-base-content">Sign In Required</h2>
          <p className="text-base-content/70 mb-6">
            Please sign in to access mock interviews and schedule practice sessions.
          </p>
          <Link to="/auth">
            <Button>Sign In to Continue</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (showVideoCall) {
    return <VideoCall onEndCall={() => setShowVideoCall(false)} />;
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <Video className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4 text-base-content">Mock Interviews</h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Practice with AI interviewers in realistic interview scenarios. 
              Get instant feedback and improve your interview skills.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Interview Types */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-base-content">Choose Interview Type</h2>
            <div className="space-y-4">
              {interviewTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div
                    key={type.id}
                    className="card bg-base-200 border border-base-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="card-body">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${type.color}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-base-content mb-2">
                            {type.title}
                          </h3>
                          <p className="text-base-content/70 mb-3">{type.description}</p>
                          <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                            <Clock className="w-4 h-4" />
                            <span>{type.duration}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStartInstantInterview(type.id)}
                              className="btn-primary"
                            >
                              Start Now
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleScheduleInterview(type.id)}
                              disabled={!selectedSlot}
                            >
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-base-content flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              Schedule Interview
            </h2>
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body p-4">
                <div style={{ height: '500px' }}>
                  <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectSlot={handleSelectSlot}
                    selectable
                    popup
                    className="bg-base-100 rounded-lg"
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor: 'hsl(var(--p))',
                        color: 'hsl(var(--pc))',
                        border: 'none',
                        borderRadius: '6px'
                      }
                    })}
                  />
                </div>
                {selectedSlot && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-base-content">
                      Selected: {moment(selectedSlot).format('MMMM Do YYYY, h:mm A')}
                    </p>
                    <p className="text-xs text-base-content/70 mt-1">
                      Choose an interview type above and click "Schedule" to book this slot.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Interviews */}
        {events.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-base-content">Upcoming Interviews</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.id} className="card bg-base-200 border border-base-300">
                  <div className="card-body">
                    <h3 className="font-semibold text-base-content">{event.title}</h3>
                    <p className="text-sm text-base-content/70">
                      {moment(event.start).format('MMM Do, h:mm A')}
                    </p>
                    <div className="card-actions justify-end mt-4">
                      <Button size="sm" onClick={() => setShowVideoCall(true)}>
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
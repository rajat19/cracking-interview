import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoCallProps {
  onEndCall: () => void;
}

export const VideoCall: React.FC<VideoCallProps> = ({ onEndCall }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startLocalVideo();
    return () => {
      stopLocalVideo();
    };
  }, []);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCallStarted(true);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopLocalVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    stopLocalVideo();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-base-300 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-base-100 shadow-lg">
        <h2 className="text-lg font-semibold text-base-content">Mock Interview Session</h2>
        <p className="text-sm text-base-content/70">Practice with AI interviewer</p>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-base-200">
        {/* Remote Video (AI Interviewer placeholder) */}
        <div className="w-full h-full relative">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover bg-base-300"
            autoPlay
            playsInline
          />
          
          {/* AI Interviewer Avatar when no video */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-content">AI</span>
                </div>
              </div>
              <p className="text-lg font-semibold text-base-content">AI Interviewer</p>
              <p className="text-sm text-base-content/70">Ready to start your interview</p>
            </div>
          </div>
        </div>

        {/* Local Video */}
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-xl border-2 border-primary/20">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-base-300 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-base-content/50" />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-base-100 border-t border-base-300">
        <div className="flex justify-center items-center gap-4">
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-12 h-12 p-0 ml-4"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-base-content/70">
            Interview in progress • Click the red button to end call
          </p>
        </div>
      </div>
    </div>
  );
};
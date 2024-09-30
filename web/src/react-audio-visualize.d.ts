declare module 'react-audio-visualize' {
    import React from 'react';
  
    interface LiveAudioVisualizerProps {
      mediaRecorder: MediaRecorder;
      width?: number;
      height?: number;
      barColor?: string;
    }
  
    export const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps>;
  }
  
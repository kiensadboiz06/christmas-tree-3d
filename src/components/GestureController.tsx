import { useRef, useEffect } from 'react';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import type { GestureControllerProps } from '../types';

export const GestureController = ({ onGesture, onStatus, debugMode, onPinch, onThumbUp }: GestureControllerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPinchStateRef = useRef<boolean>(false);
  const lastHandPositionRef = useRef<{ x: number; y: number } | undefined>(undefined);
  const lastThumbUpTimeRef = useRef<number>(0);
  
  // Threshold for hand position change to trigger update (avoid excessive updates)
  const HAND_POSITION_THRESHOLD = 0.02; // 2% of screen
  const THUMB_UP_COOLDOWN = 1500; // 1.5 seconds cooldown for theme change

  useEffect(() => {
    let gestureRecognizer: GestureRecognizer;
    let requestRef: number;
    let stream: MediaStream | null = null;
    let videoElement: HTMLVideoElement | null = null;

    const setup = async () => {
      onStatus('DOWNLOADING AI...');
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });
        onStatus('REQUESTING CAMERA...');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoElement = videoRef.current;
          if (videoElement) {
            // Stop any existing stream first
            if (videoElement.srcObject) {
              const oldStream = videoElement.srcObject as MediaStream;
              oldStream.getTracks().forEach(track => track.stop());
            }
            
            videoElement.srcObject = stream;
            // Wait for video to be ready before playing
            const handleLoadedMetadata = () => {
              if (videoElement) {
                videoElement.play().catch((err) => {
                  // Ignore AbortError - it's expected when video is interrupted
                  if (err.name !== 'AbortError') {
                    console.error('Error playing video:', err);
                  }
                });
                onStatus('AI READY: SHOW HAND');
                predictWebcam();
              }
            };
            videoElement.onloadedmetadata = handleLoadedMetadata;
          }
        } else {
          onStatus('ERROR: CAMERA PERMISSION DENIED');
        }
      } catch (err: any) {
        onStatus(`ERROR: ${err.message || 'MODEL FAILED'}`);
      }
    };

    const predictWebcam = () => {
      if (gestureRecognizer && videoRef.current && canvasRef.current) {
        if (videoRef.current.videoWidth > 0) {
          const results = gestureRecognizer.recognizeForVideo(videoRef.current, Date.now());
          const ctx = canvasRef.current.getContext('2d');
          if (ctx && debugMode) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            if (results.landmarks)
              for (const landmarks of results.landmarks) {
                const drawingUtils = new DrawingUtils(ctx);
                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                  lineWidth: 2
                });
                drawingUtils.drawLandmarks(landmarks, { lineWidth: 1 });
              }
          } else if (ctx && !debugMode) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Detect pinch gesture (thumb tip touching index finger tip)
          let isPinching = false;
          let handPosition: { x: number; y: number } | undefined;
          
          // Check if hand is detected
          const hasHand = results.landmarks && results.landmarks.length > 0;
          
          if (hasHand && onPinch) {
            const landmarks = results.landmarks[0];
            // Thumb tip: index 4, Index finger tip: index 8
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            
            if (thumbTip && indexTip) {
              // Calculate distance between thumb and index finger
              const dx = thumbTip.x - indexTip.x;
              const dy = thumbTip.y - indexTip.y;
              const dz = (thumbTip.z || 0) - (indexTip.z || 0);
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              
              // Threshold for pinch detection (tune this value)
              isPinching = distance < 0.05;
              
              // Get hand position (use middle of thumb and index finger)
              if (isPinching) {
                handPosition = {
                  x: (thumbTip.x + indexTip.x) / 2,
                  y: (thumbTip.y + indexTip.y) / 2
                };
              }
              
              // Check if hand position changed significantly
              const handPositionChanged = !lastHandPositionRef.current || 
                !handPosition ||
                Math.abs(handPosition.x - lastHandPositionRef.current.x) > HAND_POSITION_THRESHOLD ||
                Math.abs(handPosition.y - lastHandPositionRef.current.y) > HAND_POSITION_THRESHOLD;
              
              // Only trigger callback on state change or significant position change
              if (isPinching !== lastPinchStateRef.current) {
                lastPinchStateRef.current = isPinching;
                lastHandPositionRef.current = handPosition;
                onPinch(isPinching, handPosition);
              } else if (isPinching && handPosition && handPositionChanged) {
                // Update hand position only if it changed significantly
                lastHandPositionRef.current = handPosition;
                onPinch(isPinching, handPosition);
              }
            }
          } else if (!hasHand && onPinch) {
            // No hand detected - reset pinch state if it was active
            if (lastPinchStateRef.current) {
              lastPinchStateRef.current = false;
              lastHandPositionRef.current = undefined;
              onPinch(false, undefined);
            }
          }

          if (results.gestures.length > 0) {
            const name = results.gestures[0][0].categoryName;
            const score = results.gestures[0][0].score;
            if (score > 0.4) {
              if (name === 'Open_Palm') onGesture('CHAOS');
              if (name === 'Closed_Fist') onGesture('FORMED');
              
              // Detect Thumb_Up gesture for theme change
              if (name === 'Thumb_Up' && onThumbUp) {
                const now = Date.now();
                if (now - lastThumbUpTimeRef.current > THUMB_UP_COOLDOWN) {
                  lastThumbUpTimeRef.current = now;
                  onThumbUp();
                }
              }
              
              if (debugMode) {
                const pinchStatus = isPinching ? ' [PINCH]' : '';
                onStatus(`DETECTED: ${name}${pinchStatus}`);
              }
            }
          } else {
            if (debugMode) {
              const pinchStatus = isPinching ? ' [PINCH]' : '';
              onStatus(`AI READY: NO HAND${pinchStatus}`);
            }
          }
        }
        requestRef = requestAnimationFrame(predictWebcam);
      }
    };
    setup();
    return () => {
      cancelAnimationFrame(requestRef);
      // Clean up stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
      if (gestureRecognizer) {
        gestureRecognizer.close();
      }
    };
  }, [onGesture, onStatus, debugMode, onPinch, onThumbUp]);

  return (
    <>
      <video
        ref={videoRef}
        style={{
          opacity: debugMode ? 0.6 : 0,
          position: 'fixed',
          top: 0,
          right: 0,
          width: debugMode ? '320px' : '1px',
          zIndex: debugMode ? 100 : -1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: debugMode ? '320px' : '1px',
          height: debugMode ? 'auto' : '1px',
          zIndex: debugMode ? 101 : -1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
      />
    </>
  );
};

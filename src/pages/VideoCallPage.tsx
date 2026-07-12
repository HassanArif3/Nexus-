import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateVideoRoomAccess } from '../services/videoService';
import { connectSocket, disconnectSocket } from '../services/socketService';
import toast from 'react-hot-toast';

export const VideoCallPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    checkAccess();
    return () => {
      endCall();
    };
  }, [meetingId]);

  const checkAccess = async () => {
    try {
      if (!meetingId) throw new Error('Missing meeting ID');
      await validateVideoRoomAccess(meetingId);
      setAccessGranted(true);
      initCall();
    } catch (err: any) {
      toast.error(err.message || 'Access denied');
      navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  const initCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = connectSocket();

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach((track) => peerConnection.current?.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { roomId: meetingId, targetSocketId: 'all', candidate: event.candidate });
        }
      };

      socket.emit('join-room', { roomId: meetingId, userId: 'current_user' });

      socket.on('user-joined', async () => {
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
        socket.emit('offer', { roomId: meetingId, targetSocketId: 'all', offer });
      });

      socket.on('offer', async ({ offer }) => {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);
        socket.emit('answer', { roomId: meetingId, targetSocketId: 'all', answer });
      });

      socket.on('answer', async ({ answer }) => {
        await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('ice-candidate', async ({ candidate }) => {
        try {
          await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error(e);
        }
      });

    } catch (err) {
      toast.error('Could not access camera/microphone');
    }
  };

  const endCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    disconnectSocket();
    navigate('/meetings');
  };

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleCam = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks()[0].enabled = !camOn;
      setCamOn(!camOn);
    }
  };

  if (loading) return <div className="p-6">Loading video room...</div>;
  if (!accessGranted) return null;

  return (
    <div className="flex flex-col items-center justify-center p-6 h-[80vh] bg-gray-900 rounded-lg">
      <div className="flex gap-4 w-full max-w-5xl h-3/4 mb-6">
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">You</div>
        </div>
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded">Remote User</div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button onClick={toggleMic} className={`px-6 py-3 rounded-full ${micOn ? 'bg-gray-600' : 'bg-red-600'} text-white`}>
          {micOn ? 'Mute Mic' : 'Unmute Mic'}
        </button>
        <button onClick={toggleCam} className={`px-6 py-3 rounded-full ${camOn ? 'bg-gray-600' : 'bg-red-600'} text-white`}>
          {camOn ? 'Stop Camera' : 'Start Camera'}
        </button>
        <button onClick={endCall} className="px-6 py-3 bg-red-600 text-white rounded-full">
          End Call
        </button>
      </div>
    </div>
  );
};

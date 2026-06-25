/**
 * Chat ViewModel
 * Manages state and logic for the real-time chat feature
 */

import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../../Context/AuthContext';
import { authHeaders, jsonAuthHeaders } from '../../services/utils/authUtils';

export const useChatViewModel = () => {
  const { user, token } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat]     = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMessage, setNewMessage]       = useState('');
  const [isTyping, setIsTyping]           = useState(false);
  const [onlineUsers, setOnlineUsers]     = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(true);

  const socket       = useRef(null);
  const scrollRef    = useRef(null);
  const typingTimeout = useRef(null);

  const currentChatRef = useRef(null);
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // ── WebRTC Calling States ──────────────────────────────────────
  const [callState, setCallState] = useState('idle'); // idle | outgoing | incoming | connected
  const [callType, setCallType] = useState('video'); // audio | video
  const [callUser, setCallUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callRecordId, setCallRecordId] = useState(null);

  const peerConnection = useRef(null);
  const callerSocketId = useRef(null);
  const pendingOffer = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const callerIceCandidatesQueue = useRef([]);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const screenStreamRef = useRef(null);

  // Synchronize ref with state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // ── Call Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (callState === 'connected') {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      if (callState === 'idle') {
        setCallDuration(0);
      }
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callState]);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    callerSocketId.current = null;
    pendingOffer.current = null;
    iceCandidatesQueue.current = [];
    callerIceCandidatesQueue.current = [];
    setCallState('idle');
    setCallUser(null);
    setIsMuted(false);
    setIsCameraOn(true);
    setIsScreenSharing(false);
    setCallRecordId(null);
  }, []);

  // ── Socket.io ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.REACT_APP_API_URL || (window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : window.location.origin);

    socket.current = io(socketUrl, { transports: ['websocket', 'polling'] });

    socket.current.on('getMessage', (data) => {
      const newMsg = {
        _id: Date.now().toString(),
        sender: { _id: data.senderId, username: data.senderName },
        text: data.text,
        createdAt: data.createdAt || new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);

      // Update unread count for non-active conversations
      setConversations(prev => prev.map(c => {
        if (c.user._id === data.senderId) {
          const isActive = currentChatRef.current?.user._id === data.senderId;
          return {
            ...c,
            lastMessage: { text: data.text, createdAt: newMsg.createdAt },
            unread: isActive ? 0 : (c.unread || 0) + 1
          };
        }
        return c;
      }));
    });

    socket.current.on('onlineUsers', (users) => {
      setOnlineUsers(users.map(u => u.userId));
    });

    socket.current.on('userTyping',     () => setIsTyping(true));
    socket.current.on('userStopTyping', () => setIsTyping(false));

    // WebRTC Signaling Listeners
    socket.current.on('incoming-call', (data) => {
      setCallState('incoming');
      setCallType(data.callType);
      setCallUser({
        _id: data.callerDbId || 'unknown',
        username: data.callerName,
        fullName: data.callerName,
        avatar: data.callerAvatar
      });
      callerSocketId.current = data.callerId;
      pendingOffer.current = data.offer;
    });

    socket.current.on('call-answered', async (data) => {
      callerSocketId.current = data.calleeId;
      if (peerConnection.current) {
        try {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallState('connected');
          
          // Send all queued caller ICE candidates to the callee now that we have their socket ID
          while (callerIceCandidatesQueue.current.length > 0) {
            const cand = callerIceCandidatesQueue.current.shift();
            socket.current?.emit('ice-candidate', {
              candidate: cand,
              targetId: data.calleeId
            });
          }

          while (iceCandidatesQueue.current.length > 0) {
            const cand = iceCandidatesQueue.current.shift();
            await peerConnection.current.addIceCandidate(cand);
          }
        } catch (err) {
          console.error("Failed to set remote description:", err);
        }
      }
    });

    socket.current.on('ice-candidate', async (data) => {
      const candidate = new RTCIceCandidate(data.candidate);
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        try {
          await peerConnection.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("Failed to add ice candidate:", err);
        }
      } else {
        iceCandidatesQueue.current.push(candidate);
      }
    });

    socket.current.on('call-rejected', () => {
      cleanupCall();
    });

    socket.current.on('call-ended', () => {
      cleanupCall();
    });

    socket.current.emit('newUser', { userId: user._id, username: user.username });

    return () => { 
      socket.current?.disconnect(); 
      cleanupCall();
    };
  }, [user, cleanupCall]);

  // ── Fetch conversations & handle ?userId= query param ─────────
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    fetch('/api/messages/conversations', { headers: authHeaders(token) })
      .then(r => r.ok ? r.json() : [])
      .then(async (data) => {
        let loadedConvs = Array.isArray(data) ? data : [];
        const targetUserId = searchParams.get('userId');

        if (targetUserId && targetUserId !== 'undefined' && targetUserId !== 'null') {
          const existing = loadedConvs.find(c => c.user && (c.user._id === targetUserId || c.user.username === targetUserId));
          if (existing) {
            setConversations(loadedConvs);
            setCurrentChat(existing);
          } else {
            // Fetch user info and create a new conversation entry
            try {
              const userRes = await fetch(`/api/users/${targetUserId}`, { headers: authHeaders(token) });
              if (userRes.ok) {
                const userData = await userRes.json();
                const newConv = {
                  user: {
                    _id: userData._id,
                    username: userData.username,
                    fullName: userData.fullName,
                    avatar: userData.avatar
                  },
                  lastMessage: null,
                  unread: 0
                };
                loadedConvs = [newConv, ...loadedConvs];
                setConversations(loadedConvs);
                setCurrentChat(newConv);
              } else {
                setConversations(loadedConvs);
              }
            } catch (err) {
              console.warn("Failed to fetch target user for conversation:", err);
              setConversations(loadedConvs);
            }
          }
        } else {
          setConversations(loadedConvs);
        }
      })
      .catch(() => {
        setConversations([]);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, searchParams]);

  // ── Fetch messages for current chat ───────────────────────────
  useEffect(() => {
    if (!currentChat || !token) return;

    fetch(`/api/messages/${currentChat.user._id}`, { headers: authHeaders(token) })
      .then(r => r.ok ? r.json() : [])
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [currentChat, token]);

  // ── Auto-scroll ────────────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentChat) return;

    const text = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    setMessages(prev => [...prev, {
      _id: 'temp_' + Date.now(),
      sender: { _id: user._id },
      text,
      createdAt: new Date().toISOString()
    }]);

    // Socket emit
    socket.current?.emit('sendMessage', {
      senderName:   user.username,
      receiverName: currentChat.user.username,
      senderId:     user._id,
      receiverId:   currentChat.user._id,
      text
    });
    socket.current?.emit('stopTyping', {
      senderName:   user.username,
      receiverName: currentChat.user.username
    });

    // Update conversation preview
    setConversations(prev => prev.map(c =>
      c.user._id === currentChat.user._id
        ? { ...c, lastMessage: { text, createdAt: new Date().toISOString() }, unread: 0 }
        : c
    ));

    // Persist to DB
    if (token) {
      fetch('/api/messages', {
        method: 'POST',
        headers: jsonAuthHeaders(token),
        body: JSON.stringify({ receiverId: currentChat.user._id, text })
      }).catch(() => {});
    }
  }, [newMessage, currentChat, user, token]);

  // ── Typing indicator ───────────────────────────────────────────
  const handleTyping = useCallback((value) => {
    setNewMessage(value);
    if (!currentChat || !socket.current) return;

    socket.current.emit('typing', {
      senderName:   user.username,
      receiverName: currentChat.user.username
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.current?.emit('stopTyping', {
        senderName:   user.username,
        receiverName: currentChat.user.username
      });
    }, 1500);
  }, [currentChat, user]);

  const selectChat = useCallback((conv) => {
    setCurrentChat(conv);
    setConversations(prev => prev.map(c =>
      c.user._id === conv.user._id ? { ...c, unread: 0 } : c
    ));
  }, []);

  const isOnline = useCallback((userId) => onlineUsers.includes(userId), [onlineUsers]);

  const filteredConversations = conversations.filter(c =>
    c.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  // ── WebRTC Call Actions ──────────────────────────────────────────
  const createCallRecord = useCallback(async (calleeId, type) => {
    if (!token) return null;
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: jsonAuthHeaders(token),
        body: JSON.stringify({ calleeId, callType: type })
      });
      if (res.ok) {
        const data = await res.json();
        return data._id;
      }
    } catch (err) {
      console.warn('Failed to create call record:', err);
    }
    return null;
  }, [token]);

  const updateCallRecord = useCallback(async (id, status) => {
    if (!token || !id) return;
    try {
      await fetch(`/api/calls/${id}`, {
        method: 'PUT',
        headers: jsonAuthHeaders(token),
        body: JSON.stringify({ status, duration: callDuration })
      });
    } catch (err) {
      console.warn('Failed to update call record:', err);
    }
  }, [token, callDuration]);

  const rejectCall = useCallback(() => {
    if (callerSocketId.current && socket.current) {
      socket.current.emit('reject-call', { callerId: callerSocketId.current });
    }
    if (callRecordId) updateCallRecord(callRecordId, 'rejected');
    cleanupCall();
  }, [cleanupCall, callRecordId, updateCallRecord]);

  const startCall = useCallback(async (type) => {
    if (!currentChat) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      
      setCallType(type);
      setCallUser(currentChat.user);
      setCallState('outgoing');
      setLocalStream(stream);

      // Create call record
      const recordId = await createCallRecord(currentChat.user._id, type);
      setCallRecordId(recordId);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          if (callerSocketId.current) {
            socket.current?.emit('ice-candidate', {
              candidate: event.candidate,
              targetId: callerSocketId.current
            });
          } else {
            callerIceCandidatesQueue.current.push(event.candidate);
          }
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.current = pc;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.current?.emit('call-user', {
        offer,
        calleeId: currentChat.user._id,
        callerName: user.fullName || user.username,
        callerAvatar: user.avatar,
        callType: type
      });
    } catch (err) {
      console.error("Failed to start call:", err);
      alert("Failed to access camera or microphone.");
    }
  }, [currentChat, user, createCallRecord]);

  const acceptCall = useCallback(async () => {
    if (!pendingOffer.current || !callerSocketId.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true
      });

      setLocalStream(stream);
      setCallState('connected');

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && callerSocketId.current) {
          socket.current?.emit('ice-candidate', {
            candidate: event.candidate,
            targetId: callerSocketId.current
          });
        }
      };

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.current = pc;

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.current));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.current?.emit('make-answer', {
        answer,
        callerId: callerSocketId.current
      });

      while (iceCandidatesQueue.current.length > 0) {
        const cand = iceCandidatesQueue.current.shift();
        await pc.addIceCandidate(cand);
      }
    } catch (err) {
      console.error("Failed to accept call:", err);
      rejectCall();
    }
  }, [callType, rejectCall]);

  const endCall = useCallback(() => {
    if (callerSocketId.current && socket.current) {
      socket.current.emit('end-call', { targetId: callerSocketId.current });
    }
    if (callRecordId) updateCallRecord(callRecordId, 'completed');
    cleanupCall();
  }, [cleanupCall, callRecordId, updateCallRecord]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (!peerConnection.current) return;

    if (isScreenSharing) {
      // Stop screen share, restore camera
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      // Re-enable camera track
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(cameraTrack);
      }
      setLocalStream(prev => {
        if (prev) {
          prev.getVideoTracks().forEach(t => t.stop());
        }
        return new MediaStream([...prev.getAudioTracks(), cameraTrack]);
      });
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        const screenTrack = screenStream.getVideoTracks()[0];
        
        const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        screenTrack.addEventListener('ended', () => {
          toggleScreenShare(); // Auto-restore camera when user stops sharing
        });

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen sharing failed:", err);
      }
    }
  }, [isScreenSharing]);

  const switchCamera = useCallback(async () => {
    if (!localStreamRef.current || !peerConnection.current) return;
    try {
      const currentTrack = localStreamRef.current.getVideoTracks()[0];
      const currentFacingMode = currentTrack?.getSettings()?.facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false
      });
      
      const newTrack = newStream.getVideoTracks()[0];
      const sender = peerConnection.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(newTrack);
      }
      
      // Stop old track and replace
      currentTrack?.stop();
      setLocalStream(prev => {
        const audioTracks = prev?.getAudioTracks() || [];
        return new MediaStream([...audioTracks, newTrack]);
      });
    } catch (err) {
      console.error('Failed to switch camera:', err);
    }
  }, []);

  // ── Auto-start call from URL query param ──────────────────────
  useEffect(() => {
    const startCallType = searchParams.get('startCall');
    const targetUserId = searchParams.get('userId');
    if (startCallType && targetUserId && currentChat && (currentChat.user._id === targetUserId || currentChat.user.username === targetUserId) && callState === 'idle') {
      startCall(startCallType);
      // Clean up startCall parameter to avoid call loops on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('startCall');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, currentChat, callState, startCall, setSearchParams]);


  return {
    user,
    conversations: filteredConversations,
    currentChat,
    messages,
    newMessage,
    isTyping,
    onlineUsers,
    searchQuery,
    loading,
    scrollRef,
    setSearchQuery,
    selectChat,
    sendMessage,
    handleTyping,
    isOnline,
    timeAgo,
    // WebRTC call states
    callState,
    callType,
    callUser,
    localStream,
    remoteStream,
    isMuted,
    isCameraOn,
    isScreenSharing,
    callDuration,
    formatDuration,
    // WebRTC actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    switchCamera,
  };
};
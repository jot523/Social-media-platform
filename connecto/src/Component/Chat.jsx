import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { AuthContext } from '../Context/AuthContext';
import styles from '../css/Chat.module.css';
import {
  FaSearch, FaPaperPlane, FaSmile, FaPaperclip,
  FaPhone, FaVideo, FaEllipsisV, FaCommentDots, FaTimes
} from 'react-icons/fa';
import { buildHeaders, jsonHeaders } from './authFetch';

const mockConversations = [
  {
    user: { _id: 'u1', username: 'sarah_cruz', fullName: 'Sarah Cruz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    lastMessage: { text: 'Hey! How are you doing? 😊', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    unread: 2
  },
  {
    user: { _id: 'u2', username: 'john_doe', fullName: 'John Anderson', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    lastMessage: { text: 'Are we still on for today?', createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    unread: 0
  },
  {
    user: { _id: 'u3', username: 'emma_wilson', fullName: 'Emma Wilson', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
    lastMessage: { text: 'Check out this recipe I found!', createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
    unread: 1
  },
  {
    user: { _id: 'u4', username: 'chris_harris', fullName: 'Chris Harris', avatar: 'https://randomuser.me/api/portraits/men/76.jpg' },
    lastMessage: { text: 'Great workout today 💪', createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
    unread: 0
  }
];

const mockMessages = {
  u1: [
    { _id: 'm1', sender: { _id: 'u1', username: 'sarah_cruz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }, text: 'Hey! How are you doing? 😊', createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
    { _id: 'm2', sender: { _id: 'me' }, text: 'I\'m great! Just got back from a walk. How about you?', createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
    { _id: 'm3', sender: { _id: 'u1', username: 'sarah_cruz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }, text: 'That sounds amazing! I\'ve been working on a new project 🎨', createdAt: new Date(Date.now() - 6 * 60000).toISOString() },
    { _id: 'm4', sender: { _id: 'me' }, text: 'Oh nice! What kind of project?', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  ]
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function Chat() {
  const { user, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState(mockConversations);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const socket = useRef();
  const scrollRef = useRef();
  const typingTimeout = useRef();
  const mediaInputRef = useRef();
  const location = useLocation();

  // Handle selected user from navigation state (e.g. from Profile page)
  useEffect(() => {
    if (location.state?.selectUser) {
      const targetUser = location.state.selectUser;
      const existing = conversations.find(c => c.user._id === targetUser._id);
      if (existing) {
        setCurrentChat(existing);
      } else {
        const newConv = {
          user: targetUser,
          lastMessage: null,
          unread: 0
        };
        setConversations(prev => {
          if (prev.some(c => c.user._id === targetUser._id)) return prev;
          return [newConv, ...prev];
        });
        setCurrentChat(newConv);
      }
    }
  }, [location.state, conversations]);

  // Initialize Socket.io
  useEffect(() => {
    if (user) {
      socket.current = io(window.location.origin.includes('localhost') ? 'http://localhost:5000' : '/');

      socket.current.on('getMessage', (data) => {
        setArrivalMessage({
          _id: Date.now(),
          sender: { _id: data.senderId, username: data.senderName, avatar: currentChat?.user?.avatar },
          text: data.text,
          mediaUrl: data.mediaUrl || '',
          mediaType: data.mediaType || '',
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      socket.current.on('onlineUsers', (users) => {
        setOnlineUsers(users.map(u => u.userId));
      });

      socket.current.on('userTyping', ({ senderName }) => {
        if (currentChat?.user?.username === senderName) {
          setIsTyping(true);
        }
      });

      socket.current.on('userStopTyping', ({ senderName }) => {
        if (currentChat?.user?.username === senderName) {
          setIsTyping(false);
        }
      });

      socket.current.emit('newUser', { userId: user._id, username: user.username });
    }

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user]);

  // Handle arrival messages
  useEffect(() => {
    if (arrivalMessage && currentChat?.user?._id === arrivalMessage.sender._id) {
      setMessages(prev => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage, currentChat]);

  // Fetch conversations
  useEffect(() => {
    const getConversations = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/messages/conversations', {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setConversations(data);
        }
      } catch (err) {}
    };
    getConversations();
  }, [token]);

  // Fetch messages for current chat
  useEffect(() => {
    if (!currentChat) return;

    const getMessages = async () => {
      // Use mock messages for demo
      const mock = mockMessages[currentChat.user._id];
      if (mock) {
        setMessages(mock);
        return;
      }

      try {
        const res = await fetch(`/api/messages/${currentChat.user._id}`, {
          headers: buildHeaders(token)
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {}
    };
    getMessages();
  }, [currentChat, token]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !mediaFile) || !currentChat) return;

    const msgText = newMessage.trim();
    setNewMessage('');

    let sentMediaUrl = '';
    let sentMediaType = '';

    // Upload media file if attached
    if (mediaFile) {
      setUploadingMedia(true);
      try {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: buildHeaders(token),
          body: formData
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          sentMediaUrl = uploadData.url;
          sentMediaType = mediaType;
        } else {
          sentMediaUrl = mediaPreview; // fallback to blob URL
          sentMediaType = mediaType;
        }
      } catch {
        sentMediaUrl = mediaPreview;
        sentMediaType = mediaType;
      } finally {
        setUploadingMedia(false);
        setMediaFile(null);
        setMediaPreview('');
        setMediaType('');
      }
    }

    // Optimistic update
    const optimisticMsg = {
      _id: 'temp_' + Date.now(),
      sender: { _id: user._id },
      text: msgText,
      mediaUrl: sentMediaUrl,
      mediaType: sentMediaType,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    // Send via socket
    socket.current?.emit('sendMessage', {
      senderName: user.username,
      receiverName: currentChat.user.username,
      senderId: user._id,
      receiverId: currentChat.user._id,
      text: msgText,
      mediaUrl: sentMediaUrl,
      mediaType: sentMediaType
    });

    // Stop typing indicator
    socket.current?.emit('stopTyping', {
      senderName: user.username,
      receiverName: currentChat.user.username
    });

    // Save to DB
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify({
          receiverId: currentChat.user._id,
          text: msgText,
          mediaUrl: sentMediaUrl,
          mediaType: sentMediaType
        })
      });
    } catch (err) {}

    // Update conversation last message
    setConversations(prev => prev.map(c => {
      if (c.user._id === currentChat.user._id) {
        return {
          ...c,
          lastMessage: {
            text: sentMediaUrl ? (msgText || '📎 Media') : msgText,
            createdAt: new Date().toISOString()
          }
        };
      }
      return c;
    }));
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = file.type.startsWith('video') ? 'video' : 'image';
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaType(type);
    e.target.value = '';
  };

  const clearMediaPreview = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (currentChat && socket.current) {
      socket.current.emit('typing', {
        senderName: user.username,
        receiverName: currentChat.user.username
      });

      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        socket.current?.emit('stopTyping', {
          senderName: user.username,
          receiverName: currentChat.user.username
        });
      }, 1500);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>

        {/* ===== CONVERSATIONS SIDEBAR ===== */}
        <div className={styles.conversationsSidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Messages</h2>
            <div className={styles.searchConversation}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.conversationList}>
            {filteredConversations.length === 0 ? (
              <div className={styles.noConversations}>
                <FaCommentDots />
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredConversations.map((conv, idx) => (
                <div
                  key={conv.user._id || idx}
                  className={`${styles.conversationItem} ${currentChat?.user._id === conv.user._id ? styles.active : ''}`}
                  onClick={() => setCurrentChat(conv)}
                >
                  <div className={styles.convAvatarWrap}>
                    <img src={conv.user.avatar} alt={conv.user.username} className={styles.convAvatar} />
                    {isOnline(conv.user._id) && <div className={styles.onlineDot} />}
                  </div>
                  <div className={styles.convInfo}>
                    <span className={styles.convName}>{conv.user.fullName || conv.user.username}</span>
                    <span className={styles.convLastMsg}>{conv.lastMessage?.text || 'Start a conversation'}</span>
                  </div>
                  <div className={styles.convMeta}>
                    <span className={styles.convTime}>{conv.lastMessage ? timeAgo(conv.lastMessage.createdAt) : ''}</span>
                    {conv.unread > 0 && (
                      <div className={styles.unreadBadge}>{conv.unread}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===== CHAT WINDOW ===== */}
        <div className={styles.chatWindow}>
          {!currentChat ? (
            <div className={styles.emptyChatState}>
              <div className={styles.emptyChatIcon}>
                <FaCommentDots />
              </div>
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting with your friends</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderUser}>
                  <div style={{ position: 'relative' }}>
                    <img src={currentChat.user.avatar} alt="" className={styles.chatHeaderAvatar} />
                    {isOnline(currentChat.user._id) && (
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 12, height: 12, background: 'var(--accent)',
                        borderRadius: '50%', border: '2px solid var(--neo-bg)'
                      }} />
                    )}
                  </div>
                  <div className={styles.chatHeaderInfo}>
                    <h4>{currentChat.user.fullName || currentChat.user.username}</h4>
                    <span className={`${styles.chatHeaderStatus} ${!isOnline(currentChat.user._id) ? styles.offline : ''}`}>
                      {isTyping ? 'typing...' : isOnline(currentChat.user._id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className={styles.chatHeaderActions}>
                  <button className={styles.chatActionBtn} title="Voice call"><FaPhone /></button>
                  <button className={styles.chatActionBtn} title="Video call"><FaVideo /></button>
                  <button className={styles.chatActionBtn} title="More options"><FaEllipsisV /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className={styles.messagesArea}>
                {messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === user?._id || msg.sender?._id === 'me';
                  const showAvatar = !isOwn && (idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id);

                  return (
                    <div key={msg._id || idx} className={`${styles.messageRow} ${isOwn ? styles.own : ''}`}>
                      {!isOwn && (
                        <img
                          src={showAvatar ? (msg.sender?.avatar || currentChat.user.avatar) : undefined}
                          alt=""
                          className={styles.messageAvatar}
                          style={{ visibility: showAvatar ? 'visible' : 'hidden' }}
                        />
                      )}
                      <div className={`${styles.messageBubble} ${isOwn ? styles.sent : styles.received}`}>
                        {msg.mediaUrl && (
                          <div className={styles.mediaMessage}>
                            {msg.mediaType === 'video' ? (
                              <video src={msg.mediaUrl} controls className={styles.mediaBubbleContent} />
                            ) : (
                              <img src={msg.mediaUrl} alt="shared media" className={styles.mediaBubbleContent} />
                            )}
                          </div>
                        )}
                        {msg.text && msg.text}
                      </div>
                      <span className={styles.messageTime}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className={styles.typingIndicator}>
                    <img src={currentChat.user.avatar} alt="" className={styles.messageAvatar} />
                    <div className={styles.typingDots}>
                      <div className={styles.typingDot} />
                      <div className={styles.typingDot} />
                      <div className={styles.typingDot} />
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>

              {/* Media Preview */}
              {mediaPreview && (
                <div className={styles.mediaPreviewBar}>
                  <div className={styles.mediaPreviewContent}>
                    {mediaType === 'video' ? (
                      <video src={mediaPreview} className={styles.mediaPreviewThumb} />
                    ) : (
                      <img src={mediaPreview} alt="preview" className={styles.mediaPreviewThumb} />
                    )}
                    <span className={styles.mediaPreviewLabel}>Ready to send</span>
                    <button className={styles.mediaPreviewClose} onClick={clearMediaPreview}>
                      <FaTimes />
                    </button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className={styles.messageInputArea}>
                <button
                  className={styles.attachBtn}
                  title="Attach file"
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <FaPaperclip />
                </button>
                <input
                  type="file"
                  ref={mediaInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                />
                <div className={styles.messageInputWrap}>
                  <input
                    type="text"
                    className={styles.messageInput}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <button className={styles.emojiBtn} title="Emoji">
                    <FaSmile />
                  </button>
                </div>
                <button
                  className={styles.sendBtn}
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !mediaFile) || uploadingMedia}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Chat;

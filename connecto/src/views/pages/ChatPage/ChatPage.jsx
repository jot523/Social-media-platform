/**
 * ChatPage Component (View Layer)
 * Real-time messaging interface
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaPaperPlane, FaSmile, FaPaperclip, FaPhone, FaVideo, 
  FaEllipsisV, FaCommentDots, FaMicrophone, FaMicrophoneSlash, 
  FaVideoSlash, FaPhoneSlash, FaDesktop, FaSyncAlt
} from 'react-icons/fa';
import { useChatViewModel } from '../../../viewmodels/chat/useChatViewModel';
import Avatar from '../../components/common/Avatar/Avatar';
import styles from './ChatPage.module.css';

const ChatPage = () => {
  const {
    user,
    conversations,
    currentChat,
    messages,
    newMessage,
    isTyping,
    searchQuery,
    scrollRef,
    setSearchQuery,
    selectChat,
    sendMessage,
    handleTyping,
    isOnline,
    timeAgo,
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
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    switchCamera,
    loading,
  } = useChatViewModel();
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>

        {/* ===== CONVERSATIONS SIDEBAR ===== */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Messages</h2>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.conversationList}>
            {conversations.length === 0 ? (
              <div className={styles.emptyConversations}>
                <FaCommentDots />
                <p>No conversations yet</p>
                <button
                  onClick={() => navigate('/explore')}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: 'var(--primary, #6b24b3)',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Explore Users
                </button>
              </div>
            ) : (
              conversations.map((conv, idx) => (
                <div
                  key={conv.user._id || idx}
                  className={`${styles.conversationItem} ${currentChat?.user._id === conv.user._id ? styles.active : ''}`}
                  onClick={() => selectChat(conv)}
                >
                  <div className={styles.convAvatarWrap}>
                    <Avatar
                      src={conv.user.avatar}
                      alt={conv.user.username}
                      size="md"
                      isOnline={isOnline(conv.user._id)}
                    />
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
            <div className={styles.emptyChat}>
              <div className={styles.emptyChatIcon}><FaCommentDots /></div>
              <h3>Your Messages</h3>
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderUser}>
                  <Avatar
                    src={currentChat.user.avatar}
                    alt={currentChat.user.username}
                    size="md"
                    isOnline={isOnline(currentChat.user._id)}
                  />
                  <div className={styles.chatHeaderInfo}>
                    <h4>{currentChat.user.fullName || currentChat.user.username}</h4>
                    <span className={`${styles.chatStatus} ${!isOnline(currentChat.user._id) ? styles.offline : ''}`}>
                      {isTyping ? 'typing...' : isOnline(currentChat.user._id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className={styles.chatHeaderActions}>
                  <button onClick={() => startCall('audio')} className={styles.chatActionBtn} title="Voice call"><FaPhone /></button>
                  <button onClick={() => startCall('video')} className={styles.chatActionBtn} title="Video call"><FaVideo /></button>
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
                        <div className={styles.msgAvatarSlot}>
                          {showAvatar && (
                            <Avatar
                              src={msg.sender?.avatar || currentChat.user.avatar}
                              alt={msg.sender?.username}
                              size="xs"
                            />
                          )}
                        </div>
                      )}
                      <div className={`${styles.messageBubble} ${isOwn ? styles.sent : styles.received}`}>
                        {msg.text}
                      </div>
                      <span className={styles.messageTime}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className={styles.typingIndicator}>
                    <Avatar src={currentChat.user.avatar} alt="" size="xs" />
                    <div className={styles.typingDots}>
                      <div className={styles.dot} />
                      <div className={styles.dot} />
                      <div className={styles.dot} />
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>

              {/* Message Input */}
              <div className={styles.inputArea}>
                <button className={styles.attachBtn} title="Attach file"><FaPaperclip /></button>
                <div className={styles.inputWrap}>
                  <input
                    type="text"
                    className={styles.messageInput}
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className={styles.emojiBtn} title="Emoji"><FaSmile /></button>
                </div>
                <button
                  className={styles.sendBtn}
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  title="Send"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== WEBRTC CALL OVERLAY ===== */}
      {callState !== 'idle' && (
        <div className={styles.callOverlay}>
          <div className={styles.callCard}>
            <div className={styles.callHeader}>
              <Avatar src={callUser?.avatar} size="xl" />
              <h3>{callUser?.fullName || callUser?.username}</h3>
              <p className={styles.callStatus}>
                {callState === 'outgoing' && 'Calling...'}
                {callState === 'incoming' && `Incoming ${callType} call...`}
                {callState === 'connected' && formatDuration(callDuration)}
              </p>
            </div>

            {callState === 'connected' && callType === 'video' && (
              <div className={styles.streamsContainer}>
                <div className={styles.remoteVideoWrap}>
                  <video
                    ref={el => {
                      if (el && remoteStream) el.srcObject = remoteStream;
                    }}
                    autoPlay
                    playsInline
                    className={styles.remoteVideo}
                  />
                </div>
                {isCameraOn && (
                  <div className={styles.localVideoWrap}>
                    <video
                      ref={el => {
                        if (el && localStream) el.srcObject = localStream;
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={styles.localVideo}
                    />
                  </div>
                )}
              </div>
            )}

            <div className={styles.callActions}>
              {callState === 'incoming' ? (
                <>
                  <button onClick={acceptCall} className={styles.btnAccept} title="Accept Call">
                    <FaPhone /> Accept
                  </button>
                  <button onClick={rejectCall} className={styles.btnDecline} title="Decline Call">
                    <FaPhoneSlash /> Decline
                  </button>
                </>
              ) : (
                <>
                  {callState === 'connected' && (
                    <>
                      <button onClick={toggleMute} className={`${styles.actionCircle} ${isMuted ? styles.active : ''}`}>
                        {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                      </button>
                    {callType === 'video' && (
                        <button onClick={toggleCamera} className={`${styles.actionCircle} ${!isCameraOn ? styles.active : ''}`}>
                          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </button>
                      )}
                      {callType === 'video' && (
                        <button onClick={toggleScreenShare} className={`${styles.actionCircle} ${isScreenSharing ? styles.active : ''}`} title="Screen Share">
                          <FaDesktop />
                        </button>
                      )}
                      {callType === 'video' && (
                        <button onClick={switchCamera} className={styles.actionCircle} title="Switch Camera">
                          <FaSyncAlt />
                        </button>
                      )}
                    </>
                  )}
                  <button onClick={endCall} className={styles.btnHangup} title="End Call">
                    <FaPhoneSlash />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
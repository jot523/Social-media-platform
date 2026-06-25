/**
 * Stories ViewModel
 * Manages state and logic for the Stories feature
 */

import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { authHeaders } from '../../services/utils/authUtils';

const mockStories = [
  { _id: 's1', user: { _id: 'u1', username: 'sarah_cruz', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' }, mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', mediaType: 'image', caption: 'Golden hour 🌅', viewed: false },
  { _id: 's2', user: { _id: 'u2', username: 'john_doe', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' }, mediaUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400', mediaType: 'image', caption: 'Central Park 🌳', viewed: false },
  { _id: 's3', user: { _id: 'u3', username: 'emma_wilson', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' }, mediaUrl: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=400', mediaType: 'image', caption: 'Homemade pasta 🍝', viewed: true },
  { _id: 's4', user: { _id: 'u4', username: 'chris_harris', avatar: 'https://randomuser.me/api/portraits/men/76.jpg' }, mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', mediaType: 'image', caption: 'Gym day 💪', viewed: false },
  { _id: 's5', user: { _id: 'u5', username: 'nora_james', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' }, mediaUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=400', mediaType: 'image', caption: 'Cute cat 🐱', viewed: true },
];

const STORY_DURATION = 5000; // 5 seconds per story

export const useStoriesViewModel = () => {
  const { user, token } = useContext(AuthContext);

  const [stories, setStories] = useState(mockStories);
  const [viewingIndex, setViewingIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const progressInterval = useRef(null);
  const storyTimeout = useRef(null);
  const nextStoryRef = useRef(null);

  // Fetch stories from API (only with a real JWT token)
  const fetchStories = useCallback(async () => {
    const localStories = JSON.parse(localStorage.getItem('local_stories') || '[]');
    
    if (!token) {
      setStories([...localStories, ...mockStories]);
      return;
    }

    try {
      const res = await fetch('/api/stories', {
        headers: authHeaders(token)
      });
      if (res.ok) {
        const data = await res.json();
        // API returns grouped stories [{user, stories:[]}] — flatten them
        if (Array.isArray(data) && data.length > 0) {
          const flat = data.flatMap(group =>
            group.stories
              ? group.stories.map(s => ({ ...s, user: group.user }))
              : [group]
          );
          
          const existingIds = new Set(flat.map(s => s._id));
          const uniqueLocal = localStories.filter(s => !existingIds.has(s._id));
          setStories([...uniqueLocal, ...flat]);
        } else {
          setStories([...localStories, ...mockStories]);
        }
      } else {
        setStories([...localStories, ...mockStories]);
      }
    } catch (err) {
      setStories([...localStories, ...mockStories]);
    }
  }, [token]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    const handleStoryPublished = () => {
      fetchStories();
    };
    window.addEventListener('story-published', handleStoryPublished);
    return () => {
      window.removeEventListener('story-published', handleStoryPublished);
    };
  }, [fetchStories]);


  const openStory = useCallback((index) => {
    setViewingIndex(index);
    // Mark as viewed
    setStories(prev => prev.map((s, i) => i === index ? { ...s, viewed: true } : s));
    // Mark viewed on server
    if (stories[index]?._id && token) {
      fetch(`/api/stories/${stories[index]._id}/view`, {
        method: 'PUT',
        headers: authHeaders(token)
      }).catch(() => {});
    }
  }, [stories, token]);

  const closeStory = useCallback(() => {
    setViewingIndex(null);
    setProgress(0);
  }, []);

  const nextStory = useCallback(() => {
    setViewingIndex(prev => {
      if (prev === null) return null;
      if (prev < stories.length - 1) {
        const next = prev + 1;
        setStories(s => s.map((st, i) => i === next ? { ...st, viewed: true } : st));
        return next;
      }
      return null; // Close after last story
    });
    setProgress(0);
  }, [stories.length]);

  const prevStory = useCallback(() => {
    setViewingIndex(prev => {
      if (prev === null || prev === 0) return prev;
      return prev - 1;
    });
    setProgress(0);
  }, []);

  // Keep nextStory ref current
  useEffect(() => {
    nextStoryRef.current = nextStory;
  }, [nextStory]);

  // Auto-advance story with progress
  useEffect(() => {
    if (viewingIndex === null) {
      clearInterval(progressInterval.current);
      clearTimeout(storyTimeout.current);
      setProgress(0);
      return;
    }

    setProgress(0);
    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
    }, 50);

    storyTimeout.current = setTimeout(() => {
      nextStoryRef.current?.();
    }, STORY_DURATION);

    return () => {
      clearInterval(progressInterval.current);
      clearTimeout(storyTimeout.current);
    };
  }, [viewingIndex]);

  const viewingStory = viewingIndex !== null ? stories[viewingIndex] : null;

  return {
    stories,
    currentUser: user,
    viewingStory,
    viewingIndex,
    progress,
    loading,
    openStory,
    closeStory,
    nextStory,
    prevStory,
    fetchStories,
  };
};
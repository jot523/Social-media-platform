const Post = require('../models/Post');

// The 7 mood classes and their corresponding index:
// [Happy, Sad, Stressed, Bored, Excited, Tired, Focused]
const MOODS = ['Happy', 'Sad', 'Stressed', 'Bored', 'Excited', 'Tired', 'Focused'];

// Heuristic keyword definitions for the local NLP fallback
const KEYWORD_MAP = {
  Happy: /\b(happy|joy|smile|cheerful|sunny|beach|vacation|travel|bali|magic|magical|love|great|good|beautiful|wonderful|peace|blessed|excited|glad)\b/i,
  Sad: /\b(sad|crying|lonely|dark|rain|blue|tear|heartbreak|grief|pain|hurt|down|inspire|hope|uplifting|comfort|strong|healing)\b/i,
  Stressed: /\b(stress|stressed|anxious|worry|exam|test|work|busy|overwhelmed|burnout|deadline|funny|laugh|lol|joke|meme|pet|cat|dog|cute|animal)\b/i,
  Bored: /\b(bored|boring|nothing|lazy|scroll|game|gaming|play|trend|trending|discovery|explore|challenge|meme|new|watch|video)\b/i,
  Excited: /\b(excited|hype|omg|can't wait|party|club|high|energy|adventure|sports|run|win|gym|bhangra|dance|music|concert|festival|awesome)\b/i,
  Tired: /\b(tired|sleep|sleepy|exhausted|bed|dream|night|calm|calming|asmr|relax|relaxation|meditate|slow|quiet|ambient|sound|lofi)\b/i,
  Focused: /\b(focus|focused|learn|learning|code|coding|developer|programmer|study|tutorial|react|science|book|read|library|tech|tip|how|guide|productivity|facts|lesson)\b/i
};

// Emoji maps to add signal strength
const EMOJI_MAP = {
  Happy: /[😊😀😃😄😁😆🌅☀️❤️🌻🏖️🏝️✨]/u,
  Sad: /[😢😭💔🌧️☔🥀☁️🕯️🥺]/u,
  Stressed: /[😰😥😓😩😫🤯🎒📝💼🐱🐶🐈🐕🐾😹]/u,
  Bored: /[🥱💤🎮📱👾🖥️👀❔]/u,
  Excited: /[🤩🥳🎉💥🚀🔥💪🏅🕺💃🎸🎶🌟]/u,
  Tired: /[😴🛌🌙🔇🎧🧘‍♂️💆‍♀️🕯️☕]/u,
  Focused: /[🧠🧐🎯🤓📚📘📝💻🔬🛠️🎓💡]/u
};

/**
 * Local fallback classifier when no API key is available
 */
function localClassifier(caption) {
  const scores = new Array(7).fill(0);
  const text = caption || '';

  // Calculate scores based on regex matches
  MOODS.forEach((mood, idx) => {
    let score = 0;
    if (KEYWORD_MAP[mood].test(text)) {
      score += 3.0; // Strong keyword match
    }
    // Check for multiple matches
    const words = text.split(/\s+/);
    words.forEach(word => {
      if (KEYWORD_MAP[mood].test(word)) {
        score += 1.0;
      }
    });
    // Check emojis
    if (EMOJI_MAP[mood].test(text)) {
      score += 2.0;
    }
    scores[idx] = score;
  });

  // Apply smoothing factor (0.05) to avoid absolute zeros
  const smoothed = scores.map(s => s + 0.05);
  const sum = smoothed.reduce((a, b) => a + b, 0);
  return smoothed.map(s => parseFloat((s / sum).toFixed(4)));
}

/**
 * Tag post caption using Claude API
 */
async function tagPostMood(caption) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.log('No CLAUDE_API_KEY found, using local NLP classifier fallback.');
    return localClassifier(caption);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: `You are a specialized content classifier for a social media platform. Classify the user's post caption into a 7-dimensional mood affinity vector.
The dimensions correspond to: [Happy, Sad, Stressed, Bored, Excited, Tired, Focused].
Each value must be a float between 0.0 and 1.0 representing how much this post is suitable for or shifts someone's mood when they are in that emotional state.
For example:
- A post about traveling or beautiful sunset is high in Happy/Excited.
- A post about funny memes or pets is high in Stressed (as it relieves stress).
- A post about tutorials, coding, or books is high in Focused.
- A post about lo-fi music or slow pacing is high in Tired/Sad.
- A post about gaming or trends is high in Bored.

The array MUST sum to 1.0. You MUST respond with ONLY a valid raw JSON array containing exactly 7 floats. Example: [0.35, 0.05, 0.10, 0.20, 0.15, 0.05, 0.10]. Do NOT use markdown code blocks, do NOT write any explanation.`,
        messages: [
          { role: 'user', content: `Classify the following caption: "${caption}"` }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API responded with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text?.trim();
    if (content) {
      // Parse the JSON array
      const vector = JSON.parse(content);
      if (Array.isArray(vector) && vector.length === 7) {
        return vector.map(v => parseFloat(v));
      }
    }
    throw new Error('Invalid response format from Claude');
  } catch (err) {
    console.error('Claude API tagging error, falling back to local NLP:', err.message);
    return localClassifier(caption);
  }
}

/**
 * Runs asynchronously to tag a post after it has been created
 */
function queuePostTagging(postId) {
  // Execute non-blocking on the event loop (simulating background job queue)
  setImmediate(async () => {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        console.error(`Post ${postId} not found for tagging.`);
        return;
      }
      console.log(`🏷️ Tagging post: "${post.caption.substring(0, 40)}..."`);
      const moodVector = await tagPostMood(post.caption);
      post.moodVector = moodVector;
      await post.save();
      console.log(`✅ Tagged post ${postId} with vector: [${moodVector.join(', ')}]`);
    } catch (err) {
      console.error(`Error tagging post ${postId}:`, err);
    }
  });
}

module.exports = {
  tagPostMood,
  queuePostTagging,
  MOODS
};

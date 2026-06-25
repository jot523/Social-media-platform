import React, { useState, useContext } from "react";
import styles from "../css/Page1.module.css";
import { AuthContext } from "../Context/AuthContext";
import {
  FaUser, FaEnvelope, FaLock, FaIdCard,
  FaHeart, FaCamera, FaCommentDots, FaPlayCircle,
  FaUsers, FaBell, FaShieldAlt, FaGlobe,
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaApple, FaGooglePlay
} from "react-icons/fa";

const features = [
  {
    icon: <FaCamera />,
    title: "Stories & Reels",
    desc: "Share your moments with 24-hour stories and short-form video reels that captivate your audience.",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    icon: <FaCommentDots />,
    title: "Real-time Chat",
    desc: "Connect instantly with friends through our lightning-fast messaging system powered by Socket.io.",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    icon: <FaHeart />,
    title: "Social Feed",
    desc: "Discover posts, reels, and stories from people you follow in a beautifully curated feed.",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
  },
  {
    icon: <FaUsers />,
    title: "Community",
    desc: "Build your community, follow interesting people, and grow your social network organically.",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    icon: <FaBell />,
    title: "Smart Notifications",
    desc: "Stay updated with real-time notifications for likes, comments, follows, and messages.",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
  },
  {
    icon: <FaShieldAlt />,
    title: "Privacy & Security",
    desc: "Your data is protected with JWT authentication, encrypted passwords, and privacy controls.",
    gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
  }
];

function Page1() {
  const { login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.username || !formData.email || !formData.password) {
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || formData.username
        });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.landingWrapper}>
      {/* ===== HERO SECTION ===== */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          {/* Left Branding */}
          <div className={styles.heroBranding}>
            <div className={styles.brandLogo}>
              <div className={styles.brandLogoIcon}>C</div>
              <span className={styles.brandName}>CONNECTO</span>
            </div>

            <h1 className={styles.heroTitle}>
              Connect, Share &<br />
              <span>Inspire the World</span>
            </h1>

            <p className={styles.heroSubtitle}>
              The social platform that combines the best of Instagram and Facebook.
              Share stories, post reels, chat in real-time, and build your community.
            </p>

            <div className={styles.heroFeatures}>
              {[
                { icon: <FaCamera />, label: "Stories & Reels" },
                { icon: <FaCommentDots />, label: "Live Chat" },
                { icon: <FaHeart />, label: "Social Feed" },
                { icon: <FaPlayCircle />, label: "Video Reels" },
                { icon: <FaGlobe />, label: "Global Network" },
              ].map((f, i) => (
                <div key={i} className={styles.featurePill}>
                  {f.icon}
                  <span>{f.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1M+</span>
                <span className={styles.statLabel}>Users</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>50M+</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>120+</span>
                <span className={styles.statLabel}>Countries</span>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className={styles.authCard}>
            <div className={styles.authHeader}>
              <h2>{isLogin ? "Welcome Back 👋" : "Join Connecto 🚀"}</h2>
              <p>{isLogin ? "Sign in to continue your journey" : "Create your account for free"}</p>
            </div>

            {/* Tabs */}
            <div className={styles.authTabs}>
              <button
                className={`${styles.authTab} ${isLogin ? styles.active : ''}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Login
              </button>
              <button
                className={`${styles.authTab} ${!isLogin ? styles.active : ''}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Sign Up
              </button>
            </div>

            <form className={styles.authForm} onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className={styles.inputGroup}>
                    <FaUser />
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <FaIdCard />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className={styles.inputGroup}>
                <FaEnvelope />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <FaLock />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center' }}>
                  {error}
                </p>
              )}

              {!isLogin && (
                <p className={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <a href="#terms">Terms of Service</a> and{' '}
                  <a href="#privacy">Privacy Policy</a>
                </p>
              )}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>

              <div className={styles.divider}>or continue with</div>

              <div className={styles.socialLogin}>
                <button type="button" className={styles.socialBtn}>
                  <FaFacebookF style={{ color: '#1877f2' }} /> Facebook
                </button>
                <button type="button" className={styles.socialBtn}>
                  <FaInstagram style={{ color: '#e1306c' }} /> Instagram
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionTitle}>
          <h2>Everything You Need</h2>
          <p>A complete social media experience in one platform</p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <div className={styles.featureCardIcon} style={{ background: f.gradient }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {[
            { number: "1M+", label: "Active Users" },
            { number: "50M+", label: "Posts Shared" },
            { number: "10M+", label: "Stories Daily" },
            { number: "120+", label: "Countries" }
          ].map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.number}>{s.number}</span>
              <span className={styles.label}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.landingFooter}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <h2>CONNECTO</h2>
            <p>
              The next-generation social platform combining the best features of
              Instagram and Facebook with a beautiful neomorphism design.
            </p>
            <div className={styles.footerSocials}>
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, i) => (
                <button key={i} className={styles.footerSocialBtn}>
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4>Platform</h4>
            <ul>
              <li>Home Feed</li>
              <li>Reels</li>
              <li>Stories</li>
              <li>Live Video</li>
              <li>Marketplace</li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Blog</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className={styles.footerCol}>
            <h4>Legal</h4>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Cookie Policy</li>
              <li>Help Center</li>
              <li>Safety</li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>Designed by ❤️ AMARJOT KAUR</p>
        </div>
      </footer>
    </div>
  );
}

export default Page1;

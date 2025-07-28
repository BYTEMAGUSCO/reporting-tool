import { useEffect, useState } from 'react';

const images = [
  {
    src: 'https://images.unsplash.com/photo-1581090700227-1e8f62f9c2b5?auto=format&fit=crop&w=800&q=80',
    alt: 'Government building',
    caption: 'Streamlining report creation and approval processes.'
  },
  {
    src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    alt: 'Collaboration',
    caption: 'Enabling efficient communication between departments.'
  },
  {
    src: 'https://images.unsplash.com/photo-1581093588401-14c2f2c97c6a?auto=format&fit=crop&w=800&q=80',
    alt: 'Admin Panel',
    caption: 'Track reports and monitor workflow in real-time.'
  }
];

const Slideshow = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = images[index];

  return (
    <div style={styles.container}>
      <div
        key={index}
        style={{
          ...styles.slider,
          transform: `translateX(${direction * 100}%)`,
          animation: 'slideIn 0.6s ease forwards',
        }}
      >
        <img
          src={current.src}
          alt={current.alt}
          style={styles.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '';
          }}
        />
        <div style={styles.caption}>
          <p>{current.caption}</p>
        </div>
      </div>

      {/* Slide animation keyframes */}
      <style>
        {`
        @keyframes slideIn {
          from { transform: translateX(${direction * 100}%); }
          to { transform: translateX(0); }
        }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  slider: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.6s ease-in-out',
  },
  image: {
    width: '100%',
    height: '70%',
    objectFit: 'cover',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  },
  caption: {
    height: '30%',
    backgroundColor: '#fff',
    padding: '1rem',
    color: '#1e1f2b',
    fontWeight: 500,
    fontSize: '1rem',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #eee',
  },
};

export default Slideshow;

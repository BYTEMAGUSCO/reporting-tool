import { useEffect, useState } from 'react';

const images = [
  {
    src: 'https://res.cloudinary.com/upwork-cloud/image/upload/c_scale,w_1000/v1708533237/catalog/1386012458645008384/jjgkzurpd0bqlru6ejx2.jpg',
    alt: 'Government building',
    caption: 'Streamlining report creation and approval processes.',
  },
  {
    src: 'https://aventislearning.com/wp-content/uploads/2020/03/Collaboration-1.jpeg',
    alt: 'Team Collaboration',
    caption: 'Enabling efficient communication between departments.',
  },
  {
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    alt: 'Admin Panel',
    caption: 'Track reports and monitor workflow in real-time.',
  },
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
    borderRadius: '0.5rem',
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
    height: '60%', // down from 70% to save vertical space
    objectFit: 'cover',
    borderTopLeftRadius: '0.5rem',
    borderTopRightRadius: '0.5rem',
  },
  caption: {
    height: '40%', // up from 30% to fill leftover space
    backgroundColor: '#fff',
    padding: '0.75rem', // shrunk padding a bit
    color: '#1e1f2b',
    fontWeight: 500,
    fontSize: '0.9rem', // smaller font for compactness
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderTop: '1px solid #eee',
  },
};

export default Slideshow;

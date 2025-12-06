/**
 * Mock data for development without database
 * This is used when DATABASE_URL is not configured or connection fails
 */

export const MOCK_USERS = [
  {
    id: 'user_1',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'USER',
    createdAt: new Date('2025-12-01'),
  },
  {
    id: 'user_2',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    role: 'USER',
    createdAt: new Date('2025-12-02'),
  },
];

export const MOCK_CLIPS = [
  {
    id: 'clip_1',
    title: 'Amazing skateboard trick',
    description: 'Just landed this amazing trick after months of practice!',
    userId: 'user_1',
    fileUrl: 'https://media.giphy.com/media/xT9IgEx8SbQ9Nd8TkY/giphy.gif',
    thumbnailUrl: 'https://media.giphy.com/media/xT9IgEx8SbQ9Nd8TkY/giphy.gif',
    duration: 15,
    viewsCount: 1245,
    privacy: 'PUBLIC',
    createdAt: new Date('2025-12-04'),
    user: MOCK_USERS[0],
    _count: { likes: 89, comments: 12 },
  },
  {
    id: 'clip_2',
    title: 'Cooking time lapse',
    description: 'Making fresh pasta from scratch',
    userId: 'user_2',
    fileUrl: 'https://media.giphy.com/media/3o7TKEPG5V9SLQ3Jx6/giphy.gif',
    thumbnailUrl: 'https://media.giphy.com/media/3o7TKEPG5V9SLQ3Jx6/giphy.gif',
    duration: 45,
    viewsCount: 567,
    privacy: 'PUBLIC',
    createdAt: new Date('2025-12-03'),
    user: MOCK_USERS[1],
    _count: { likes: 34, comments: 5 },
  },
  {
    id: 'clip_3',
    title: 'Funny cat moment',
    description: 'My cat just discovered the laser pointer',
    userId: 'user_1',
    fileUrl: 'https://media.giphy.com/media/4NnYEXmLBkKIJ9KKrH/giphy.gif',
    thumbnailUrl: 'https://media.giphy.com/media/4NnYEXmLBkKIJ9KKrH/giphy.gif',
    duration: 8,
    viewsCount: 3421,
    privacy: 'PUBLIC',
    createdAt: new Date('2025-12-02'),
    user: MOCK_USERS[0],
    _count: { likes: 234, comments: 45 },
  },
];

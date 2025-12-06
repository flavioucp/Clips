/**
 * Tests básicos para API
 */

describe('API Health Check', () => {
  it('should return healthy status', async () => {
    const response = await fetch('http://localhost:3000/api/health');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});

describe('Auth Endpoints', () => {
  it('should reject login with invalid credentials', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      }),
    });

    expect(response.status).toBe(401);
  });

  it('should reject weak passwords during registration', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'weak', // Violates policy
      }),
    });

    expect(response.status).toBe(400);
  });
});

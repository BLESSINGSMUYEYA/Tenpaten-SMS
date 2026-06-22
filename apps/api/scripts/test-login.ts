async function main() {
  const url = 'http://localhost:4000/api/auth/login';
  
  // Test: login with lowercase/mixed-case schoolCode and email
  console.log('Testing login with lowercase/mixed-case inputs using native fetch...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schoolCode: 'admin-2026-0000',
        email: 'ADMIN@MyKlasi.online',
        password: 'Admin@MyKlasi2026'
      })
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response Data:', data);
  } catch (error: any) {
    console.error('Login failed:', error.message);
  }
}

main();

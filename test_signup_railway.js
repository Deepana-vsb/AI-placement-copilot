fetch('https://ai-placement-copilot-pro.up.railway.app/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test@example.com',
    password: 'password',
    college: 'Test College',
    branchYear: 'Other (4th Year)',
    location: 'India'
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}).catch(console.error);

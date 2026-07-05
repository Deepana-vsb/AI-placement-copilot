fetch('https://ai-placement-copilot-production.up.railway.app/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Surekha',
    email: 'surekhamns2106@gmail.com',
    password: 'password',
    college: 'V.S.B ENGINEERING COLLEGE',
    branchYear: 'Other (4th Year)',
    location: 'India'
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}).catch(console.error);

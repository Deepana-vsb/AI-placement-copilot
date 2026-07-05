fetch('http://localhost:8080/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'DEEPANA C S',
    email: 'deepana1305@gmail.com',
    password: 'password',
    college: 'vsb engineering college',
    branchYear: 'CS / IT (4th Year)',
    location: 'India'
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}).catch(console.error);

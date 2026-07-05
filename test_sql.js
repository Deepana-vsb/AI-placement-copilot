fetch('http://localhost:8080/api/sandbox/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    language: 'sqlite',
    code: 'SELECT * FROM employees'
  })
}).then(res => res.json()).then(console.log).catch(console.error);

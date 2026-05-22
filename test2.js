Promise.all([
  fetch('http://127.0.0.1:3000/api/courses'),
  fetch('http://127.0.0.1:3000/api/instructors'),
  fetch('http://127.0.0.1:3000/api/categories'),
  fetch('http://127.0.0.1:3000/api/memberships'),
  fetch('http://127.0.0.1:3000/api/languages')
]).then(async res => {
  for (let r of res) {
    const text = await r.text();
    try { JSON.parse(text); console.log(r.url, 'OK'); } 
    catch (e) { console.error(r.url, 'FAILED', text.slice(0, 50)); }
  }
})

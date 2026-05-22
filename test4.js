Promise.all([
  fetch('http://127.0.0.1:3000/api/courses').then(r => r.text()).then(t => ({ url: '/api/courses', text: t })),
  fetch('http://127.0.0.1:3000/api/courses/active').then(r => r.text()).then(t => ({ url: '/api/courses/active', text: t })),
  fetch('http://127.0.0.1:3000/api/sliders').then(r => r.text()).then(t => ({ url: '/api/sliders', text: t })),
  fetch('http://127.0.0.1:3000/api/memberships').then(r => r.text()).then(t => ({ url: '/api/memberships', text: t })),
  fetch('http://127.0.0.1:3000/api/events').then(r => r.text()).then(t => ({ url: '/api/events', text: t })),
  fetch('http://127.0.0.1:3000/api/testimonials').then(r => r.text()).then(t => ({ url: '/api/testimonials', text: t })),
  fetch('http://127.0.0.1:3000/api/blogs').then(r => r.text()).then(t => ({ url: '/api/blogs', text: t })),
  fetch('http://127.0.0.1:3000/api/languages').then(r => r.text()).then(t => ({ url: '/api/languages', text: t })),
  fetch('http://127.0.0.1:3000/api/settings').then(r => r.text()).then(t => ({ url: '/api/settings', text: t })),
  fetch('http://127.0.0.1:3000/api/instructors').then(r => r.text()).then(t => ({ url: '/api/instructors', text: t })),
  fetch('http://127.0.0.1:3000/api/categories').then(r => r.text()).then(t => ({ url: '/api/categories', text: t })),
  fetch('http://127.0.0.1:3000/api/public/course-bundles').then(r => r.text()).then(t => ({ url: '/api/public/course-bundles', text: t })),
]).then(results => {
  for (let res of results) {
    if (res.text.startsWith('<!doctype')) {
      console.log('FAIL:', res.url);
    }
  }
})

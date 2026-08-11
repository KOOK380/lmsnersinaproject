const fs = require('fs');
let code = fs.readFileSync('src/pages/FrontPages.tsx', 'utf8');

// Fix CourseDetails
code = code.replace(
  /if \(user && course && localToken\) \{\s*fetch\("\/api\/dashboard"[\s\S]*?\}, \[user, course, token\]\);/g,
  `if (user && courseRaw?.id && localToken) {
        fetch("/api/dashboard", { headers: { Authorization: \`Bearer \${localToken}\` } })
          .then(r => r.json())
          .then(res => {
             if(!res.error) setDashboardData(res);
          }).catch(console.error);
      }
    }, [user, courseRaw?.id, token]);`
);

// Fix BundleDetails
code = code.replace(
  /if \(user && bundle && localToken\) \{\s*fetch\("\/api\/dashboard"[\s\S]*?\}, \[user, bundle, token\]\);/g,
  `if (user && bundleRaw?.id && localToken) {
        fetch("/api/dashboard", { headers: { Authorization: \`Bearer \${localToken}\` } })
          .then(r => r.json())
          .then(res => {
             if(!res.error) setDashboardData(res);
          }).catch(console.error);
      }
    }, [user, bundleRaw?.id, token]);`
);

// Fix MembershipDetails
code = code.replace(
  /if \(user && membership && localToken\) \{\s*fetch\("\/api\/dashboard"[\s\S]*?\}, \[user, membership, token\]\);/g,
  `if (user && membershipRaw?.id && localToken) {
        fetch("/api/dashboard", { headers: { Authorization: \`Bearer \${localToken}\` } })
          .then(r => r.json())
          .then(res => {
             if(!res.error) setDashboardData(res);
          }).catch(console.error);
      }
    }, [user, membershipRaw?.id, token]);`
);

// Fix EventDetails
code = code.replace(
  /if \(user && event && localToken\) \{\s*fetch\("\/api\/dashboard"[\s\S]*?\}, \[user, event, token\]\);/g,
  `if (user && eventRaw?.id && localToken) {
        fetch("/api/dashboard", { headers: { Authorization: \`Bearer \${localToken}\` } })
          .then(r => r.json())
          .then(res => {
             if(!res.error) setDashboardData(res);
          }).catch(console.error);
      }
    }, [user, eventRaw?.id, token]);`
);

fs.writeFileSync('src/pages/FrontPages.tsx', code);

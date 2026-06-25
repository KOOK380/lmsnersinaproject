const fs = require('fs');

let i18nContent = fs.readFileSync('src/i18n.ts', 'utf8');

// Arabic
i18nContent = i18nContent.replace(
  '"p1": "معظم الناس ينتظرون اللحظة المناسبة. الاستراتيجية الصحيحة. الفرصة المناسبة. أنت لست معظم الناس. تشعر بذلك - هذا الجذب نحو شيء أكبر. هذا اليقين الهادئ بأنك صُنعت للمزيد. أنت فقط لم تجد المفتاح بعد. أنا هنا لأنني وجدته.",',
  '"p1": "معظم الناس ينتظرون اللحظة المناسبة. الاستراتيجية الصحيحة. الفرصة المناسبة. أنت لست معظم الناس. تشعر بذلك - هذا الجذب نحو شيء أكبر. هذا اليقين الهادئ بأنك صُنعت للمزيد. أنت فقط لم تجد المفتاح بعد. أنا هنا لأنني وجدته.",\n         "p2_title": "أنا نسرينة. لست مجرد مدربة. إثبات حي.",'
);

// English
i18nContent = i18nContent.replace(
  '"p1": "Most people are waiting for the right moment. The right strategy. The right opportunity. You are not most people. You feel it — that pull toward something bigger. That quiet certainty that you were built for more. You just haven\'t found the key yet. I am here because I found it.",',
  '"p1": "Most people are waiting for the right moment. The right strategy. The right opportunity. You are not most people. You feel it — that pull toward something bigger. That quiet certainty that you were built for more. You just haven\'t found the key yet. I am here because I found it.",\n         "p2_title": "I am Nesrina. Not just a coach. A living proof.",'
);

// French
i18nContent = i18nContent.replace(
  '"p1": "La plupart des gens attendent le bon moment. La bonne stratégie. La bonne opportunité. Vous n\'êtes pas comme la plupart des gens. Vous ressentez cela — cet élan vers quelque chose de plus grand. Cette certitude tranquille que vous avez été créé pour plus. Vous n\'avez juste pas encore trouvé la clé. Je suis ici parce que je l\'ai trouvée.",',
  '"p1": "La plupart des gens attendent le bon moment. La bonne stratégie. La bonne opportunité. Vous n\'êtes pas comme la plupart des gens. Vous ressentez cela — cet élan vers quelque chose de plus grand. Cette certitude tranquille que vous avez été créé pour plus. Vous n\'avez juste pas encore trouvé la clé. Je suis ici parce que je l\'ai trouvée.",\n         "p2_title": "Je suis Nesrina. Pas juste un coach. Une preuve vivante.",'
);

// "read_article"
// Arabic
i18nContent = i18nContent.replace(
  '"upcoming_events": "الفعاليات",',
  '"upcoming_events": "الفعاليات",\n         "read_article": "اقرأ المقال",'
);
// English
i18nContent = i18nContent.replace(
  '"upcoming_events": "Events",',
  '"upcoming_events": "Events",\n         "read_article": "Read Article",'
);
// French
i18nContent = i18nContent.replace(
  '"upcoming_events": "Événements",',
  '"upcoming_events": "Événements",\n         "read_article": "Lire l\'article",'
);


fs.writeFileSync('src/i18n.ts', i18nContent);

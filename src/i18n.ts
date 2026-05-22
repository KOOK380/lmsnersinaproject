import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      "nav": {
        "home": "الرئيسية",
        "courses": "الدورات",
        "memberships": "العضويات",
        "contact": "تواصل معنا",
        "dashboard": "لوحة التحكم",
        "admin": "الإدارة",
        "cart": "عربة التسوق",
        "login": "تسجيل الدخول",
        "register": "إنشاء حساب",
        "logout": "تسجيل خروج"
      },
      "footer": {
         "about": "منصة تعليمية تقدم أفضل الدورات والبرامج.",
         "links": "روابط سريعة",
         "contact": "تواصل معنا",
         "rights": "جميع الحقوق محفوظة",
         "about_title": "عن المنصة"
      },
      "home": {
         "hero_title": "تعلم وطور مهاراتك",
         "hero_subtitle": "أفضل المنصات التعليمية للارتقاء بمستواك.",
         "get_started": "ابدأ الآن",
         "view_courses": "تصفح الدورات",
         "top_categories": "أهم التصنيفات",
         "featured_courses": "دورات مميزة",
         "upcoming_events": "الفعاليات"
      },
      "courses": {
         "all_courses": "جميع الدورات",
         "details": "التفاصيل",
         "course_content": "محتوى الدورة",
         "about_lesson": "عن هذا الدرس",
         "meet_instructor": "تعرف على المدرب",
         "feedback": "التقييمات والمراجعات",
         "your_rating": "تقييمك",
         "submit_review": "إرسال التقييم",
         "no_reviews": "لا توجد تقييمات بعد.",
         "add_to_cart": "أضف للسلة",
         "go_to_course": "اذهب للدورة",
         "add_favorite": "أضف للمفضلة",
         "remove_favorite": "إزالة من المفضلة",
         "course_includes": "هذه الدورة تشمل:",
         "learners": "المتعلمين",
         "students": "طلاب",
         "lessons": "دروس",
         "duration": "المدة",
         "language": "اللغة",
         "share": "مشاركة",
         "report": "إبلاغ المراجع",
         "no_content": "لا يتوفر محتوى بعد."
      },
      "memberships": {
         "title": "البرامج والعضويات",
         "all_programs": "جميع البرامج",
         "view_details": "عرض التفاصيل",
         "real_value": "القيمة الحقيقية:",
         "who_is_for": "لمن هذا البرنامج؟",
         "what_you_get": "ماذا ستحصل",
         "entry_condition": "شروط القبول",
         "available_editions": "النسخ المتاحة",
         "seats_left": "مقاعد متبقية",
         "sold_out": "نفد",
         "membership_details": "تفاصيل العضوية:",
         "members": "أعضاء",
         "type": "النوع",
         "no_programs": "لا توجد برامج متاحة."
      },
      "events": {
         "title": "الحجوزات الحية",
         "book_seat": "احجز مقعد",
         "sold_out": "نفد",
         "seats": "مقاعد",
         "no_events": "لا توجد فعاليات حالياً.",
         "online_room": "غرفة أونلاين"
      },
      "cart": {
         "title": "عربة التسوق",
         "empty": "العربة فارغة.",
         "browse": "تصفح الكتالوج ←",
         "remove": "إزالة",
         "total": "الإجمالي",
         "order_total": "إجمالي الطلب",
         "checkout": "إتمام الدفع",
         "success": "تم إنشاء الطلب بنجاح!"
      },
      "dashboard": {
         "student_portal": "بوابة الطالب",
         "welcome": "مرحباً بعودتك",
         "active_courses": "دورات نشطة",
         "active_memberships": "عضويات نشطة",
         "membership_tiers": "فئات العضوية",
         "memberships": "عضوياتك",
         "no_memberships": "لا توجد عضويات مفعلة.",
         "active": "نشط",
         "purchased": "تاريخ الشراء",
         "my_learning": "مساحتي التعليمية",
         "learning_path": "مسارك التعليمي",
         "no_courses": "لم تقم بشراء دورات.",
         "progress": "مكتمل",
         "continue": "متابعة",
         "upcoming_events": "الفعاليات",
         "live_meetings": "اللقاءات المباشرة",
         "no_events": "لا توجد حجوزات."
      },
      "wishlist": {
         "title": "المفضلة",
         "login_required": "يرجى تسجيل الدخول.",
         "empty": "المفضلة فارغة.",
         "view": "عرض",
         "remove": "حذف"
      },
      "admin": {
         "portal": "بوابة الإدارة",
         "seed": "تعبئة البيانات التجريبية",
         "total_revenue": "إجمالي الإيرادات",
         "total_users": "إجمالي المستخدمين",
         "leads": "المهتمين / العملاء المحتملين",
         "course_purchases": "مبيعات الدورات",
         "membership_sales": "مبيعات العضويات",
         "event_bookings": "حجوزات الفعاليات",
         "chart_area": "منطقة الرسم البياني",
         "coming_soon": "قريباً"
      },
      "auth": {
         "email": "البريد الإلكتروني",
         "password": "كلمة المرور",
         "name": "الاسم كامل",
         "login": "دخول",
         "register": "حساب جديد",
         "no_account": "ليس لديك حساب؟",
         "have_account": "لديك حساب بالفعل؟"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "courses": "Courses",
        "memberships": "Memberships",
        "contact": "Contact",
        "dashboard": "Dashboard",
        "admin": "Admin",
        "cart": "Cart",
        "login": "Login",
        "register": "Register",
        "logout": "Logout"
      },
      "footer": {
         "about": "An educational platform offering the best courses.",
         "links": "Quick Links",
         "contact": "Contact Us",
         "rights": "All rights reserved",
         "about_title": "About"
      },
      "home": {
         "hero_title": "Learn and grow",
         "hero_subtitle": "The best educational platforms to elevate your level.",
         "get_started": "Get Started",
         "view_courses": "View Courses",
         "top_categories": "Top Categories",
         "featured_courses": "Featured Courses",
         "upcoming_events": "Events"
      },
      "courses": {
         "all_courses": "All Courses",
         "details": "Details",
         "course_content": "Course Content",
         "about_lesson": "About this lesson",
         "meet_instructor": "Meet Your Instructor",
         "feedback": "Feedback & Reviews",
         "your_rating": "Your rating",
         "submit_review": "Submit",
         "no_reviews": "There are no reviews yet.",
         "add_to_cart": "Add to Cart",
         "go_to_course": "Go to Course",
         "add_favorite": "Add to favorite",
         "remove_favorite": "Remove from favorites",
         "course_includes": "This course includes:",
         "learners": "Learners",
         "students": "Students",
         "lessons": "Lessons",
         "duration": "Duration",
         "language": "Language",
         "share": "Share",
         "report": "Report",
         "no_content": "No content available yet."
      },
      "memberships": {
         "title": "Programs & Memberships",
         "all_programs": "All Programs",
         "view_details": "View Details",
         "real_value": "Real Value:",
         "who_is_for": "Who Is This For?",
         "what_you_get": "What You Will Get",
         "entry_condition": "Entry Condition",
         "available_editions": "Available Editions",
         "seats_left": "Seats Left",
         "sold_out": "Sold Out",
         "membership_details": "Membership details:",
         "members": "Members",
         "type": "Type",
         "no_programs": "No programs available."
      },
      "events": {
         "title": "Live Bookings",
         "book_seat": "Book Seat",
         "sold_out": "Sold Out",
         "seats": "Seats",
         "no_events": "No events right now.",
         "online_room": "Online Room"
      },
      "cart": {
         "title": "Your Cart",
         "empty": "Cart is empty.",
         "browse": "Browse catalog ←",
         "remove": "Remove",
         "total": "Total",
         "order_total": "Order Total",
         "checkout": "Complete Checkout",
         "success": "Order placed successfully!"
      },
      "dashboard": {
         "student_portal": "Student Portal",
         "welcome": "Welcome back",
         "active_courses": "Active Courses",
         "active_memberships": "Active Memberships",
         "membership_tiers": "Membership Tiers",
         "memberships": "Membership Tiers",
         "no_memberships": "No active memberships.",
         "active": "Active",
         "purchased": "Purchased",
         "my_learning": "My Learning",
         "learning_path": "My Learning Path",
         "no_courses": "No courses purchased yet.",
         "progress": "Complete",
         "continue": "Continue",
         "upcoming_events": "Events",
         "live_meetings": "Live Meetings",
         "no_events": "No booked events."
      },
      "wishlist": {
         "title": "Your Wishlist",
         "login_required": "Please login to view your wishlist.",
         "empty": "No favorites yet.",
         "view": "View",
         "remove": "Remove"
      },
      "admin": {
         "portal": "Administration Portal",
         "seed": "Test Seed Data",
         "total_revenue": "Total Revenue",
         "total_users": "Total Users",
         "leads": "Interested Users / Leads",
         "course_purchases": "Course Purchases",
         "membership_sales": "Membership Sales",
         "event_bookings": "Event Bookings",
         "chart_area": "Chart Visualization Area",
         "coming_soon": "Coming Soon"
      },
      "auth": {
         "email": "Email Address",
         "password": "Password",
         "name": "Full Name",
         "login": "Login",
         "register": "Register",
         "no_account": "Don't have an account?",
         "have_account": "Already have an account?"
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "home": "Accueil",
        "courses": "Cours",
        "memberships": "Adhésions",
        "contact": "Contact",
        "dashboard": "Tableau de Bord",
        "admin": "Admin",
        "cart": "Panier",
        "login": "Connexion",
        "register": "S'inscrire",
        "logout": "Déconnexion"
      },
      "footer": {
         "about": "Une plateforme éducative offrant les meilleurs cours.",
         "links": "Liens Rapides",
         "contact": "Contactez-nous",
         "rights": "Tous droits réservés",
         "about_title": "À Propos"
      },
      "home": {
         "hero_title": "Apprenez et grandissez",
         "hero_subtitle": "Les meilleures plateformes éducatives pour élever votre niveau.",
         "get_started": "Commencer",
         "view_courses": "Voir les cours",
         "top_categories": "Top Catégories",
         "featured_courses": "Cours Vedettes",
         "upcoming_events": "Événements"
      },
      "courses": {
         "all_courses": "Tous les Cours",
         "details": "Détails",
         "course_content": "Contenu du cours",
         "about_lesson": "À propos de cette leçon",
         "meet_instructor": "Rencontrez votre instructeur",
         "feedback": "Commentaires et avis",
         "your_rating": "Votre note",
         "submit_review": "Soumettre",
         "no_reviews": "Il n'y a pas encore d'avis.",
         "add_to_cart": "Ajouter au panier",
         "go_to_course": "Aller au cours",
         "add_favorite": "Ajouter aux favoris",
         "remove_favorite": "Retirer des favoris",
         "course_includes": "Ce cours comprend :",
         "learners": "Apprenants",
         "students": "Étudiants",
         "lessons": "Leçons",
         "duration": "Durée",
         "language": "Langue",
         "share": "Partager",
         "report": "Signaler",
         "no_content": "Aucun contenu disponible pour le moment."
      },
      "memberships": {
         "title": "Programmes et Adhésions",
         "all_programs": "Tous les Programmes",
         "view_details": "Voir les détails",
         "real_value": "Valeur Réelle :",
         "who_is_for": "Pour qui est-ce ?",
         "what_you_get": "Ce que vous obtiendrez",
         "entry_condition": "Conditions d'entrée",
         "available_editions": "Éditions disponibles",
         "seats_left": "Places restantes",
         "sold_out": "Complet",
         "membership_details": "Détails de l'adhésion :",
         "members": "Membres",
         "type": "Type",
         "no_programs": "Aucun programme disponible."
      },
      "events": {
         "title": "Réservations en Direct",
         "book_seat": "Réserver une place",
         "sold_out": "Complet",
         "seats": "Places",
         "no_events": "Aucun événement pour le moment.",
         "online_room": "Salle en Ligne"
      },
      "cart": {
         "title": "Votre Panier",
         "empty": "Le panier est vide.",
         "browse": "Parcourir le catalogue ←",
         "remove": "Retirer",
         "total": "Total",
         "order_total": "Total de la commande",
         "checkout": "Terminer le paiement",
         "success": "Commande passée avec succès !"
      },
      "dashboard": {
         "student_portal": "Portail Étudiant",
         "welcome": "Bon retour",
         "active_courses": "Cours actifs",
         "active_memberships": "Adhésions actives",
         "membership_tiers": "Niveaux d'adhésion",
         "memberships": "Niveaux d'adhésion",
         "no_memberships": "Aucune adhésion active.",
         "active": "Actif",
         "purchased": "Acheté le",
         "my_learning": "Mon Apprentissage",
         "learning_path": "Mon parcours d'apprentissage",
         "no_courses": "Aucun cours acheté pour le moment.",
         "progress": "Terminé",
         "continue": "Continuer",
         "upcoming_events": "Événements",
         "live_meetings": "Réunions en direct",
         "no_events": "Aucun événement réservé."
      },
      "wishlist": {
         "title": "Votre Liste de Souhaits",
         "login_required": "Veuillez vous connecter pour voir votre liste de souhaits.",
         "empty": "Aucun favori pour le moment.",
         "view": "Voir",
         "remove": "Retirer"
      },
      "admin": {
         "portal": "Portail d'Administration",
         "seed": "Données de Test",
         "total_revenue": "Revenu Total",
         "total_users": "Utilisateurs Totaux",
         "leads": "Utilisateurs Intéressés",
         "course_purchases": "Achats de Cours",
         "membership_sales": "Ventes d'Adhésions",
         "event_bookings": "Réservations d'Événements",
         "chart_area": "Zone de Graphique",
         "coming_soon": "Bientôt Disponible"
      },
      "auth": {
         "email": "Adresse Email",
         "password": "Mot de passe",
         "name": "Nom complet",
         "login": "Se connecter",
         "register": "S'inscrire",
         "no_account": "Pas de compte ?",
         "have_account": "Vous avez déjà un compte ?"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: false,
    interpolation: {
      escapeValue: false, 
    }
  });

export default i18n;

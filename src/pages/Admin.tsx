import { useEffect, useState } from "react";
import { useStore } from "../store";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../lib/utils";
import { 
  LayoutDashboard, List, BookOpen, User, BookOpenText, CalendarDays, Star, Users, Mail, Languages, FileText, Settings, Image as ImageIcon, ShoppingCart, Activity, ShieldCheck, ExternalLink
} from "lucide-react";
import { 
  CourseManager, CourseBundlesManager, InstructorManager, EmailCampaignManager, EmailTemplatesManager, 
  SettingsManager, MembershipManager, LanguageManager, CategoryManager, PagesManager, PopupManager,
  SliderManager, EventManager, UserManager, ReviewManager, OrdersManager, TestimonialManager, BlogManager, LeadsManager, ReportManager, SeoManager, PaymentSetupManager, ManualPaymentApprovalManager, PushNotificationManager, PromoBadgeManager
} from "./AdminManagerComponents";
import { MaintenanceManager } from "./MaintenanceManager";

const menuGroups = [
  {
    title: "Overview",
    items: [
      { name: "DASHBOARD", icon: LayoutDashboard },
      { name: "REPORTS", icon: FileText },
      { name: "ALL ORDERS", icon: ShoppingCart },
      { name: "APPROVALS", icon: ShieldCheck },
    ]
  },
  {
    title: "Product",
    items: [
      { name: "CATEGORIES", icon: List },
      { name: "PROGRAMS", icon: BookOpen },
      { name: "PROGRAM BUNDLES", icon: BookOpen },
      { name: "MEMBERSHIPS", icon: BookOpenText },
      { name: "EVENTS", icon: CalendarDays },
    ]
  },
  {
    title: "People",
    items: [
      { name: "USERS", icon: Users },
      { name: "INSTRUCTORS", icon: User },
      { name: "LEADS", icon: Mail },
    ]
  },
  {
    title: "Marketing & Content",
    items: [
      { name: "SEO", icon: Activity },
      { name: "REVIEWS", icon: Star },
      { name: "TESTIMONIALS", icon: Star },
      { name: "BLOGS", icon: FileText },
      { name: "NOTIFICATIONS", icon: Mail },
      { name: "EMAILS", icon: Mail },
      { name: "PAGES", icon: FileText },
      { name: "SLIDERS", icon: ImageIcon },
      { name: "POPUP", icon: ImageIcon },
      { name: "PROMO BADGE", icon: Star },
    ]
  },
  {
    title: "System",
    items: [
      { name: "PAYMENTS", icon: ShoppingCart },
      { name: "LANGUAGES", icon: Languages },
      { name: "SETTINGS", icon: Settings },
      { name: "MAINTENANCE", icon: ShieldCheck },
    ]
  }
];

export function Admin() {
  const { user, currency, settings, token } = useStore();
  const navigate = useNavigate();

  const designSettingStr = settings?.find((s:any) => s.key === 'EMAIL_DESIGN')?.value;
  const design = designSettingStr ? JSON.parse(designSettingStr) : null;
  const logoUrl = design?.logoUrl || '';
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("DASHBOARD");
  const [stats, setStats] = useState({ 
    revenue: 0, 
    totalUsers: 0, 
    coursePurchases: 0,
    membershipPurchases: 0,
    eventTicketSales: 0,
    inquiries: 0,
    topCourses: [],
    topMemberships: [],
    topEvents: []
  });

  const fetchStats = (period = 'all') => {
      console.log("Fetching stats with token:", token, "and user:", user);
      fetch(`/api/admin/stats?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
           console.log("Stats API Response - Detailed:", data);
           if(data && !data.error) {
             setStats(prev => ({
                ...prev,
                ...data,
                topCourses: data.topCourses || [],
                topMemberships: data.topMemberships || [],
                topEvents: data.topEvents || []
             }));
           }
        })
        .catch(console.error);
  }

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
    } else {
      fetchStats();
    }
  }, [user, navigate]);

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col pt-6 pb-6 shadow-sm z-10 sticky top-0 md:h-screen overflow-y-auto hidden-scrollbar">
        <div className="px-6 mb-8 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="max-h-10 w-auto object-contain" />
          ) : (
            <>
              <div className="w-10 h-10 bg-indigo-600 outline outline-4 outline-indigo-50 rounded-xl flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-xl font-bold tracking-tight text-slate-900 leading-none">LMS.PRO</div>
                <div className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Admin Panel</div>
              </div>
            </>
          )}
        </div>
         <nav className="flex-1 space-y-6 px-4">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                  <button 
                    key={item.name} 
                    onClick={() => setActiveTab(item.name)}
                    className={`w-full text-left flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                    <span>{item.name.charAt(0) + item.name.slice(1).toLowerCase()}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                  </button>
                )})}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-4 border-b border-slate-200">
           <div>
             <h1 className="text-3xl font-bold text-slate-900">{activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}</h1>
             <p className="text-sm text-slate-500 mt-1">Manage and monitor your {activeTab.toLowerCase()} data.</p>
           </div>
           <div className="flex items-center gap-4">
             {activeTab !== "DASHBOARD" && (
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                  <Activity size={14} className="text-indigo-500" />
                  System is running smoothly
                </div>
             )}
             <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-bold transition-all shadow-sm">
                <ExternalLink size={16} />
                Back to Website
             </Link>
           </div>
        </header>

        {activeTab === "DASHBOARD" && (
          <div className="space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Dashboard Metrics</h2>
            <select className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm" onChange={(e) => fetchStats(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="weekly">This Week</option>
                <option value="monthly">This Month</option>
                <option value="6months">Last 6 Months</option>
                <option value="yearly">Last Year</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               {title: t('admin.total_revenue'), value: formatCurrency(stats.revenue, currency), label: "Lifetime earnings"},
               {title: t('admin.total_users'), value: stats.totalUsers, label: "Registered accounts"},
               {title: t('admin.leads'), value: stats.inquiries, label: "Contact requests"},
               {title: t('admin.course_purchases'), value: stats.coursePurchases, label: "Total programs sold"},
               {title: t('admin.membership_sales'), value: stats.membershipPurchases, label: "Total memberships sold"},
               {title: t('admin.event_bookings'), value: stats.eventTicketSales, label: "Total event tickets"},
             ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{stat.title}</span>
                  <span className="text-3xl font-black text-slate-900 mb-2">{stat.value}</span>
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
             ))}
          </div>
          
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
              <Activity size={48} className="mb-4 text-indigo-200" />
              <span className="text-lg font-bold text-slate-900">{t('admin.chart_area', 'Analytics Overview')}</span>
              <span className="text-sm text-slate-500 mt-2">{t('admin.coming_soon', 'Detailed reporting is coming in the next update')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                  { title: 'Top Programs', data: stats.topCourses, key: 'title' },
                  { title: 'Top Memberships', data: stats.topMemberships, key: 'label' },
                  { title: 'Top Events', data: stats.topEvents, key: 'title' }
              ].map((section, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                      <h3 className="font-bold text-slate-900 mb-4">{section.title}</h3>
                      <div className="space-y-3">
                          {section.data.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="truncate font-medium text-slate-700">{item[section.key]}</span>
                                  <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-xs">{item.count}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
          </div>
        )}

        {activeTab === "ALL ORDERS" && <OrdersManager />}
        {activeTab === "REPORTS" && <ReportManager />}
        {activeTab === "SEO" && <SeoManager />}
        {activeTab === "CATEGORIES" && <CategoryManager />}
        {activeTab === "PROGRAMS" && <CourseManager />}
        {activeTab === "PROGRAM BUNDLES" && <CourseBundlesManager />}
        {activeTab === "INSTRUCTORS" && <InstructorManager />}
        {activeTab === "MEMBERSHIPS" && <MembershipManager />}
        {activeTab === "REVIEWS" && <ReviewManager />}
        {activeTab === "TESTIMONIALS" && <TestimonialManager />}
        {activeTab === "BLOGS" && <BlogManager />}
        {activeTab === "LEADS" && <LeadsManager />}
        {activeTab === "NOTIFICATIONS" && <PushNotificationManager />}
        {activeTab === "EMAILS" && (
           <div className="flex flex-col gap-8 md:flex-row md:items-start">
             <div className="flex-1"><EmailCampaignManager /></div>
             <div className="flex-1"><EmailTemplatesManager /></div>
           </div>
        )}
        {activeTab === "LANGUAGES" && <LanguageManager />}
        {activeTab === "PAGES" && <PagesManager />}
        {activeTab === "SLIDERS" && <SliderManager />}
        {activeTab === "POPUP" && <PopupManager />}
        {activeTab === "PROMO BADGE" && <PromoBadgeManager />}
        {activeTab === "PAYMENTS" && <PaymentSetupManager />}
        {activeTab === "APPROVALS" && <ManualPaymentApprovalManager />}
         {activeTab === "SETTINGS" && <SettingsManager />}
         {activeTab === "EVENTS" && <EventManager />}
         {activeTab === "USERS" && <UserManager />}
         {activeTab === "MAINTENANCE" && <MaintenanceManager />}
      </main>
    </div>
  );
}

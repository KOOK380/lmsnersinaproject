import { BookOpen, Video, Users, CheckCircle2, XCircle, ArrowRight, PlayCircle, ExternalLink, CalendarDays, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore, getTranslated } from "../store";
import { formatCurrency } from "../lib/utils";
import ReactPlayer from "react-player";
import { UniversalVideo } from "../components/UniversalVideo";
import { MediaInput } from "../components/MediaInput";
import { AlertTriangle } from "lucide-react";

export function Cart() {
  const { cart, removeFromCart, clearCart, getCartTotal, user, currency, settings } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const stripeSetting = settings?.find((s:any) => s.key === 'STRIPE_CONFIG')?.value;
  const manualSetting = settings?.find((s:any) => s.key === 'MANUAL_PAYMENT_CONFIG')?.value;
  
  const stripeConfig = stripeSetting ? JSON.parse(stripeSetting) : null;
  const manualConfig = manualSetting ? JSON.parse(manualSetting) : null;
  
  const isStripeEnabled = !!stripeConfig?.enabled;
  const isManualEnabled = !!manualConfig?.enabled;
  
  const [selectedPayment, setSelectedPayment] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');

  useEffect(() => {
    if (!selectedPayment) {
      if (isStripeEnabled) {
        setSelectedPayment('STRIPE');
      } else if (isManualEnabled) {
        setSelectedPayment('MANUAL');
      }
    }
  }, [isStripeEnabled, isManualEnabled, selectedPayment]);

  const [showCheckout, setShowCheckout] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login");
    if (cart.length === 0) return;

    const token = localStorage.getItem("token");
    const total = getCartTotal();
    
    if (total > 0 && selectedPayment === 'MANUAL' && !paymentProofUrl && manualConfig?.instructions) {
      if(!window.confirm("You have not uploaded a payment receipt. Continue anyway?")) return;
    }

    setIsSubmitting(true);

    if (total > 0 && selectedPayment === 'STRIPE') {
      try {
        const stripeRes = await fetch("/api/stripe/create-checkout-session", {
           method: "POST",
           headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
           body: JSON.stringify({
              items: cart,
              successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
              cancelUrl: `${window.location.origin}/cart`
           })
        });

        if (stripeRes.ok) {
           const data = await stripeRes.json();
           if (data.url) {
              window.location.href = data.url;
              return;
           }
        } else {
           const errData = await stripeRes.json();
           alert(errData.error || "Stripe checkout failed");
           setIsSubmitting(false);
           return;
        }
      } catch (err) {
        alert("Error initiating Stripe payment");
        setIsSubmitting(false);
        return;
      }
    }

    // Manual or Free Checkout
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        total: getCartTotal(),
        billingDetails: JSON.stringify(billingDetails),
        paymentMethod: selectedPayment,
        paymentProofUrl: selectedPayment === 'MANUAL' ? paymentProofUrl : null
      })
    });

    setIsSubmitting(false);
    if (res.ok) {
      clearCart();
      alert(selectedPayment === 'MANUAL' && total > 0 ? "Order placed! It is pending admin approval." : "Order placed successfully!");
      navigate("/dashboard");
    } else {
      const data = await res.json();
      alert(data.error || "Checkout failed.");
    }
  };

  if (showCheckout) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="editorial-divider mb-8 pt-4">
            <h1 className="text-3xl font-bold font-serif italic text-primary">{t('cart.checkout_title', 'Checkout')}</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 order-2 md:order-1">
               <h2 className="text-xl font-bold mb-6 text-slate-800">{t('cart.billing_address', 'Billing Address')}</h2>
               <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('cart.full_name', 'Full Name')}</label>
                  <input required type="text" value={billingDetails.fullName} onChange={e => setBillingDetails({...billingDetails, fullName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">{t('cart.address', 'Address')}</label>
                  <input required type="text" value={billingDetails.address} onChange={e => setBillingDetails({...billingDetails, address: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('cart.city', 'City')}</label>
                    <input required type="text" value={billingDetails.city} onChange={e => setBillingDetails({...billingDetails, city: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('cart.state', 'State')}</label>
                    <input required type="text" value={billingDetails.state} onChange={e => setBillingDetails({...billingDetails, state: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('cart.zip', 'Zip Code')}</label>
                    <input required type="text" value={billingDetails.zip} onChange={e => setBillingDetails({...billingDetails, zip: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('cart.country', 'Country')}</label>
                    <input required type="text" value={billingDetails.country} onChange={e => setBillingDetails({...billingDetails, country: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                
                {getCartTotal() > 0 && (
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">{t('cart.payment_method', 'Payment Method')}</h3>
                    <div className="space-y-3">
                      {isStripeEnabled && (
                        <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${selectedPayment === 'STRIPE' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="paymentMethod" value="STRIPE" checked={selectedPayment === 'STRIPE'} onChange={() => setSelectedPayment('STRIPE')} className="w-4 h-4 accent-primary" />
                            <span className="font-bold text-slate-800">Credit / Debit Card (Online)</span>
                          </div>
                        </label>
                      )}
                      {isManualEnabled && (
                        <label className={`block border rounded-xl p-4 cursor-pointer transition-all ${selectedPayment === 'MANUAL' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="paymentMethod" value="MANUAL" checked={selectedPayment === 'MANUAL'} onChange={() => setSelectedPayment('MANUAL')} className="w-4 h-4 accent-primary" />
                            <span className="font-bold text-slate-800">Manual Payment (Bank Transfer)</span>
                          </div>
                        </label>
                      )}
                    </div>
                    
                    {selectedPayment === 'MANUAL' && manualConfig && (
                       <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm">
                         <p className="font-bold text-amber-800 mb-2">Instructions:</p>
                         <p className="text-amber-900 whitespace-pre-wrap mb-4">{manualConfig.instructions}</p>
                         {manualConfig.bankDetails && (
                           <div className="bg-white p-3 rounded border border-amber-100 mb-4 whitespace-pre-wrap font-mono text-xs text-slate-700">
                             {manualConfig.bankDetails}
                           </div>
                         )}
                         {manualConfig.qrCodeUrl && (
                           <div className="mb-4">
                             <img src={manualConfig.qrCodeUrl} alt="QR Code" className="max-w-[150px] rounded shadow-sm border border-slate-200" />
                           </div>
                         )}
                         <div>
                           <label className="block text-xs font-bold text-amber-900 mb-1">Upload Payment Proof (Receipt/Screenshot)</label>
                           <div className="bg-white rounded">
                              <MediaInput label="Receipt" type="image" value={paymentProofUrl} onChange={v => setPaymentProofUrl(v)} />
                           </div>
                         </div>
                       </div>
                    )}
                  </div>
                )}
                
                <div className="pt-6 mt-6 flex gap-4">
                   <button type="button" onClick={() => setShowCheckout(false)} className="px-6 py-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex-1">{t('cart.back_to_cart', 'Back to Cart')}</button>
                   <button type="submit" disabled={isSubmitting} className="px-6 py-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark transition flex-1 disabled:opacity-70">
                     {isSubmitting ? t('cart.processing', 'Processing...') : (getCartTotal() === 0 ? t('cart.complete_enrollment', 'Complete Enrollment') : t('cart.place_order', 'Place Order'))}
                   </button>
                </div>
             </form>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-fit order-1 md:order-2">
             <h3 className="font-bold text-lg mb-4 text-slate-800">{t('cart.order_summary', 'Order Summary')}</h3>
             <div className="space-y-3 mb-6">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between items-center text-sm">
                   <span className="text-slate-600 truncate mr-4">{item.title}</span>
                   <span className="font-bold shrink-0">{formatCurrency(item.price, currency)}</span>
                 </div>
               ))}
             </div>
             <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
               <span className="font-bold text-lg">{t('cart.total', 'Total')}</span>
               <span className="font-bold text-2xl text-primary">{formatCurrency(getCartTotal(), currency)}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Place Order Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">{t('cart.total', 'Total')}</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(getCartTotal(), currency)}</p>
         </div>
         <div className="flex items-center gap-2">
           <button type="button" onClick={() => setShowCheckout(false)} className="px-4 py-3 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition">{t('cart.back', 'Back')}</button>
           <button type="submit" form="checkout-form" disabled={isSubmitting} className="bg-primary text-white px-6 py-3 rounded-xl font-bold tracking-wide shadow-sm hover:bg-primary-dark transition disabled:opacity-70 flex items-center justify-center min-w-[120px]">
              {isSubmitting ? t('cart.processing', 'Processing...') : (getCartTotal() === 0 ? t('cart.complete_enrollment', 'Complete Enrollment') : t('cart.place_order', 'Place Order'))}
           </button>
         </div>
      </div>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="editorial-divider mb-8 pt-4">
        <h1 className="text-3xl font-bold font-serif italic text-primary">{t('cart.title')}</h1>
      </div>
      {cart.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-serif italic border border-slate-200 rounded-xl bg-white shadow-sm">
          {t('cart.empty')} <Link to="/courses" className="text-primary hover:underline font-sans not-italic font-bold text-sm ml-2">{t('cart.browse')} &rarr;</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="space-y-4 mb-8">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 border-b border-slate-100">
                <div>
                  <div className="text-[10px] text-primary/40 font-bold uppercase tracking-widest mb-1">{item.itemType}</div>
                  <div className="font-bold text-base sm:text-lg text-ink line-clamp-2 md:line-clamp-none">{item.title}</div>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-6">
                  <div className="font-bold text-lg text-primary">{formatCurrency(item.price, currency)}</div>
                  <button onClick={() => removeFromCart(item.id)} className="text-xs text-slate-400 hover:text-red-500 transition font-bold uppercase tracking-wider">{t('cart.remove')}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 mb-8 text-xl border-t-2 border-primary">
            <div className="font-serif italic text-primary font-bold">{t('cart.total')}</div>
            <div className="font-bold text-2xl">{formatCurrency(getCartTotal(), currency)}</div>
          </div>
          <div className="block">
            <button onClick={() => { if(!user) { return alert("Please login to checkout"); }; setShowCheckout(true); }} className="w-full text-xs font-bold uppercase tracking-wider bg-primary text-white py-4 rounded-xl shadow-sm hover:bg-primary-dark transition">
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      )}

      {/* Floating Checkout Button for Mobile */}
      {cart.length > 0 && !showCheckout && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">{t('cart.total')}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(getCartTotal(), currency)}</p>
           </div>
           <button onClick={() => { if(!user) { return alert("Please login to checkout"); }; setShowCheckout(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold tracking-wide shadow-sm hover:bg-primary-dark transition">
              {t('cart.checkout')}
           </button>
        </div>
      )}
    </div>
  );
}









export function Dashboard() {
  const { user, clearCart, language } = useStore();
  const [data, setData] = useState<{courses: any[], memberships: any[], bookings: any[], meetings: any[], rejectedOrders?: any[]}>({ courses: [], memberships: [], bookings: [], meetings: [], rejectedOrders: [] });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    const token = localStorage.getItem("token");

    const sessionId = searchParams.get('session_id');
    if (sessionId && token) {
      fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ sessionId })
      })
      .then(r => r.json())
      .then(res => {
         if (res.success) {
           clearCart();
           searchParams.delete('session_id');
           setSearchParams(searchParams);
           fetchDashboardData(token);
         }
      })
      .catch(console.error);
    } else {
      fetchDashboardData(token);
    }

    function fetchDashboardData(t: string | null) {
      fetch("/api/dashboard", { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then(res => {
           if(!res.error) setData(res);
         });
    }
  }, [user, navigate, searchParams]);

  const handleCancelSubscription = async (subscriptionId: string) => {
      const token = localStorage.getItem('token');
      if (!confirm('Are you sure you want to cancel the autopayment? You will not be billed again, but you will retain access until the end of the current billing cycle.')) return;
      try {
          const res = await fetch('/api/stripe/cancel-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ subscriptionId })
          });
          const result = await res.json();
          if (result.success) {
              alert('Autopayment cancelled successfully.');
              setData((prev: any) => ({
                 ...prev,
                 courses: prev.courses.map((c: any) => c.stripeSubscriptionId === subscriptionId ? { ...c, stripeSubscriptionId: null } : c),
                 memberships: prev.memberships.map((m: any) => m.stripeSubscriptionId === subscriptionId ? { ...m, stripeSubscriptionId: null } : m)
              }));
          } else {
              alert(result.error || 'Failed to cancel subscription.');
          }
      } catch (err) {
          alert('Error cancelling subscription');
      }
  };

  if (!user) return null;

  const allCommunityLinks: any[] = [];
  data.courses.forEach(c => {
     if (c.course.telegramLink || c.course.whatsappLink || c.course.customExternalLink || c.course.meetingLink) {
         allCommunityLinks.push({ ...c.course, sourceName: c.course.title, sourceType: 'Program', id: c.course.id });
     }
  });
  data.memberships.forEach(m => {
     if (m.membership.telegramLink || m.membership.whatsappLink || m.membership.customExternalLink || m.membership.meetingLink) {
         const content = m.membership.contents?.find((c:any) => c.language === language) || m.membership.contents?.[0] || { title: m.membership.label || 'Membership' };
         allCommunityLinks.push({ ...m.membership, sourceName: content.title, sourceType: 'Membership', id: m.membership.id });
     }
  });
  const uniqueCommunityLinks = Array.from(new Map(allCommunityLinks.map(item => [item.id, item])).values());

  const getTranslated = (item: any, lang: string) => {
    if (!item) return null;
    const translation = item.translations?.find((t: any) => t.languageCode === lang);
    return translation ? { ...item, ...translation } : item;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
         <div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">{t('dashboard.welcome')}, {user.name.split(' ')[0]} 👋</h1>
             <p className="text-slate-500 font-medium text-lg">{t('dashboard.subtitle', 'Pick up where you left off or join the conversation.')}</p>
         </div>
         <div className="flex gap-4">
             <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                 <span className="text-3xl font-black text-primary leading-none mb-1">{data.courses.length}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t('dashboard.active_courses', 'Active Programs')}</span>
             </div>
             {data.memberships.length > 0 && (
                 <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                     <span className="text-3xl font-black text-emerald-600 leading-none mb-1">{data.memberships.length}</span>
                     <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t('dashboard.memberships', 'Memberships')}</span>
                 </div>
             )}
             <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                 <span className="text-3xl font-black text-blue-600 leading-none mb-1">{data.bookings.length}</span>
                 <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t('dashboard.upcoming_events', 'Upcoming Events')}</span>
             </div>
         </div>
      </div>

      {data.rejectedOrders && data.rejectedOrders.length > 0 && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 font-serif italic mb-1">{t('dashboard.rejections', 'Manual Payment Rejections')}</h3>
              <p className="text-xs text-red-700 font-sans mb-4">
                {t('dashboard.rejection_msg', 'The verification of your manual bank transfer payment has failed. Please check the reason below or contact support.')}
              </p>
              <div className="space-y-4">
                {data.rejectedOrders.map((order: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white border border-red-100 rounded-xl shadow-sm">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID: {order.id.slice(-8).toUpperCase()}</span>
                        <div className="text-sm font-bold text-slate-800">
                          {order.items.map((it: any) => `${it.itemName}`).join(", ")}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">{t('dashboard.total_price', 'Total Price')}</span>
                        <span className="text-xs font-bold text-red-600">${order.total}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-red-50/40 rounded-lg border border-red-50 text-xs text-red-800 font-medium">
                      <span className="font-bold text-red-900 block mb-1 uppercase text-[9px] tracking-widest">{t('dashboard.rejection_reason', 'Rejection Reason:')}</span>
                      {order.rejectReason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-12">
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" /> {t('dashboard.my_learning', 'My Programs')}
                    </h2>
                 </div>
                 
                 {data.courses.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                            <BookOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-lg mb-2">{t('dashboard.no_courses', "You haven't enrolled in any programs yet.")}</p>
                        <Link to="/courses" className="text-primary font-bold hover:underline">{t('courses.all_courses', 'Explore Programs')} &rarr;</Link>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {data.courses.map((c, i) => {
                          const isPending = !!c.isPending;
                          const isExpired = !isPending && c.expiresAt && new Date(c.expiresAt) < new Date();
                          const courseContent = getTranslated(c.course, language);
                          const enablePlatform = c.course.enablePlatformContent ?? true;

                          return (
                            <div key={i} className={`flex flex-col bg-white border-2 rounded-2xl overflow-hidden transition-all ${isPending ? 'border-amber-200 bg-amber-50/30' : isExpired ? 'border-slate-200 opacity-60' : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'}`}>
                               <div className="h-40 bg-slate-100 relative">
                                  {c.course.imageUrl ? (
                                      <img src={c.course.imageUrl} alt={courseContent.title} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/20">
                                          <Video className="w-12 h-12" />
                                      </div>
                                  )}
                                  <div className="absolute top-4 left-4 flex gap-2">
                                     {isPending ? (
                                         <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-amber-200/50">{t('dashboard.pending', 'Pending')}</span>
                                     ) : isExpired ? (
                                         <span className="bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-red-200/50">{t('dashboard.expired', 'Expired')}</span>
                                     ) : (
                                         <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-emerald-200/50 flex items-center gap-1">
                                             <CheckCircle2 className="w-3 h-3" /> {t('dashboard.active', 'Active')}
                                         </span>
                                     )}
                                     {!enablePlatform && (
                                         <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border border-blue-200/50 flex items-center gap-1">
                                             <Users className="w-3 h-3" /> {t('dashboard.community', 'Community')}
                                         </span>
                                     )}
                                  </div>
                               </div>
                               <div className="p-6 flex-1 flex flex-col">
                                  <h3 className="font-black text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{courseContent.title}</h3>
                                  
                                  {enablePlatform && !isPending && !(c.course.telegramLink || c.course.whatsappLink || c.course.customExternalLink || c.course.meetingLink) && (c.course._count?.lessons ?? 0) > 0 && (
                                     <div className="mb-6 mt-auto pt-4">
                                         <div className="flex justify-between items-end mb-2">
                                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.progress', 'Progress')}</span>
                                             <span className="text-sm font-black text-slate-900">{c.progress}%</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                                            <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${c.progress}%` }}></div>
                                         </div>
                                     </div>
                                  )}

                                  <div className="mt-auto pt-4 flex flex-col gap-3">
                                      {c.stripeSubscriptionId && !isExpired && (
                                          <button onClick={() => handleCancelSubscription(c.stripeSubscriptionId)} className="text-[10px] font-bold text-red-500 hover:text-red-700 underline capitalize text-center mb-1">
                                            {t('dashboard.cancel_auto', 'Cancel Autopayment')}
                                          </button>
                                      )}
                                      
                                      {isPending ? (
                                          <button disabled className="w-full py-3 px-4 bg-amber-100 text-amber-800 font-bold text-sm rounded-xl border border-amber-200 opacity-70 cursor-not-allowed">
                                              {t('dashboard.verifying', 'Verifying Payment...')}
                                          </button>
                                      ) : isExpired ? (
                                          <button disabled className="w-full py-3 px-4 bg-slate-100 text-slate-500 font-bold text-sm rounded-xl border border-slate-200 opacity-70 cursor-not-allowed">
                                              {t('dashboard.access_expired', 'Access Expired')}
                                          </button>
                                      ) : enablePlatform && (c.course._count?.lessons ?? 0) > 0 ? (
                                          <Link to={`/courses/${c.course.id}/player`} className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                                              <PlayCircle className="w-4 h-4" /> {t('dashboard.continue', 'Continue Learning')}
                                          </Link>
                                      ) : (
                                          <div className="flex gap-2 flex-wrap">
                                              {c.course.telegramLink && (
                                                  <a href={c.course.telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                                                      {t('dashboard.join_telegram', 'Join Telegram')}
                                                  </a>
                                              )}
                                              {c.course.whatsappLink && (
                                                  <a href={c.course.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                                                      {t('dashboard.join_whatsapp', 'Join WhatsApp')}
                                                  </a>
                                              )}
                                              {!c.course.telegramLink && !c.course.whatsappLink && (c.course.customExternalLink || c.course.meetingLink) && (
                                                  <a href={c.course.customExternalLink || c.course.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                                                      <ExternalLink className="w-4 h-4" /> {t('dashboard.open_link', 'Open Link')}
                                                  </a>
                                              )}
                                              {!c.course.telegramLink && !c.course.whatsappLink && !c.course.customExternalLink && !c.course.meetingLink && (
                                                  <button disabled className="w-full py-3 px-4 bg-slate-50 text-slate-400 font-bold text-sm rounded-xl border border-slate-100 cursor-not-allowed">
                                                      {t('dashboard.community_groups', 'Community & Groups')}
                                                  </button>
                                              )}
                                          </div>
                                      )}
                                  </div>
                               </div>
                            </div>
                          );
                       })}
                    </div>
                 )}
              </section>

              {uniqueCommunityLinks.length > 0 && (
                  <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" /> {t('dashboard.community_groups', 'Community & Groups')}
                        </h2>
                      </div>
                      <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100">
                          {uniqueCommunityLinks.map((item, idx) => (
                              <div key={idx} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                                          <Users className="w-6 h-6 text-blue-600" />
                                      </div>
                                      <div>
                                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1 block">Via {item.sourceType}</span>
                                          <h3 className="font-bold text-lg text-slate-900 leading-tight">{item.sourceName} Community</h3>
                                      </div>
                                  </div>
                                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                      {item.telegramLink && (
                                          <a href={item.telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none py-2.5 px-6 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold text-sm rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                              Telegram
                                          </a>
                                      )}
                                      {item.whatsappLink && (
                                          <a href={item.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none py-2.5 px-6 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-sm rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                              WhatsApp
                                          </a>
                                      )}
                                      {item.meetingLink && (
                                          <a href={item.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none py-2.5 px-6 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                              Live Link
                                          </a>
                                      )}
                                      {item.customExternalLink && (
                                          <a href={item.customExternalLink} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none py-2.5 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                              Open Link
                                          </a>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </section>
              )}
          </div>

          <div className="xl:col-span-1 space-y-10">
              <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('dashboard.active_memberships', 'Active Memberships')}</h2>
                  </div>
                  
                  {data.memberships.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                          <p className="text-slate-500 font-medium text-sm">{t('dashboard.no_memberships', 'No active memberships.')}</p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {data.memberships.map((m, i) => {
                             const isPending = !!m.isPending;
                             const isExpired = !isPending && m.expiresAt && new Date(m.expiresAt) < new Date();
                             const content = m.membership.contents?.find((c:any) => c.language === language) || m.membership.contents?.[0] || { title: m.membership.label || 'Membership' };
                             
                             return (
                                 <div key={i} className={`p-5 rounded-2xl border-2 transition-all ${isPending ? 'border-amber-200 bg-amber-50' : isExpired ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'}`}>
                                     <div className="flex items-center gap-4 mb-4">
                                         {m.membership.imageUrl ? (
                                             <img src={m.membership.imageUrl} alt={content.title} className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100" />
                                         ) : (
                                             <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl shrink-0">
                                                 {content.title?.charAt(0)}
                                             </div>
                                         )}
                                         <div>
                                             <h4 className="font-bold text-slate-900 leading-tight">{content.title}</h4>
                                             {isPending ? (
                                                 <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 block">{t('dashboard.pending_verification', 'Pending Verification')}</span>
                                             ) : isExpired ? (
                                                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 block">{t('dashboard.expired', 'Expired')}</span>
                                             ) : (
                                                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1 block flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active</span>
                                             )}
                                         </div>
                                     </div>
                                     <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                         <div className="text-xs font-medium text-slate-500">
                                            {m.expiresAt ? `Renews ${new Date(m.expiresAt).toLocaleDateString()}` : 'Lifetime Access'}
                                         </div>
                                         {m.stripeSubscriptionId && !isExpired && (
                                            <button onClick={() => handleCancelSubscription(m.stripeSubscriptionId)} className="text-[10px] font-bold text-slate-400 hover:text-red-600 underline">
                                                Cancel Auto-renew
                                            </button>
                                         )}
                                     </div>
                                     {(!isExpired && !isPending && (m.membership.telegramLink || m.membership.whatsappLink || m.membership.meetingLink || m.membership.customExternalLink)) && (
                                         <div className="pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
                                             {m.membership.telegramLink && (
                                                 <a href={m.membership.telegramLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 px-3 bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold text-xs rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                                     Telegram
                                                 </a>
                                             )}
                                             {m.membership.whatsappLink && (
                                                 <a href={m.membership.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-xs rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                                     WhatsApp
                                                 </a>
                                             )}
                                             {!m.membership.telegramLink && !m.membership.whatsappLink && (m.membership.customExternalLink || m.membership.meetingLink) && (
                                                 <a href={m.membership.customExternalLink || m.membership.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full py-2 px-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-lg flex items-center justify-center transition-transform active:scale-95 shadow-sm">
                                                     Open Link
                                                 </a>
                                             )}
                                         </div>
                                     )}
                                 </div>
                             )
                          })}
                      </div>
                  )}
              </section>

              {data.bookings.length > 0 && (
                  <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-indigo-600" /> Live Events
                        </h2>
                      </div>
                      <div className="space-y-4">
                          {data.bookings.map((b, i) => {
                                const d = new Date(b.event.date);
                                return (
                                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl flex gap-4 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer group">
                                        <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">{d.toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-black text-indigo-900 leading-none">{d.getDate()}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate mb-1 group-hover:text-indigo-600 transition-colors">{b.event.title}</h4>
                                            <p className="text-xs font-medium text-slate-500 truncate">{d.toLocaleTimeString([], {timeStyle: 'short'})} • {b.event.location}</p>
                                        </div>
                                    </div>
                                )
                          })}
                      </div>
                  </section>
              )}
          </div>
      </div>
    </div>
  );
}


export function CoursePlayer() {
   const { id } = useParams();
   const [courseRaw, setCourse] = useState<any>(null);
   const [activeLesson, setActiveLesson] = useState<any>(null);
   const { t } = useTranslation();
   const { language } = useStore();

   useEffect(() => {
     fetch(`/api/courses/${id}`).then(r => r.json()).then(data => {
       setCourse(data);
       if (data && data.lessons && data.lessons.length > 0) {
         setActiveLesson(data.lessons[0]);
       }
     });
   }, [id]);

   const course = getTranslated(courseRaw, language);

   if (!course) return <div className="p-12 text-center text-slate-500">Loading program player...</div>;

   if (courseRaw?.enablePlatformContent === false) {
      return (
        <div className="p-12 max-w-2xl mx-auto text-center">
           <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Users className="w-10 h-10" />
           </div>
           <h1 className="text-2xl font-black mb-4">Platform Learning Content Disabled</h1>
           <p className="text-slate-500 mb-8">This program is delivered entirely via external communities or live sessions.</p>
           <div className="flex gap-4 justify-center flex-wrap">
                {courseRaw.telegramLink && (
                    <a href={courseRaw.telegramLink} target="_blank" rel="noopener noreferrer" className="py-3 px-6 bg-[#2AABEE] text-white font-bold rounded-md shadow-sm">
                        Join Telegram
                    </a>
                )}
                {courseRaw.whatsappLink && (
                    <a href={courseRaw.whatsappLink} target="_blank" rel="noopener noreferrer" className="py-3 px-6 bg-[#25D366] text-white font-bold rounded-md shadow-sm">
                        Join WhatsApp
                    </a>
                )}
                {!courseRaw.telegramLink && !courseRaw.whatsappLink && (courseRaw.customExternalLink || courseRaw.meetingLink) && (
                    <a href={courseRaw.customExternalLink || courseRaw.meetingLink} target="_blank" rel="noopener noreferrer" className="py-3 px-6 bg-blue-600 text-white font-bold rounded-md shadow-sm">
                        Open Link
                    </a>
                )}
           </div>
        </div>
      );
   }

   return (
      <div className="flex flex-col md:flex-row md:h-[calc(100vh-64px)] md:overflow-hidden bg-slate-50">
         <div className="flex-1 bg-white flex flex-col relative md:overflow-y-auto w-full md:max-h-full">
            <div className="w-full bg-black relative flex items-center justify-center shrink-0 border-b border-slate-200" style={{ aspectRatio: '16/9' }}>
               {activeLesson?.videoUrl ? (
                 <UniversalVideo url={activeLesson.videoUrl} />
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-slate-400">
                    <p>{t('courses.no_content')}</p>
                 </div>
               )}
            </div>
            
            <div className="bg-white p-6 shrink-0 md:p-10 flex-1">
               <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">{activeLesson?.title || course.title}</h2>
               {activeLesson?.content && (
                  <div className="prose prose-slate max-w-none mb-8" dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
               )}
               {activeLesson?.showAboutCourse !== false && (
                 <div className="border-t border-slate-200 pt-8 mt-4">
                   <h3 className="text-xl font-bold mb-4 text-slate-900">{t('courses.about_lesson')}</h3>
                   <div 
                     className="text-slate-600 prose prose-sm max-w-none prose-p:leading-relaxed" 
                     dangerouslySetInnerHTML={{ __html: activeLesson?.description || course.description }} 
                   />
                   
                   <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {course.instructor && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                           {course.instructor.imageUrl ? (
                              <img src={course.instructor.imageUrl} alt={course.instructor.name} className="w-12 h-12 rounded-full object-cover" />
                           ) : (
                              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                 {course.instructor.name.charAt(0)}
                              </div>
                           )}
                           <div>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{t('courses.instructor')}</p>
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">{course.instructor.name}</p>
                           </div>
                        </div>
                      )}
                   </div>
                 </div>
               )}
            </div>
         </div>
         
         <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 bg-white border-t md:border-t-0 md:border-l border-slate-200 md:overflow-y-auto flex flex-col md:h-auto pb-8 md:pb-0">
            <div className="p-5 bg-white border-b border-slate-200 font-bold text-lg sticky top-0 z-10 shadow-sm flex items-center justify-between">
              <span>{t('courses.course_content')}</span>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{course?.lessons?.length || 0} {t('courses.lessons')}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-12">
                {course.lessons?.map((lesson: any, i: number) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <button 
                       key={lesson.id} 
                       onClick={() => setActiveLesson(lesson)}
                       className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all duration-200 border ${isActive ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                       <div className={`mt-0.5 w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                         {i + 1}
                       </div>
                       <div>
                         <h4 className={`font-bold text-sm line-clamp-2 ${isActive ? 'text-primary' : 'text-slate-700'}`}>{lesson.title}</h4>
                         {lesson.duration && <p className="text-xs text-slate-500 mt-1 font-medium">{lesson.duration}</p>}
                       </div>
                    </button>
                  );
                })}
                {(!course.lessons || course.lessons.length === 0) && (
                   <div className="p-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-100 italic">
                      No lessons found for this program.
                   </div>
                )}
            </div>
         </div>
      </div>
   );
}

export function Wishlist() {
  const { user, token, favorites, toggleFavorite, currency } = useStore();
  const [items, setItems] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!user || !token) return;
    const fetchItems = async () => {
       const res = await fetch("/api/courses/active");
       const courses = await res.json();
       const mRes = await fetch("/api/memberships");
       const memberships = await mRes.json();
       
       const all = favorites.map(f => {
         if (f.itemType === 'COURSE') {
            const item = courses.find((c: any) => c.id === f.itemId);
            return { ...f, item, ...item };
         } else if (f.itemType === 'MEMBERSHIP') {
            const item = memberships.find((m: any) => m.id === f.itemId);
            const title = item?.contents?.[0]?.title || 'Membership';
            return { ...f, item, title, price: item?.offerPrice, isMembership: true };
         }
         return f;
       }).filter(f => f.item);
       setItems(all);
    };
    fetchItems();
  }, [user, token, favorites]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="editorial-divider mb-8 pt-4">
        <h1 className="text-3xl font-bold font-serif italic text-primary">{t('wishlist.title')}</h1>
      </div>
      {(!user) ? (
        <div className="text-center py-12 text-gray-500">{t('wishlist.login_prompt')}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-serif italic border border-slate-200 rounded-xl bg-white shadow-sm">
          {t('wishlist.empty')} <Link to="/courses" className="text-primary hover:underline font-sans not-italic font-bold text-sm ml-2">{t('wishlist.browse')} &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map(fav => (
            <div key={fav.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
               {fav.imageUrl && <img src={fav.imageUrl} alt="" className="w-20 h-20 object-cover rounded-lg" />}
               <div className="flex-1">
                 <h3 className="font-bold">{fav.title}</h3>
                 <p className="font-bold text-primary">
                    {fav.price > 0 ? formatCurrency(fav.price, currency) : fav.memberships?.length > 0 ? (
                       <><span className="text-[10px] text-slate-500 uppercase font-medium mr-1">{t('courses.starting_from', 'Starting from')}</span>{formatCurrency(Math.min(...fav.memberships.map((m:any)=>m.offerPrice||0)), currency)}</>
                    ) : formatCurrency(0, currency)}
                 </p>
               </div>
               <div className="flex flex-col gap-2">
                 <Link to={`/${fav.isMembership ? 'memberships' : 'courses'}/${fav.itemId}`} className="px-4 py-2 bg-slate-100 font-bold text-sm rounded-lg hover:bg-slate-200 text-center">{t('wishlist.view')}</Link>
                 <button onClick={() => toggleFavorite(fav.itemType, fav.itemId, token!)} className="px-4 py-2 border border-red-200 text-red-500 font-bold text-sm rounded-lg hover:bg-red-50">{t('wishlist.remove')}</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

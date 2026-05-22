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
            <h1 className="text-3xl font-bold font-serif italic text-primary">Checkout</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 order-2 md:order-1">
               <h2 className="text-xl font-bold mb-6 text-slate-800">Billing Address</h2>
               <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input required type="text" value={billingDetails.fullName} onChange={e => setBillingDetails({...billingDetails, fullName: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Address</label>
                  <input required type="text" value={billingDetails.address} onChange={e => setBillingDetails({...billingDetails, address: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                    <input required type="text" value={billingDetails.city} onChange={e => setBillingDetails({...billingDetails, city: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                    <input required type="text" value={billingDetails.state} onChange={e => setBillingDetails({...billingDetails, state: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Zip Code</label>
                    <input required type="text" value={billingDetails.zip} onChange={e => setBillingDetails({...billingDetails, zip: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Country</label>
                    <input required type="text" value={billingDetails.country} onChange={e => setBillingDetails({...billingDetails, country: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <h3 className="font-bold text-lg mb-4 text-slate-800">Payment Method</h3>
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
                
                <div className="pt-6 mt-6 flex gap-4">
                   <button type="button" onClick={() => setShowCheckout(false)} className="px-6 py-4 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition flex-1">Back to Cart</button>
                   <button type="submit" disabled={isSubmitting} className="px-6 py-4 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark transition flex-1 disabled:opacity-70">
                     {isSubmitting ? 'Processing...' : 'Place Order'}
                   </button>
                </div>
             </form>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-fit order-1 md:order-2">
             <h3 className="font-bold text-lg mb-4 text-slate-800">Order Summary</h3>
             <div className="space-y-3 mb-6">
               {cart.map(item => (
                 <div key={item.id} className="flex justify-between items-center text-sm">
                   <span className="text-slate-600 truncate mr-4">{item.title}</span>
                   <span className="font-bold shrink-0">{formatCurrency(item.price, currency)}</span>
                 </div>
               ))}
             </div>
             <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
               <span className="font-bold text-lg">Total</span>
               <span className="font-bold text-2xl text-primary">{formatCurrency(getCartTotal(), currency)}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Place Order Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Total</p>
            <p className="text-2xl font-black text-gray-900 leading-none">{formatCurrency(getCartTotal(), currency)}</p>
         </div>
         <div className="flex items-center gap-2">
           <button type="button" onClick={() => setShowCheckout(false)} className="px-4 py-3 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Back</button>
           <button type="submit" form="checkout-form" disabled={isSubmitting} className="bg-primary text-white px-6 py-3 rounded-xl font-bold tracking-wide shadow-sm hover:bg-primary-dark transition disabled:opacity-70 flex items-center justify-center min-w-[120px]">
              {isSubmitting ? 'Processing...' : 'Place Order'}
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
  const { user, clearCart } = useStore();
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
           // remove session_id from URL
           searchParams.delete('session_id');
           setSearchParams(searchParams);
           // reload data
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

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-primary/20 flex flex-col items-center justify-center">
            <span className="font-bold text-xl leading-none uppercase text-primary">{user.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-0.5">{t('dashboard.student_portal')}</p>
            <p className="text-3xl font-bold font-serif italic text-ink">{t('dashboard.welcome')}, {user.name}</p>
          </div>
        </div>
      </header>
      
      {data.rejectedOrders && data.rejectedOrders.length > 0 && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-800 font-serif italic mb-1">Manual Payment Rejections</h3>
              <p className="text-xs text-red-700 font-sans mb-4">
                The verification verification of your manual bank transfer payment has failed. Please check the reason below or contact support.
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
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Total Price</span>
                        <span className="text-xs font-bold text-red-600">${order.total}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 bg-red-50/40 rounded-lg border border-red-50 text-xs text-red-800 font-medium">
                      <span className="font-bold text-red-900 block mb-1 uppercase text-[9px] tracking-widest">Rejection Reason:</span>
                      {order.rejectReason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
              { label: t('dashboard.active_courses'), value: data.courses.length },
              { label: t('dashboard.active_memberships'), value: data.memberships.filter(m => !(m.expiresAt && new Date(m.expiresAt) < new Date())).length },
              { label: t('dashboard.upcoming_events'), value: data.bookings.length },
              { label: t('dashboard.live_meetings'), value: data.meetings?.length || 0 },
          ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{stat.value}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">{stat.label}</span>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Memberships */}
        <div className="col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h2 className="text-xl font-serif italic mb-6 flex items-center gap-2 text-primary">{t('dashboard.membership_tiers')}</h2>
           {data.memberships.length === 0 ? <p className="text-slate-500 text-sm font-serif italic">{t('dashboard.no_memberships')}</p> : (
             <div className="space-y-4">
               {data.memberships.map((m, i) => {
                 const isPending = !!m.isPending;
                 const isExpired = !isPending && m.expiresAt && new Date(m.expiresAt) < new Date();
                 const content = m.membership.contents?.[0] || { title: m.membership.label || 'Membership' };
                 return (
                 <div key={i} className={`p-4 border rounded-xl flex items-center gap-4 ${isPending ? 'border-amber-200 bg-amber-50/40 shadow-sm' : isExpired ? 'opacity-60 bg-red-50/50 border-red-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                   {m.membership.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                        <img src={m.membership.imageUrl} alt={content.title} className="w-full h-full object-cover" />
                      </div>
                   ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white font-serif italic text-lg flex-shrink-0">
                         {content.title?.charAt(0)}
                      </div>
                   )}
                   <div className="flex-1 min-w-0">
                     <p className="text-sm font-bold text-slate-800 truncate">{content.title}</p>
                     <div className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isPending ? 'text-amber-600' : isExpired ? 'text-red-500' : 'text-primary'}`}>
                        {isPending ? 'Pending Verification' : isExpired ? 'Expired' : 'Active'}
                     </div>
                   </div>
                 </div>
               )})}
             </div>
           )}
        </div>

        {/* Courses */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
           <h2 className="text-xl font-serif italic mb-6 flex items-center gap-2 text-primary">{t('dashboard.my_learning')}</h2>
           {data.courses.length === 0 ? <p className="text-slate-500 text-sm font-serif italic">{t('dashboard.no_courses')}</p> : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {data.courses.map((c, i) => {
                 const isPending = !!c.isPending;
                 const isExpired = !isPending && c.expiresAt && new Date(c.expiresAt) < new Date();
                 return (
                 <div key={i} className={`border rounded-xl p-4 flex flex-col shadow-sm card-hover ${isPending ? 'border-amber-200 bg-amber-50/40' : isExpired ? 'opacity-60 bg-red-50/50 border-red-100' : 'border-slate-100 bg-slate-50'}`}>
                   <div className="font-bold text-sm mb-3 line-clamp-2 text-ink">{c.course.title}</div>
                   <div className="mt-auto">
                     {!isPending && (
                       <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${c.progress}%` }}></div>
                       </div>
                     )}
                     <div className="flex justify-between items-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {isPending ? 'Manual Payment' : `${c.progress}% Complete`}
                        </div>
                        {isPending ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 select-none">
                            Pending Approval
                          </span>
                        ) : (
                          <Link to={isExpired ? "#" : `/courses/${c.course.id}/player`} className={`text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded-lg transition ${isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}>{isExpired ? 'Expired' : 'Continue'}</Link>
                        )}
                     </div>
                   </div>
                 </div>
               )})}
             </div>
           )}
        </div>

        {/* Events & Meetings */}
        { (data.bookings.length > 0 || (data.meetings && data.meetings.length > 0)) && (
            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Events */}
                {data.bookings.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-serif italic mb-6 text-primary">{t('dashboard.upcoming_events')}</h2>
                        <div className="space-y-4">
                            {data.bookings.map((b, i) => {
                                const d = new Date(b.event.date);
                                return (
                                    <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
                                        <div className="w-12 h-12 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg shrink-0">
                                            <span className="text-[10px] font-bold text-red-500 leading-none uppercase">{d.toLocaleString('default', { month: 'short' })}</span>
                                            <span className="text-lg font-bold leading-none mt-1">{d.getDate()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{b.event.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{d.toLocaleTimeString([], {timeStyle: 'short'})} &bull; {b.event.location}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg uppercase tracking-wider">{b.status}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
                
                {/* Meetings */}
                {data.meetings && data.meetings.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                        <h2 className="text-xl font-serif italic mb-6 text-blue-600">Live Classes</h2>
                        <div className="space-y-4">
                            {data.meetings.map((m, i) => {
                                const d = m.meetingDate ? new Date(m.meetingDate) : null;
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{m.itemType}</p>
                                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{m.itemName}</p>
                                            {d ? (
                                                <p className="text-xs text-slate-500 font-medium">{d.toLocaleDateString()} at {d.toLocaleTimeString([], {timeStyle:'short'})}</p>
                                            ) : (
                                                <p className="text-xs text-slate-500 font-medium">To be determined</p>
                                            )}
                                        </div>
                                        {m.meetingLink && (
                                            <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="ml-4 shrink-0 px-4 py-2 bg-blue-600/10 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-blue-600 hover:text-white transition">
                                                Join
                                            </a>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )}
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

   if (!course) return <div className="p-12 text-center text-slate-500">Loading course player...</div>;

   return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
         <div className="flex-1 bg-black flex flex-col relative overflow-y-auto w-full max-h-full">
            <div className="w-full bg-black relative flex items-center justify-center shrink-0 border-b border-slate-800" style={{ aspectRatio: '16/9' }}>
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
         
         <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 bg-white border-l border-slate-200 overflow-y-auto flex flex-col h-[40vh] md:h-auto">
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
                      No lessons found for this course.
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

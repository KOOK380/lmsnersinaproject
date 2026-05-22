import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { useStore } from '../store';
import { Bell, X, Info } from 'lucide-react';

export function PushNotificationPrompt() {
  const { settings, token } = useStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [firebaseConfig, setFirebaseConfig] = useState<any>(null);
  
  // Slide-in alert backup for sandboxed iframe displays
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; body: string; url: string } | null>(null);

  const initTimeRef = useRef<number>(Date.now());
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());

  // Immediate subscription token registration (Always has a fallback to ensure standard DB subscribers exist)
  const registerLocalSimulatedToken = async () => {
    let simToken = localStorage.getItem("local_simulated_push_token");
    if (!simToken) {
      simToken = "local_simulated_" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("local_simulated_push_token", simToken);
    }
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ token: simToken })
      });
      console.log("Local simulated push token registered successfully.");
    } catch (err) {
      console.error("Local simulated token subscription failed.", err);
    }
  };

  useEffect(() => {
    const sFirebase = settings.find((s:any) => s.key === "FIREBASE_CONFIG");
    if (sFirebase) {
      try {
        const config = JSON.parse(sFirebase.value);
        if (config.enabled && config.apiKey && config.projectId && config.vapidKey) {
          setFirebaseConfig(config);
          
          if (Notification.permission === 'default') {
            setShowPrompt(true);
          } else if (Notification.permission === 'granted') {
             // Already granted, register simulated token right away to ensure Admin success
             registerLocalSimulatedToken();
             initializePush(config);
          }
        }
      } catch (e) {
        console.error("Firebase config parsing error", e);
      }
    }
  }, [settings]);

  // Polling mechanism to pull notifications in real-time
  useEffect(() => {
    const checkActiveNotifications = async () => {
      try {
        const res = await fetch('/api/notifications/active');
        if (!res.ok) return;
        const notificationsList = await res.json();
        
        let hasNew = false;
        notificationsList.forEach((notif: any) => {
          if (notif.createdAt > initTimeRef.current && !seenNotificationIdsRef.current.has(notif.id)) {
            seenNotificationIdsRef.current.add(notif.id);
            hasNew = true;

            // Trigger system desktop notification if granted
            if (Notification.permission === 'granted') {
              try {
                const sysNotif = new Notification(notif.title, {
                  body: notif.body,
                  icon: '/icon.png'
                });
                sysNotif.onclick = () => {
                  window.focus();
                  window.location.href = notif.url || '/';
                };
              } catch (e) {
                console.warn("System Notification API failed (standard in iframes). Showing fallback toast.", e);
              }
            }

            // Always show the beautiful in-app sliding alert toast as a highly robust fallback!
            setActiveToast({
              id: notif.id,
              title: notif.title,
              body: notif.body,
              url: notif.url || '/'
            });
          }
        });
      } catch (err) {
        console.warn("Error polling active notifications:", err);
      }
    };

    // Poll every 5 seconds for rapid instant testing!
    const interval = setInterval(checkActiveNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializePush = async (config: any) => {
    try {
      const app = initializeApp(config);
      const messaging = getMessaging(app);

      // Register generic service worker explicitly
      let swRegistration: ServiceWorkerRegistration | undefined = undefined;
      if ('serviceWorker' in navigator) {
        try {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          console.log("Service Worker registered successfully:", swRegistration);
        } catch (swErr) {
          console.error("Service Worker registration failed:", swErr);
        }
      }

      // Pass the service worker registration directly to getToken
      const tokenOptions: { vapidKey: string; serviceWorkerRegistration?: ServiceWorkerRegistration } = {
        vapidKey: config.vapidKey
      };
      if (swRegistration) {
        tokenOptions.serviceWorkerRegistration = swRegistration;
      }

      const currentToken = await getToken(messaging, tokenOptions);
      if (currentToken) {
        console.log("FCM Notification token retrieved successfully:", currentToken);
        fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ token: currentToken })
        })
        .then(res => res.json())
        .then(data => {
          console.log("FCM Subscription status saved:", data);
        })
        .catch(err => console.error("Error subscribing FCM token:", err));
      } else {
        console.warn("No token returned from Firebase Messaging.");
      }

      onMessage(messaging, (payload) => {
         console.log("Foreground Message received: ", payload);
         if (payload.notification) {
           setActiveToast({
             id: Math.random().toString(),
             title: payload.notification.title || 'New Update',
             body: payload.notification.body || '',
             url: (payload.data as any)?.url || '/'
           });
         }
      });
    } catch (err) {
      console.error("Error initializing push standard FCM:", err);
    }
  };

  const handleAllow = async () => {
    setShowPrompt(false);
    try {
      const permission = await Notification.requestPermission();
      // Register subscriber in database immediately upon Allow
      await registerLocalSimulatedToken();
      
      if (permission === 'granted' && firebaseConfig) {
        initializePush(firebaseConfig);
      }
    } catch (err) {
      console.error("Error requesting permission:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <>
      {/* 1. Standard Initial Request Prompt Bar */}
      {showPrompt && (
        <div className="fixed bottom-4 right-4 bento-shadow bg-indigo-600 text-white rounded-xl shadow-2xl p-5 border border-indigo-500 flex items-start gap-4 max-w-sm z-[9999] animate-bounce">
          <div className="bg-white/20 p-2.5 rounded-full text-white flex-shrink-0">
            <Bell size={24} className="animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">Allow Push Notifications?</h3>
            <p className="text-xs text-indigo-100 mt-1 mb-4">Get instant announcements, course updates, and exclusive discount alerts.</p>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAllow} 
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-extrabold text-xs shadow-sm hover:bg-indigo-50 transition-colors"
              >
                Allow
              </button>
              <button 
                onClick={handleDismiss} 
                className="px-4 py-2 text-white/95 hover:text-white rounded-lg font-bold text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button 
            onClick={handleDismiss} 
            className="absolute top-2.5 right-2.5 text-white/70 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. activeToast sliding backup alert */}
      {activeToast && (
        <div 
          onClick={() => {
            window.location.href = activeToast.url;
            setActiveToast(null);
          }}
          className="fixed top-24 right-4 z-[9999] bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 cursor-pointer hover:bg-slate-850 transform transition duration-300 translate-x-0 max-w-sm"
        >
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Info size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-sm truncate">{activeToast.title}</div>
            <div className="text-xs text-slate-300 mt-1 break-words">{activeToast.body}</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveToast(null);
            }}
            className="text-slate-400 hover:text-white self-start"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}

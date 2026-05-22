import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { Bell, X } from 'lucide-react';

export function PushNotificationPopup() {
  const { settings, token: auth_token } = useStore();
  const [showPopup, setShowPopup] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const sFirebase = settings.find((s:any) => s.key === 'FIREBASE_CONFIG');
    if (sFirebase) {
      try {
        const parsed = JSON.parse(sFirebase.value);
        if (parsed.enabled && parsed.apiKey && parsed.projectId) {
          setConfig(parsed);
          
          // Check if permission already granted or denied
          if (Notification.permission === 'default' && !localStorage.getItem('push_notification_dismissed')) {
            setShowPopup(true);
          } else if (Notification.permission === 'granted') {
            // Already granted, initialize in background
            setupFirebase(parsed, true);
          }
        }
      } catch (err) {}
    }
  }, [settings]);

  const setupFirebase = async (firebaseConfig: any, silent = false) => {
    try {
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Register service worker if not registered so we can pass config
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        if (reg.active) {
          reg.active.postMessage({ type: 'INIT_FIREBASE', config: firebaseConfig });
        }
      }

      if (!silent) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          fetchTokenAndSave(messaging, firebaseConfig.vapidKey);
        }
        setShowPopup(false);
      } else {
        if (Notification.permission === 'granted') {
          fetchTokenAndSave(messaging, firebaseConfig.vapidKey);
        }
      }
    } catch (err) {
      console.error("Firebase init error: ", err);
    }
  };

  const fetchTokenAndSave = async (messaging: any, vapidKey: string) => {
    try {
      const gToken = await getToken(messaging, { vapidKey });
      if (gToken) {
        console.log("FCM Token:", gToken);
        // Send token to backend
        fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(auth_token ? { 'Authorization': `Bearer ${auth_token}` } : {})
          },
          body: JSON.stringify({ token: gToken })
        }).catch(console.error);

        onMessage(messaging, (payload) => {
          console.log('[Message received]', payload);
        });
      }
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
    }
  };

  const decline = () => {
    localStorage.setItem('push_notification_dismissed', 'true');
    setShowPopup(false);
  };

  const accept = () => {
    if (config) {
      setupFirebase(config);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white p-5 rounded-2xl shadow-xl border border-slate-200 z-[9999] animate-in slide-in-from-bottom-5">
      <button onClick={decline} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={16} /></button>
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
          <Bell className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Stay Updated</h3>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">Enable push notifications to never miss out on new courses, events, or updates.</p>
          <div className="flex gap-2">
            <button onClick={accept} className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition shadow-sm">Enable Now</button>
            <button onClick={decline} className="text-sm font-bold text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 transition">Not Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

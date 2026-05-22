import React, { useState, useEffect } from "react";
import { useStore } from "../store";

export function MaintenanceManager() {
  const { token } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmingEntity, setConfirmingEntity] = useState<string | null>(null);

  const executeClearDatabase = async (entity: string) => {
    setError(null);
    setSuccess(null);
    setConfirmingEntity(null);
    const url = `/api/admin/clear-data/${entity}`;
    if (!token) {
        setError("Not logged in");
        return;
    }
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setSuccess(`${entity} cleared successfully. Refreshing...`);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            const errorText = await res.text();
            console.error("Clear database failed:", errorText);
            setError(`Failed to clear ${entity} (Status: ${res.status}): ${errorText}`);
        }
    } catch(e) {
        console.error(e);
        setError(`Error clearing ${entity}: ${e}`);
    }
  }

  const clearDatabase = (entity: string) => {
    setConfirmingEntity(entity);
  };

  const backupDatabase = async () => {
    if (!token) {
        setError("Not logged in");
        return;
    }
    // create a hidden link element and click it
    const link = document.createElement('a');
    link.href = `/api/admin/backup?token=${token}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const restoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    if (!token) {
        setError("Not logged in");
        return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Instead of confirm() we just proceed, or we could add a confirmation state.
    // Given the difficulty with input type="file" triggering, let's just proceed immediately 
    // for this feature or add a UI warning.
    const formData = new FormData();
    formData.append('backup', file);

    try {
        const res = await fetch(`/api/admin/restore`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (res.ok) {
            setSuccess('Database restored successfully');
        } else {
            const errorText = await res.text();
            console.error("Restore database failed:", errorText);
            setError(`Failed to restore (Status: ${res.status}): ${errorText}`);
        }
    } catch(e) {
        console.error(e);
        setError(`Error restoring: ${e}`);
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900 font-sans tracking-tight">Database Maintenance</h3>
        <div className="flex gap-2">
            <button onClick={backupDatabase} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-900 transition shadow">
              Backup Database
            </button>
            <label className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-700 transition shadow cursor-pointer">
              Restore Database
              <input type="file" onChange={restoreDatabase} className="hidden" />
            </label>
        </div>
      </div>
      
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 mt-8">
        <h4 className="font-bold text-red-900 mb-4">Danger Zone: Clear Data</h4>
        
        {confirmingEntity ? (
           <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
             <p className="font-bold mb-2">Are you sure you want to clear ALL {confirmingEntity}?</p>
             <div className="flex gap-2">
                <button onClick={() => executeClearDatabase(confirmingEntity)} className="bg-red-600 text-white px-4 py-1 rounded text-sm font-bold">Yes, Clear</button>
                <button onClick={() => setConfirmingEntity(null)} className="bg-gray-500 text-white px-4 py-1 rounded text-sm font-bold">Cancel</button>
             </div>
           </div>
        ) : (
          <div className="flex gap-4 flex-wrap">
              <button onClick={() => clearDatabase('orders')} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">Clear All Orders</button>
              <button onClick={() => clearDatabase('courseOrders')} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">Clear Course Orders</button>
              <button onClick={() => clearDatabase('userCourses')} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">Clear Course Progressions</button>
              <button onClick={() => clearDatabase('membershipOrders')} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">Clear Membership Orders</button>
              <button onClick={() => clearDatabase('bookings')} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm hover:bg-red-700">Clear Event Bookings</button>
          </div>
        )}
      </div>
    </div>
  );
}

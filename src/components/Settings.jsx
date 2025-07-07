import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'; // make sure this path is correct
import './Settings.css'; // optional if you have styles

const Settings = () => {
  const [userEmail, setUserEmail] = useState('');
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get Firebase user email
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch client info from Airtable
  useEffect(() => {
    const fetchClientData = async () => {
      if (!userEmail) return;

      try {
        const filterFormula = encodeURIComponent(`{Email} = '${userEmail}'`);
        const res = await fetch(
          `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Clients?filterByFormula=${filterFormula}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_TOKEN}`
            }
          }
        );
        const data = await res.json();
        const client = data.records[0]?.fields;
        setClientData(client || null);
      } catch (err) {
        console.error('Error fetching client:', err);
        setClientData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [userEmail]);

  if (loading) return <div className="p-4">Loading profile...</div>;

  if (!clientData)
    return (
      <div className="p-4 text-red-500">
        ❌ No profile found for {userEmail}. Please contact Orinexa Support.
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <div className="grid gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={clientData['Client Name'] || ''}
            readOnly
            className="mt-1 w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={userEmail}
            readOnly
            className="mt-1 w-full border rounded p-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <input
            type="text"
            value={clientData['Company Name'] || ''}
            readOnly
            className="mt-1 w-full border rounded p-2 bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
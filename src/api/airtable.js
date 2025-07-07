// src/api/airtable.js
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const CLIENTS_TABLE = import.meta.env.VITE_AIRTABLE_TABLE_NAME; // 'Clients'
const APPOINTMENTS_TABLE = import.meta.env.VITE_AIRTABLE_APPOINTMENTS_TABLE; // 'Appointments'
const SERVICE_REQUESTS_TABLE = import.meta.env.VITE_AIRTABLE_SERVICE_REQUESTS_TABLE; // 'Service Request Table'
const PURCHASES_TABLE = import.meta.env.VITE_AIRTABLE_PURCHASES_TABLE; // 'Credit Purchases'

// ✅ Fetch Client Info by Email
export async function fetchClients(email) {
  const filterFormula = encodeURIComponent(`{Email} = '${email}'`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${CLIENTS_TABLE}?filterByFormula=${filterFormula}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

// ✅ Fetch Appointments by Email (Even if Email is a Lookup)
export async function fetchAppointments(email) {
  const filterFormula = encodeURIComponent(`{Email Text} = '${email}'`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${APPOINTMENTS_TABLE}?filterByFormula=${filterFormula}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Appointments fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

// ✅ Fetch Service Requests by Email
export async function fetchServiceRequests(email) {
  const filterFormula = encodeURIComponent(`{Email Text} = '${email}'`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${SERVICE_REQUESTS_TABLE}?filterByFormula=${filterFormula}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Service Request fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}

// ✅ Fetch Purchases by Email
export async function fetchPurchases(email) {
  const filterFormula = encodeURIComponent(`{Email} = '${email}'`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/${PURCHASES_TABLE}?filterByFormula=${filterFormula}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.records;
}
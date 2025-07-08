import React, { useState, useEffect } from 'react';
import { fetchClients } from '../api/airtable'; // path may vary if in src/airtable.js
import { fetchAppointments } from '../api/airtable'; // update path if needed
import { fetchServiceRequests } from '../api/airtable'; // adjust path if needed
import { fetchPurchases } from '../api/airtable'; // adjust path if needed
import { LogOut } from 'lucide-react';
import { auth, getAuth } from '../firebase'; // ✅ use your custom file
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Home, Calendar, FileText, Bot, ShoppingCart, Settings, HelpCircle,
  Star, TrendingUp, CheckCircle, Clock, Plus, Users, BarChart3,
  Phone, Linkedin, Mail, FileDown, Share2, Gift, Menu, X
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const [userEmail, setUserEmail] = useState('');
  const [airtableClients, setAirtableClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [purchases, setPurchases] = useState([]);

 // Airtable keys from .env
  const apiKey = import.meta.env.VITE_AIRTABLE_TOKEN;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
  const clientsTable = import.meta.env.VITE_AIRTABLE_CLIENTS_TABLE; // Ensure this is defined in your .env
  const appointmentsTable = import.meta.env.VITE_AIRTABLE_APPOINTMENTS_TABLE; // Ensure this is defined in your .env
  const serviceRequestsTable = import.meta.env.VITE_AIRTABLE_SERVICE_REQUESTS_TABLE; // Ensure this is defined in your .env
  const purchasesTable = import.meta.env.VITE_AIRTABLE_PURCHASES_TABLE; // Ensure this is defined in your .env

  const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_SERVICE_REQUEST; // Ensure this is defined in your .env

  // Get logged-in Firebase user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
      } else {
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch client data from Airtable
useEffect(() => {
  const loadClientData = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        `https://api.airtable.com/v0/${baseId}/Clients?filterByFormula=${encodeURIComponent(`{Email} = "${userEmail}"`)}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const data = await res.json();
      const clientRecord = data.records[0];
      setAirtableClients(clientRecord ? [clientRecord] : []);
    } catch (error) {
      console.error('Airtable Fetch Error:', error);
      setAirtableClients([]);
    }
  };

  loadClientData();
}, [userEmail]);

  // Fetch appointments from Airtable
  useEffect(() => {
  const loadAppointments = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        `https://api.airtable.com/v0/${baseId}/${appointmentsTable}?filterByFormula=${encodeURIComponent(`{Email Text} = "${userEmail}"`)}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );

      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
      const data = await res.json();
      // Map fields for rendering
      setAppointments(data.records.map(record => ({
        name: record.fields["Prospect"] || '',
        date: record.fields["Appointment Date"] || '',
        status: record.fields["Status"] || '',
        outcome: record.fields["Outcome"] || '',
        points: record.fields["Points Used"] || 0,
      })));
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  };

  loadAppointments();
}, [userEmail]);

  // Fetch service requests from Airtable
  useEffect(() => {
  const loadServiceRequests = async () => {
  if (!userEmail) return;
  console.log("Fetching service requests for:", userEmail); 
  try {
    const data = await fetchServiceRequests(userEmail);
    const requestRecords = data.map((record) => {
      const fields = record.fields;
      return {
        email: fields["Email Text"] || '',
        date: fields["Requested Date"] || '',
        service: fields["Service Type"] || '',
        status: fields["Status"] || '',
        notes: fields["Notes"] || '',
        points: fields["Points Used"] || 0
      };
    });
    setServiceRequests(requestRecords);
  } catch (error) {
    console.error("Failed to fetch service requests:", error);
    setServiceRequests([]);
  }
};

  loadServiceRequests();
}, [userEmail]);

  // Fetch purchases from Airtable
  useEffect(() => {
  const loadPurchases = async () => {
    if (!userEmail) return;

    try {
      const data = await fetchPurchases(userEmail);
      const mapped = data.map(record => {
        const fields = record.fields;
        return {
          date: fields["Purchased Date"] || '',
          plan: fields["Package Name"] || '',
          amount: fields["Amount Paid"] || '',
          credits: fields["Total Points Added"] || '',
          method: fields["Payment Method"] || '',
        };
      });
      setPurchases(mapped);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
      setPurchases([]);
    }
  };

  loadPurchases();
}, [userEmail]);

  // Access fields from Airtable record
  const clientData = airtableClients[0]?.fields || {};

  const aiTools = [
    { name: "AI Lead Bot", icon: Bot, available: true },
    { name: "Chatbot Builder", icon: Users, available: true },
    { name: "PDF Email Sender", icon: FileDown, available: true },
    { name: "LinkedIn Outreach", icon: Linkedin, available: true },
    { name: "Social Media Scheduler", icon: Share2, available: true }
  ];

  const packages = [
    { name: "Starter", price: 350, credits: 350, bonus: 0 },
    { name: "Growth", price: 700, credits: 700, bonus: 70, popular: true },
    { name: "Scale", price: 1400, credits: 1400, bonus: 150 },
    { name: "Pro", price: 2800, credits: 2500, bonus: 350 }
  ];

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'service-requests', name: 'Service Requests', icon: FileText },
    { id: 'ai-tools', name: 'AI Tools', icon: Bot },
    { id: 'purchases', name: 'Purchases', icon: ShoppingCart },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'help', name: 'Help', icon: HelpCircle }
  ];

  const handleLogout = () => {
    // Clear any stored data (optional)
    localStorage.clear();

    // Redirect to login page
    window.location.href = '/';
  };

  const services = [
    { name: 'Qualified Appointment', points: 70 },
    { name: 'No-show Reschedule', points: 20 },
    { name: 'Invalid Lead Replacement', points: 10 },
    { name: 'Outreach Tool Setup & Warmup', points: 100 },
    { name: 'LinkedIn Outreach Setup', points: 100 },
    { name: 'Automation Flow Build', points: 100 },
    { name: 'AI Lead Bot Setup (Basic)', points: 50 },
    { name: 'AI Lead Bot Setup (Multi-Niche)', points: 100 },
    { name: 'AI Lead Bot Setup (White-Label)', points: 150 },
    { name: 'CRM Setup & Automation', points: 150 },
    { name: 'Landing Page Design', points: 150 },
    { name: 'Google Ads/Retargeting Setup', points: 150 },
    { name: 'Cold Calling (10 dials)', points: 50 },
    { name: 'VA - Booking Travel', points: 20 },
    { name: 'VA - Managing Inbox', points: 20 },
    { name: 'VA - Prospecting', points: 20 },
    { name: 'VA - CRM Cleanup', points: 20 },
    { name: 'VA - Data Entry', points: 20 },
    { name: 'VA - Lead Research', points: 20 }
  ];

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Filter functions
  const filterAppointments = (appointments) => {
  return appointments.filter(appointment => {
    const matchesSearch =
      (appointment.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.outcome || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (appointment.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });
};

const filterServiceRequests = (requests) => {
  return requests.filter(request => {
    const matchesSearch =
      (request.service || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (request.status || "").toLowerCase() === statusFilter.toLowerCase();

    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all' && request.date) {
      const reqDate = new Date(request.date);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = reqDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = reqDate >= weekAgo && reqDate <= now;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = reqDate >= monthAgo && reqDate <= now;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });
};

  // Validation functions
  const validateServiceRequest = () => {
    if (!selectedService) {
      showToast('Please select a service', 'error');
      return false;
    }
    const selectedServiceData = services.find(s => s.name === selectedService);
    if (selectedServiceData.points > (clientData["Remaining Points"] || 0)) {
      showToast('Insufficient credits for this service', 'error');
      return false;
    }
    return true;
  };

  const handleServiceRequest = async (service, points) => {
    setLoading(true);
    const requestData = {
      client_name: clientData.Name,
      email: clientData.Email,
      service_type: service,
      points_cost: points,
      notes: `Request for ${service}`,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      showToast(`${service} request submitted successfully!`, 'success');
    } catch (error) {
      console.error('Error submitting request:', error);
      showToast('Request submitted (demo mode)', 'success');
    } finally {
      setLoading(false);
    }
  };

  // Loading Skeleton Component
  const LoadingSkeleton = ({ rows = 3 }) => (
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={`animate-pulse p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
          <div className="flex items-center space-x-4">
            <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/4`}></div>
            <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/3`}></div>
            <div className={`h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/5`}></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Toast Component
  const Toast = () => {
    if (!toast.show) return null;
    
    return (
      <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      } text-white`}>
        <div className="flex items-center space-x-2">
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
        </div>
      </div>
    );
  };

  // Search and Filter Component
  const SearchAndFilter = ({ onSearch, onStatusFilter, onDateFilter, showDateFilter = false }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onSearch(e.target.value);
          }}
          className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        />
      </div>
      <div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            onStatusFilter(e.target.value);
          }}
          className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="scheduled">Scheduled</option>
          <option value="no show">No Show</option>
          <option value="in progress">In Progress</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      {showDateFilter && (
        <div>
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              onDateFilter(e.target.value);
            }}
            className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'no show': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'in progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'delivered': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  const CreditCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>{title}</p>
          <p className={`text-3xl font-bold ${color} mt-1 transition-all duration-500`}>{value}</p>
          {subtitle && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{subtitle}</p>}
        </div>
        <div className={`p-3 ${color.includes('blue') ? 'bg-blue-500/20' : color.includes('green') ? 'bg-green-500/20' : color.includes('purple') ? 'bg-purple-500/20' : 'bg-orange-500/20'} rounded-lg transform transition-transform duration-300 hover:scale-110`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-100 to-purple-100'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-8`}>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
  Welcome back, {clientData["Company Name"] || ''}! 👋
</h1>
<span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
  🏠 {clientData["Industry"] || ''}
</span>
<span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
  Client since {clientData["Joined Date"]
    ? new Date(clientData["Joined Date"]).toLocaleDateString()
    : "Unknown"}
</span>
      </div>

      {/* Credit Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <CreditCard
    title="Total Credits"
    value={(clientData["Total Points"] || 0).toLocaleString()}
    icon={Star}
    color="text-blue-400"
    subtitle={clientData["Credit Validity Until"] ? `Expires on ${new Date(clientData["Credit Validity Until"]).toLocaleDateString()}` : "No expiry"}
  />
  <CreditCard
    title="Used Credits"
    value={(clientData["Used Points"] || 0).toLocaleString()}
    icon={TrendingUp}
    color="text-gray-400"
  />
  <CreditCard
    title="Remaining Credits"
    value={(clientData["Remaining Points"] || 0).toLocaleString()}
    icon={CheckCircle}
    color="text-green-400"
  />
  <CreditCard
    title="Bonus Credits"
    value={(clientData["Bonus Points"] || 0).toLocaleString()}
    icon={Gift}
    color="text-purple-400"
  />
</div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upcoming Appointments</h2>
            <button 
              onClick={() => setActiveTab('appointments')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:scale-[1.02] transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{appointment.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{appointment.date}</p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>{appointment.outcome}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Service Requests */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Service Requests</h2>
            <button 
              onClick={() => setActiveTab('service-requests')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {serviceRequests.map((request, index) => (
              <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} hover:scale-[1.02] transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{request.service}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{request.date}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={request.status} />
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{request.points} pts</p>
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>{request.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Tools Section */}
      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Tools</h2>
          <button 
            onClick={() => setActiveTab('ai-tools')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All Tools
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {aiTools.map((tool, index) => (
            <div key={index} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} text-center hover:scale-105 transition-all duration-300`}>
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <tool.icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{tool.name}</h3>
              <button 
                onClick={() => handleServiceRequest(tool.name, 100)}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Request Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Credits Section */}
      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>Buy More Credits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg, index) => (
            <div key={index} className={`relative p-6 rounded-lg border-2 ${pkg.popular ? 'border-blue-500 bg-blue-500/10' : `border-gray-${darkMode ? '700' : '200'} ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`} hover:scale-105 transition-all duration-300`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="text-center">
                <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{pkg.name}</h3>
                <p className={`text-3xl font-bold ${pkg.popular ? 'text-blue-400' : darkMode ? 'text-white' : 'text-gray-900'} mt-2`}>${pkg.price}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {pkg.credits} credits {pkg.bonus > 0 && `+ ${pkg.bonus} bonus`}
                </p>
                <button className={`w-full mt-4 px-4 py-2 ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'} text-white font-medium rounded-lg transition-colors`}>
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => {
    const filteredAppointments = filterAppointments(appointments);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appointments</h1>
        </div>
        
        <SearchAndFilter 
          onSearch={() => {}} 
          onStatusFilter={() => {}} 
          onDateFilter={() => {}} 
          showDateFilter={true} 
        />
        
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton rows={5} />
              </div>
            ) : (
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Prospect</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Outcome</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Points</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800/30' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAppointments.length > 0 ? filteredAppointments.map((appointment, index) => (
                    <tr key={index} className={`hover:${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{appointment.date}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{appointment.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={appointment.status} /></td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{appointment.outcome}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{appointment.points} pts</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className={`px-6 py-12 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No appointments found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderServiceRequests = () => {
    const handleSubmitRequest = async () => {
      if (!validateServiceRequest()) return;
      
      setLoading(true);
      const selectedServiceData = services.find(s => s.name === selectedService);
      const requestData = {
        "Client": clientData["Client Name"],
        "Email Text": clientData["Email"],
        "Service Type": selectedService,
        "Points Used": selectedServiceData.points,
        "Notes": serviceNotes,
        "Requested Date": new Date().toISOString()
   };

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
        showToast(`${selectedService} request submitted successfully!`, 'success');
        setSelectedService('');
        setServiceNotes('');
      } catch (error) {
        console.error('Error submitting request:', error);
        showToast('Request submitted (demo mode)', 'success');
        setSelectedService('');
        setServiceNotes('');
      } finally {
        setLoading(false);
      }
    };

    const filteredRequests = filterServiceRequests(serviceRequests);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Service Requests</h1>
        </div>

        {/* New Service Request Form */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Request New Service</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Select Service
              </label>
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option value="">Choose a service...</option>
                {services.map((service, index) => (
                  <option key={index} value={service.name}>
                    {service.name} ({service.points} points)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Points Required
              </label>
              <div className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700/50 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'} rounded-lg`}>
                {selectedService ? services.find(s => s.name === selectedService)?.points || 0 : 0} points
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Additional Notes (Optional)
            </label>
            <textarea 
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              rows={3}
              placeholder="Provide any specific requirements or details..."
              className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            ></textarea>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Available Credits: <span className="font-medium text-green-400">{clientData["Remaining Points"] || 0} points</span>
            </div>
            <button 
              onClick={handleSubmitRequest}
              disabled={!selectedService || loading}
              className={`px-6 py-2 ${selectedService && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'} text-white font-medium rounded-lg transition-colors flex items-center space-x-2`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </div>

        <SearchAndFilter 
          onSearch={() => {}} 
          onStatusFilter={() => {}} 
          onDateFilter={() => {}} 
          showDateFilter={true} 
        />

        {/* Service Requests History */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Request History</h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton rows={5} />
              </div>
            ) : (
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Request Date</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Service</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Notes</th>
                    <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Points</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800/30' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredRequests.length > 0 ? filteredRequests.map((request, index) => (
                    <tr key={index} className={`hover:${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{request.date}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{request.service}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={request.status} /></td>
                      <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{request.notes}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{request.points} pts</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className={`px-6 py-12 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No service requests found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAITools = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>AI Tools Hub</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool, index) => (
          <div key={index} className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg`}>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-500/20 rounded-xl transform transition-transform duration-300 hover:scale-110">
                <tool.icon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{tool.name}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {tool.available ? 'Available for request' : 'Coming Soon'}
            </p>
            <button 
              onClick={() => handleServiceRequest(tool.name, 100)}
              disabled={!tool.available || loading}
              className={`w-full px-4 py-2 ${tool.available && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'} text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>{tool.available ? 'Request Now' : 'Coming Soon'}</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Purchase History</h1>
      </div>
      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Date</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Plan</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Amount</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Credits</th>
                <th className={`px-6 py-4 text-left text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Method</th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800/30' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {purchases.map((purchase, index) => (
                <tr key={index} className={`hover:${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{purchase.date}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{purchase.plan}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {Number(purchase.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{purchase.credits}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{purchase.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Name
              </label>
              <input 
                type="text" 
                value={clientData["Client Name"] || ''}
                readOnly
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Email
              </label>
              <input 
                type="email" 
                value={clientData["Email"] || ''}
                readOnly
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Company
              </label>
              <input 
                type="text" 
                value={clientData["Company Name"] || ''}
                readOnly
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Update Profile
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Email Notifications</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receive updates via email</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>SMS Notifications</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Receive updates via SMS</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Connected Integrations */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6 lg:col-span-2`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Connected Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">SL</span>
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Smartlead</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connected</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className={`p-4 border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">HS</span>
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>HubSpot</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Connected</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className={`p-4 border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">OP</span>
                  </div>
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>OpenPhone</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Not Connected</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Help & Support</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Contact Support</h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Name</label>
              <input 
                type="text" 
                value={clientData.Name || ''}
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email</label>
              <input 
                type="email" 
                value={clientData.Email || ''}
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Subject</label>
              <input 
                type="text" 
                placeholder="How can we help?"
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Priority</label>
              <select className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Message</label>
              <textarea 
                rows={4}
                placeholder="Describe your issue or question..."
                className={`w-full px-3 py-2 border ${darkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              ></textarea>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Submit Ticket
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className={`p-4 border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>How do credits work?</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Credits are deducted based on the service you request. Each service has a specific point value.</p>
            </div>
            <div className={`p-4 border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>When do credits expire?</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Credits expire based on your package. Starter and Growth packages expire in 3 months, Scale and Pro in 6 months.</p>
            </div>
            <div className={`p-4 border ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'} rounded-lg`}>
              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>How do I request a service?</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You can request services from the Dashboard or visit the AI Tools section for automated services.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'appointments': return renderAppointments();
      case 'service-requests': return renderServiceRequests();
      case 'ai-tools': return renderAITools();
      case 'purchases': return renderPurchases();
      case 'settings': return renderSettings();
      case 'help': return renderHelp();
      default: return renderDashboard();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      {/* Toast Notifications */}
      <Toast />

      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Orinexa</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {/* Mobile close button */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className={`p-2 rounded-lg lg:hidden ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? `${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900'}`
                    : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>
        {/* Logout Button */}
        <div className="mb-4 px-4">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-6 left-3 right-3">
          <div className={`flex items-center p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              {/* Generate initials from Name */}
              <span className="text-white font-medium text-sm">
                {(clientData["Client Name"] || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{clientData["Client Name"] || ''}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{clientData["Company Name"] || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className={`lg:hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-3`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Orinexa</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
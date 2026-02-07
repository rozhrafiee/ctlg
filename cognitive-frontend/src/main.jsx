import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'

// ✅ Import CSS files
import "./styles/global-styles.css";
import "./styles/page-styles.css";
import ModernNavbar from '@/components/layout/ModernNavbar';
import '@/styles/dashboard-modern-fixed.css'
import "@/styles/teacher-dashboard.css";
import "@/styles/homepage.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

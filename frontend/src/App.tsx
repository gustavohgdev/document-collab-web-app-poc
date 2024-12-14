import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { DocumentList } from './components/documents/DocumentList';
import { DocumentEditor } from './components/documents/DocumentEditor';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected Routes */}
          <Route
  path="/documents"
  element={
    <PrivateRoute>
      <Layout>
        <DocumentList />
      </Layout>
    </PrivateRoute>
  }
/>
<Route
  path="/documents/:id"
  element={
    <PrivateRoute>
      <Layout>
        <DocumentEditor />
      </Layout>
    </PrivateRoute>
  }
/>

          {/* Redirect root to documents */}
          <Route path="/" element={<Navigate to="/documents" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

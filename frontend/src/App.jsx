/**
 * Agentic Ads Studio - Frontend
 *
 * Created by Didik Wahyudi
 * Agentic Ads Studio
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BrandProvider } from './context/BrandContext';
import { CampaignProvider } from './context/CampaignContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Code-splitting via React.lazy
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateAds = lazy(() => import('./pages/CreateAds'));
const ImageAds = lazy(() => import('./pages/ImageAds'));
const Wizard = lazy(() => import('./components/Wizard'));
const VideoAds = lazy(() => import('./pages/VideoAds'));
const Reporting = lazy(() => import('./pages/Reporting'));
const Brands = lazy(() => import('./pages/Brands'));
const Products = lazy(() => import('./pages/Products'));
const CustomerProfiles = lazy(() => import('./pages/CustomerProfiles'));
const FacebookCampaigns = lazy(() => import('./pages/FacebookCampaigns'));
const WinningAds = lazy(() => import('./pages/WinningAds'));
const GeneratedAds = lazy(() => import('./pages/GeneratedAds'));
const Research = lazy(() => import('./pages/Research'));
const ResearchSettings = lazy(() => import('./pages/ResearchSettings'));
const BrandScrapes = lazy(() => import('./pages/BrandScrapes'));
const AdRemix = lazy(() => import('./pages/AdRemix'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const GoogleAdsCampaigns = lazy(() => import('./pages/GoogleAdsCampaigns'));
const Overview = lazy(() => import('./pages/Overview'));
const TikTokAdsCampaigns = lazy(() => import('./pages/TikTokAdsCampaigns'));
const PublicInfoPage = lazy(() => import('./pages/PublicInfoPage'));

const LoadingFallback = () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
    </div>
);

function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <BrandProvider>
          <CampaignProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/about" element={<PublicInfoPage page="about" />} />
                  <Route path="/privacy" element={<PublicInfoPage page="privacy" />} />
                  <Route path="/terms" element={<PublicInfoPage page="terms" />} />
                  {/* Stale deep-link guard: /overview was never a route (nav
                      targets the index); redirect instead of rendering a blank
                      SPA fallback. */}
                  <Route path="/overview" element={<Navigate to="/" replace />} />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Layout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Overview />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="research" element={<Research />} />
                    <Route path="research/brand-scrapes" element={<BrandScrapes />} />
                    <Route path="research/settings" element={<ResearchSettings />} />
                    <Route path="build-creatives" element={<CreateAds />} />
                    <Route path="image-ads" element={<ImageAds />} />
                    <Route path="video-ads" element={<VideoAds />} />
                    <Route path="facebook-campaigns" element={<FacebookCampaigns />} />
                    <Route path="google-ads" element={<GoogleAdsCampaigns />} />
                    <Route path="tiktok-ads" element={<TikTokAdsCampaigns />} />
                    <Route path="winning-ads" element={<WinningAds />} />
                    <Route path="generated-ads" element={<GeneratedAds />} />
                    <Route path="brands" element={<Brands />} />
                    <Route path="products" element={<Products />} />
                    <Route path="profiles" element={<CustomerProfiles />} />
                    <Route path="ad-remix" element={<AdRemix />} />
                    <Route path="reporting" element={<Reporting />} />
                    <Route path="settings" element={<Settings />} />
                    <Route
                      path="users"
                      element={
                        <PrivateRoute requiredRole="admin">
                          <UserManagement />
                        </PrivateRoute>
                      }
                    />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </CampaignProvider>
        </BrandProvider>
      </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

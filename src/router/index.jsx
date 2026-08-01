import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import { RequireAuth, RequireGuest, RequirePermission, InitFetch } from './guards';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ProfilePage from '../pages/auth/ProfilePage';
import ProductsPage from '../pages/master/ProductsPage';
import CategoriesPage from '../pages/master/CategoriesPage';
import BrandsPage from '../pages/master/BrandsPage';
import SuppliersPage from '../pages/master/SuppliersPage';
import CustomersPage from '../pages/master/CustomersPage';
import WarehousesPage from '../pages/master/WarehousesPage';
import LocationsPage from '../pages/master/LocationsPage';
import PurchaseOrdersPage from '../pages/transactions/PurchaseOrdersPage';
import GoodsReceiptsPage from '../pages/transactions/GoodsReceiptsPage';
import StockInPage from '../pages/transactions/StockInPage';
import StockOutPage from '../pages/transactions/StockOutPage';
import TransfersPage from '../pages/transactions/TransfersPage';
import AdjustmentsPage from '../pages/transactions/AdjustmentsPage';
import OpnamesPage from '../pages/transactions/OpnamesPage';
import MovementsPage from '../pages/transactions/MovementsPage';
import DashboardPage from '../pages/DashboardPage';
import ReportsPage from '../pages/ReportsPage';
import UsersPage from '../pages/system/UsersPage';
import AuditLogsPage from '../pages/system/AuditLogsPage';
import SettingsPage from '../pages/system/SettingsPage';
import { ForbiddenPage, NotFoundPage } from '../pages/ErrorPages';

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [
      {
        path: '/login',
        element: <AuthLayout />,
        children: [{ index: true, element: <LoginPage /> }],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <InitFetch />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '/403', element: <ForbiddenPage /> },
              { path: '/reports', element: <ReportsPage /> },

              { element: <RequirePermission permission="products:view" />, children: [
                { path: '/products', element: <ProductsPage /> },
              ]},
              { element: <RequirePermission permission="categories:view" />, children: [
                { path: '/categories', element: <CategoriesPage /> },
              ]},
              { element: <RequirePermission permission="brands:view" />, children: [
                { path: '/brands', element: <BrandsPage /> },
              ]},
              { element: <RequirePermission permission="suppliers:view" />, children: [
                { path: '/suppliers', element: <SuppliersPage /> },
              ]},
              { element: <RequirePermission permission="customers:view" />, children: [
                { path: '/customers', element: <CustomersPage /> },
              ]},
              { element: <RequirePermission permission="warehouses:view" />, children: [
                { path: '/warehouses', element: <WarehousesPage /> },
              ]},
              { element: <RequirePermission permission="locations:view" />, children: [
                { path: '/locations', element: <LocationsPage /> },
              ]},

              { element: <RequirePermission permission="purchase_orders:view" />, children: [
                { path: '/purchase-orders', element: <PurchaseOrdersPage /> },
              ]},
              { element: <RequirePermission permission="goods_receipts:view" />, children: [
                { path: '/goods-receipts', element: <GoodsReceiptsPage /> },
              ]},
              { element: <RequirePermission permission="stock_ins:view" />, children: [
                { path: '/stock-in', element: <StockInPage /> },
              ]},
              { element: <RequirePermission permission="stock_outs:view" />, children: [
                { path: '/stock-out', element: <StockOutPage /> },
              ]},
              { element: <RequirePermission permission="transfers:view" />, children: [
                { path: '/transfers', element: <TransfersPage /> },
              ]},
              { element: <RequirePermission permission="adjustments:view" />, children: [
                { path: '/adjustments', element: <AdjustmentsPage /> },
              ]},
              { element: <RequirePermission permission="opnames:view" />, children: [
                { path: '/opnames', element: <OpnamesPage /> },
              ]},
              { element: <RequirePermission permission="movements:view" />, children: [
                { path: '/movements', element: <MovementsPage /> },
              ]},

              { element: <RequirePermission permission="users:view" />, children: [
                { path: '/users', element: <UsersPage /> },
              ]},
              { element: <RequirePermission permission="audit:view" />, children: [
                { path: '/audit-logs', element: <AuditLogsPage /> },
              ]},
              { element: <RequirePermission permission="settings:view" />, children: [
                { path: '/settings', element: <SettingsPage /> },
              ]},

              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

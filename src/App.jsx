import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const BuilderApp = lazy(() => import('./features/form-builder/components/BuilderApp'));
const FormsPage = lazy(() => import('./features/forms-list/FormsPage'));

/**
 * Top-level router. Each route loads its own bundle so the user only pays for
 * the page they actually visit.
 */
export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/" element={<BuilderApp />} />
                    <Route path="/forms" element={<FormsPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

function RouteFallback() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(180deg, #f6f8fc 0%, #eef2f9 100%)',
            }}
        >
            <CircularProgress />
        </Box>
    );
}


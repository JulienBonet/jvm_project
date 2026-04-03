import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home/Home.tsx';
import Artists from '../pages/Artists/Artists.tsx';
import Labels from '../pages/Labels/Labels.tsx';
import NotFound from '../pages/NotFound/NotFound';
import ReleasesByArtist from '../pages/ReleasesByArtist/ReleasesByArtist.tsx';
import ReleasesByLabel from '../pages/ReleasesByLabel/ReleasesByLabel.tsx';
import AdminDashboard from '../pages/Admin/AdminDashboard/AdminDashboard.tsx';
import ReleasesAdmin from '../pages/Admin/ReleasesAdmin/ReleasesAdmin.tsx';
import ArtistsAdmin from '../pages/Admin/ArtistsAdmin/ArtistsAdmin.tsx';
import LabelsAdmin from '../pages/Admin/LabelsAdmin/LabelsAdmin.tsx';
import GenresAdmin from '../pages/Admin/GenresAdmin/GenresAdmin.tsx';
import StylesAdmin from '../pages/Admin/StylesAdmin/StylesAdmin.tsx';
import StatsPage from '../pages/Admin/StatsPage/StatsPage.tsx';
import ProtectedRoute from '../components/ProtectedRoute.tsx';
import Login from '../pages/Login/Login.tsx';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/login', element: <Login /> },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: '/artists',
        element: (
          <ProtectedRoute>
            <Artists />
          </ProtectedRoute>
        ),
      },
      {
        path: '/labels',
        element: (
          <ProtectedRoute>
            <Labels />
          </ProtectedRoute>
        ),
      },
      {
        path: '/artist/:id',
        element: (
          <ProtectedRoute>
            <ReleasesByArtist />
          </ProtectedRoute>
        ),
      },
      {
        path: '/label/:id',
        element: (
          <ProtectedRoute>
            <ReleasesByLabel />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="releases" /> },
          { path: 'releases', element: <ReleasesAdmin /> },
          { path: 'artists', element: <ArtistsAdmin /> },
          { path: 'labels', element: <LabelsAdmin /> },
          { path: 'genres', element: <GenresAdmin /> },
          { path: 'styles', element: <StylesAdmin /> },
          { path: 'stats', element: <StatsPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default router;

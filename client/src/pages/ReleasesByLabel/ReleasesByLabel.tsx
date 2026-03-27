import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ReleaseCard from '../../components/ReleaseCard/ReleaseCard';
import ReleaseDetailDialogDesktop from '../../components/ReleaseDetailDialogDesktop/ReleaseDetailDialogDesktop';
import AdminSnackbar from '../../components/Admin/AdminSnackbar';
import { Release } from '../../types/entities/release.types';
import { useReleaseDetail } from '../../hooks/useReleaseDetail';
import './releasesByLabel.css';

function ReleasesByLabel() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const labelName = location.state?.labelName || 'N/A';

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------------------------
  // HOOK DETAIL RELEASE
  // ---------------------------
  const { selectedRelease, loadingDetail, openDetail, setOpenDetail, fetchSelectedRelease } =
    useReleaseDetail(backendUrl, showSnackbar);

  // ---------------------------
  // STATES
  // ---------------------------
  const [releases, setReleases] = useState<Release[]>([]);
  const [discFilter, setDiscFilter] = useState<'ALL' | '33T' | '45T'>('ALL');
  const [alphaOrder, setAlphaOrder] = useState<'asc' | 'desc' | null>(null);
  const [yearOrder, setYearOrder] = useState<'asc' | 'desc' | null>(null);

  // ---------------------------
  // FETCH RELEASES
  // ---------------------------
  const fetchReleasesByLabel = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/label/${id}/releases`);
      const data = await res.json();
      setReleases(data);
    } catch (err) {
      console.error('Erreur fetch releases:', err);
    }
  };

  useEffect(() => {
    fetchReleasesByLabel();
  }, [id]);

  // recharger aprés update
  const handleReleaseUpdated = async () => {
    // 1️⃣ refetch liste globale
    await fetchReleasesByLabel();

    // 2️⃣ refetch détail de la release ouverte
    if (selectedRelease?.id) {
      await fetchSelectedRelease(selectedRelease.id);
    }
  };

  // ---------------------------
  // FILTER / SORT
  // ---------------------------
  const filteredReleases = releases
    .filter((release) => {
      if (discFilter === '33T') return release.disc_size === '12';
      if (discFilter === '45T') return release.disc_size === '7';
      return true;
    })
    .sort((a, b) => {
      if (alphaOrder)
        return alphaOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      if (yearOrder)
        return yearOrder === 'asc' ? (a.year ?? 0) - (b.year ?? 0) : (b.year ?? 0) - (a.year ?? 0);
      return 0;
    });

  const handleReset = () => {
    setDiscFilter('ALL');
    setAlphaOrder(null);
    setYearOrder(null);
  };

  const handleAlphaSort = () => {
    setAlphaOrder(alphaOrder === 'asc' ? 'desc' : 'asc');
    setYearOrder(null);
  };

  const handleYearSort = () => {
    setYearOrder(yearOrder === 'asc' ? 'desc' : 'asc');
    setAlphaOrder(null);
  };

  // ---------------------------
  // MODAL HANDLERS
  // ---------------------------
  const handleOpenInfo = async (release: Release) => {
    await fetchSelectedRelease(release.id); // le hook gère loading et ouverture
  };

  const handleCloseModal = () => {
    setOpenDetail(false); // fermeture via le hook
  };

  const getSortIcon = (order: 'asc' | 'desc' | null) => {
    if (order === 'asc') return <ArrowUpwardIcon fontSize="small" />;
    if (order === 'desc') return <ArrowDownwardIcon fontSize="small" />;
    return null;
  };

  // ---------------------------
  // LINKS IN MODAL
  // ---------------------------
  const discogsLink = selectedRelease?.links?.find((link) => link.platform === 'discogs')?.url;
  const youtubeLink = selectedRelease?.links?.find((link) => link.platform === 'youtube')?.url;

  // --  SNACKBAR STATES --//

  type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="releases_by_label">
      <section className="search_filter_section_releases_label sticky-section">
        <Link to="/labels">
          <ArrowCircleLeftOutlinedIcon
            fontSize="large"
            color="secondary"
            sx={{ transition: '0.2s', '&:hover': { transform: 'scale(1.1)' } }}
          />
        </Link>

        <Typography sx={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'var(--font-01)' }}>
          {labelName}
        </Typography>

        <div className="filter_btn_releases_label">
          <div>
            <Button
              variant={discFilter === 'ALL' ? 'contained' : 'outlined'}
              onClick={() => setDiscFilter('ALL')}
              sx={{ borderRadius: '5px 0 0 5px' }}
            >
              TOUT
            </Button>
            <Button
              variant={discFilter === '33T' ? 'contained' : 'outlined'}
              onClick={() => setDiscFilter('33T')}
              sx={{ borderRadius: 0 }}
            >
              33T
            </Button>
            <Button
              variant={discFilter === '45T' ? 'contained' : 'outlined'}
              onClick={() => setDiscFilter('45T')}
              sx={{ borderRadius: '0 5px 5px 0' }}
            >
              45T
            </Button>
          </div>

          <div>
            <Button
              variant="outlined"
              onClick={handleAlphaSort}
              sx={{ borderRadius: '5px 0 0 5px', minWidth: 40 }}
            >
              <SortByAlphaIcon /> {getSortIcon(alphaOrder)}
            </Button>
            <Button
              variant="outlined"
              onClick={handleYearSort}
              sx={{ borderRadius: '0 5px 5px 0', minWidth: 40 }}
            >
              <CalendarMonthIcon /> {getSortIcon(yearOrder)}
            </Button>
          </div>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            sx={{ borderRadius: '5px', minWidth: 40 }}
          >
            <RestartAltIcon />
          </Button>
        </div>
      </section>

      <section className="releases_list_section_releases_label">
        {filteredReleases.map((release) => (
          <ReleaseCard
            key={release.id}
            release={release}
            imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
            onClick={handleOpenInfo}
          />
        ))}
      </section>

      {/* MODAL */}
      <ReleaseDetailDialogDesktop
        open={openDetail}
        onClose={handleCloseModal}
        releaseDetail={selectedRelease}
        loadingDetail={loadingDetail}
        imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
        discogsLink={discogsLink}
        youtubeLink={youtubeLink}
        onUpdated={handleReleaseUpdated}
        onSnackbar={showSnackbar}
      />

      <AdminSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </div>
  );
}

export default ReleasesByLabel;

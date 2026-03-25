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
import { Release } from '../../types/entities/release.types';
import { useReleaseDetail } from '../../hooks/useReleaseDetail';
import './releasesByArtist.css';

function ReleasesByArtist() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const artistName = location.state?.artistName || 'N/A';

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;

  // ---------------------------
  // SNACKBAR
  // ---------------------------
  type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------------------------
  // HOOK DETAIL RELEASE
  // ---------------------------
  const { selectedRelease, loadingDetail, openDetail, setOpenDetail, fetchSelectedRelease } =
    useReleaseDetail(backendUrl, showSnackbar);

  // ---------------------------
  // GLOBAL STATES
  // ---------------------------
  const [releases, setReleases] = useState<Release[]>([]);
  const [discFilter, setDiscFilter] = useState<'ALL' | '33T' | '45T'>('ALL');
  const [alphaOrder, setAlphaOrder] = useState<'asc' | 'desc' | null>(null);
  const [yearOrder, setYearOrder] = useState<'asc' | 'desc' | null>(null);

  // ---------------------------
  // FETCH RELEASES
  // ---------------------------
  const fetchReleasesByArtist = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/artist/${id}/releases`);
      const data = await res.json();
      setReleases(data);
    } catch (err) {
      console.error('Erreur fetch releases:', err);
    }
  };

  useEffect(() => {
    fetchReleasesByArtist();
  }, [id]);

  // ---------------------------
  // REFRESH AFTER UPDATE
  // ---------------------------
  const handleReleaseUpdated = async () => {
    await fetchReleasesByArtist();
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
    await fetchSelectedRelease(release.id);
  };

  const handleCloseModal = () => {
    setOpenDetail(false);
  };

  const getSortIcon = (order: 'asc' | 'desc' | null) => {
    if (order === 'asc') return <ArrowUpwardIcon fontSize="small" />;
    if (order === 'desc') return <ArrowDownwardIcon fontSize="small" />;
    return null;
  };

  const discogsLink = selectedRelease?.links?.find((link) => link.platform === 'discogs')?.url;
  const youtubeLink = selectedRelease?.links?.find((link) => link.platform === 'youtube')?.url;

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="releases_by_artist">
      <section className="search_filter_section_releases_artist sticky-section">
        <Link to="/artists">
          <ArrowCircleLeftOutlinedIcon
            fontSize="large"
            color="secondary"
            sx={{ transition: '0.2s', '&:hover': { transform: 'scale(1.1)' } }}
          />
        </Link>

        <Typography sx={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'var(--font-01)' }}>
          {artistName}
        </Typography>

        <div className="filter_btn_releases_artists">
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

      <section className="releases_list_section_releases_artist">
        {filteredReleases.map((release) => (
          <ReleaseCard
            key={release.id}
            release={release}
            imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
            onClick={handleOpenInfo}
          />
        ))}
      </section>

      <ReleaseDetailDialogDesktop
        open={openDetail}
        onClose={handleCloseModal}
        releaseDetail={selectedRelease}
        loadingDetail={loadingDetail}
        imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
        discogsLink={discogsLink}
        youtubeLink={youtubeLink}
        onUpdated={handleReleaseUpdated}
      />
    </div>
  );
}

export default ReleasesByArtist;

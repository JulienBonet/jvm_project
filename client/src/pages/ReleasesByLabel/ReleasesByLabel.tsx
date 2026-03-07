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
import './releasesByLabel.css';
import { Release, ReleaseMDetail } from '../../types/entities/release.types';

function ReleasesByLabel() {
  // -- GLOBAL STATES -- //
  const { id } = useParams<{ id: string }>();
  const [releases, setReleases] = useState<Release[]>([]);

  // -- FILTER STATES -- //
  const [discFilter, setDiscFilter] = useState<'ALL' | '33T' | '45T'>('ALL');
  const [alphaOrder, setAlphaOrder] = useState<'asc' | 'desc' | null>(null);
  const [yearOrder, setYearOrder] = useState<'asc' | 'desc' | null>(null);

  // -- MODAL STATES -- //
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(null);
  const [releaseDetail, setReleaseDetail] = useState<ReleaseMDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  console.info('releases', releases);

  const location = useLocation();
  const labelName = location.state?.labelName || 'N/A';

  const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`;
  const cloudinaryUrl = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}`;

  /* =======================
     FETCH RELEASES
  ======================= */
  const fetchReleasesByLabel = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/label/${id}/releases`);
      const data = await res.json();
      setReleases(data);
    } catch (err) {
      console.error('Erreur fetch releases:', err);
    }
  };

  // useEffect pour charger les données au montage
  useEffect(() => {
    fetchReleasesByLabel();
  }, []);

  /* =======================
     RESET
  ======================= */

  const handleReset = () => {
    setDiscFilter('ALL');
    setAlphaOrder(null);
    setYearOrder(null);
  };

  /* =======================
     SORT TOGGLES
  ======================= */

  const handleAlphaSort = () => {
    if (alphaOrder === 'asc') setAlphaOrder('desc');
    else setAlphaOrder('asc');

    setYearOrder(null);
  };

  const handleYearSort = () => {
    if (yearOrder === 'asc') setYearOrder('desc');
    else setYearOrder('asc');

    setAlphaOrder(null);
  };

  /* =======================
     FILTRE
  ======================= */

  const filteredReleases = releases

    // 💿 Disc Size
    .filter((release) => {
      if (discFilter === '33T') return release.disc_size === '12';
      if (discFilter === '45T') return release.disc_size === '7';
      return true;
    })

    // 🔤 + ⏳ Tri cumulatif
    .sort((a, b) => {
      // 1️⃣ Tri alphabétique
      if (alphaOrder) {
        return alphaOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      // 2️⃣ Tri chronologique
      if (yearOrder) {
        return yearOrder === 'asc' ? (a.year ?? 0) - (b.year ?? 0) : (b.year ?? 0) - (a.year ?? 0);
      }

      // 3️⃣ Pas de tri
      return 0;
    });

  /* =======================
     HANDLERS MODAL
  ======================= */
  const handleOpenInfo = async (release: Release) => {
    setSelectedReleaseId(release.id);
    setOpenModal(true);
    setLoadingDetail(true);

    try {
      const res = await fetch(`${backendUrl}/api/release/${release.id}`);
      const data = await res.json();
      setReleaseDetail(data);
    } catch (err) {
      console.error('Erreur fetch release detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReleaseDetail(null);
    setSelectedReleaseId(null);
  };

  /* =======================
    BUTTONS HELPER
  ======================= */
  const getSortIcon = (order: 'asc' | 'desc' | null) => {
    if (order === 'asc') return <ArrowUpwardIcon fontSize="small" />;
    if (order === 'desc') return <ArrowDownwardIcon fontSize="small" />;
    return null;
  };

  /* =======================
     LINKS IN MODAL
  ======================= */
  const discogsLink = releaseDetail?.links?.find((link) => link.platform === 'discogs')?.url;

  /* =======================
     RENDER
  ======================= */

  return (
    <div className="releases_by_label">
      <section className="search_filter_section_releases_label sticky-section">
        <Link to="/labels">
          <ArrowCircleLeftOutlinedIcon
            fontSize="large"
            color="secondary"
            sx={{
              transition: '0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
              },
            }}
          />
        </Link>

        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'var(--font-01)',
          }}
        >
          {labelName}
        </Typography>

        <div className="filter_btn_releases_label">
          {/* DISC FILTER */}
          <div>
            <Button
              variant={discFilter === 'ALL' ? 'contained' : 'outlined'}
              onClick={() => setDiscFilter('ALL')}
              sx={{
                borderRadius: '5px 0 0 5px',
              }}
            >
              TOUT
            </Button>

            <Button
              variant={discFilter === '33T' ? 'contained' : 'outlined'}
              onClick={() => setDiscFilter('33T')}
              sx={{
                borderRadius: 0,
              }}
            >
              33T
            </Button>

            <Button
              variant={discFilter === '45T' ? 'contained' : 'outlined'}
              onClick={() => setDiscFilter('45T')}
              sx={{
                borderRadius: '0 5px 5px 0',
              }}
            >
              45T
            </Button>
          </div>

          {/* ALPHABETICAL - CHRONOLOGICAL */}
          <div>
            <Button
              variant="outlined"
              onClick={handleAlphaSort}
              sx={{ borderRadius: '5px 0 0 5px', minWidth: 40 }}
            >
              <SortByAlphaIcon />
              {getSortIcon(alphaOrder)}
            </Button>

            <Button
              variant="outlined"
              onClick={handleYearSort}
              sx={{ borderRadius: '0 5px 5px 0', minWidth: 40 }}
            >
              <CalendarMonthIcon />
              {getSortIcon(yearOrder)}
            </Button>
          </div>

          {/* RESET */}
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            sx={{
              borderRadius: '5px',
              minWidth: 40,
            }}
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
        open={openModal}
        onClose={handleCloseModal}
        releaseDetail={releaseDetail}
        loadingDetail={loadingDetail}
        imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
        discogsLink={discogsLink}
      />
      {/* END MODAL */}
    </div>
  );
}

export default ReleasesByLabel;

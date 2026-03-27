// client/src/pages/Home/HomeDesktop.tsx
import { useEffect, useState, useRef } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ReleaseCard from '../../components/ReleaseCard/ReleaseCard';
import ReleaseDetailDialogDesktop from '../../components/ReleaseDetailDialogDesktop/ReleaseDetailDialogDesktop';
import AdminSnackbar from '../../components/Admin/AdminSnackbar';
import { Release, Genre, Style } from '../../types/entities/release.types';
import { useReleaseDetail } from '../../hooks/useReleaseDetail';
import './homeDesktop.css';

function HomeDesktop() {
  const searchRef = useRef<HTMLInputElement | null>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;

  // ---------------------------
  // STATES GLOBAUX
  // ---------------------------
  const [releases, setReleases] = useState<Release[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  // states Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [discFilter, setDiscFilter] = useState<'ALL' | '33T' | '45T'>('ALL');
  const [alphaOrder, setAlphaOrder] = useState<'asc' | 'desc' | null>(null);
  const [yearOrder, setYearOrder] = useState<'asc' | 'desc' | null>(null);
  // state Loading
  const [loadingReleases, setLoadingReleases] = useState(true);

  // ---------------------------
  // SNACKBAR
  // ---------------------------
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
  const showSnackbar = (message: string, severity: SnackbarSeverity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // ---------------------------
  // HOOK DETAIL RELEASE
  // ---------------------------
  const { selectedRelease, loadingDetail, openDetail, setOpenDetail, fetchSelectedRelease } =
    useReleaseDetail(backendUrl, showSnackbar);

  // ---------------------------
  // FETCH RELEASES / GENRES / STYLES
  // ---------------------------
  const fetchReleases = async () => {
    try {
      setLoadingReleases(true);
      const res = await fetch(`${backendUrl}/api/release`);
      const data = await res.json();
      setReleases(data);
    } catch (err) {
      console.error('Erreur fetch releases:', err);
    } finally {
      setLoadingReleases(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/genre`);
      const data = await res.json();
      setGenres(data);
    } catch (err) {
      console.error('Erreur fetch genres:', err);
    }
  };

  const fetchStyles = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/style`);
      const data = await res.json();
      setStyles(data);
    } catch (err) {
      console.error('Erreur fetch styles:', err);
    }
  };

  useEffect(() => {
    fetchReleases();
    fetchGenres();
    fetchStyles();
  }, []);

  // ---------------------------
  // RESET
  // ---------------------------
  const handleReset = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedStyle('');
    setDiscFilter('ALL');
    setAlphaOrder(null);
    setYearOrder(null);
  };

  // ---------------------------
  // SORT TOGGLES
  // ---------------------------
  const handleAlphaSort = () => {
    setAlphaOrder(alphaOrder === 'asc' ? 'desc' : 'asc');
    setYearOrder(null);
  };

  const handleYearSort = () => {
    setYearOrder(yearOrder === 'asc' ? 'desc' : 'asc');
    setAlphaOrder(null);
  };

  // ---------------------------
  // FILTRAGE
  // ---------------------------
  const filteredReleases = releases
    .filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((r) =>
      selectedGenre ? r.genres?.toLowerCase().includes(selectedGenre.toLowerCase()) : true,
    )
    .filter((r) =>
      selectedStyle ? r.styles?.toLowerCase().includes(selectedStyle.toLowerCase()) : true,
    )
    .filter((r) => {
      if (discFilter === '33T') return r.disc_size === '12';
      if (discFilter === '45T') return r.disc_size === '7';
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

  // ---------------------------
  // HANDLERS MODAL
  // ---------------------------
  const handleOpenInfo = async (release: Release) => {
    await fetchSelectedRelease(release.id);
  };

  const handleCloseModal = () => setOpenDetail(false);

  const handleReleaseUpdated = async () => {
    await fetchReleases();
    if (selectedRelease?.id) await fetchSelectedRelease(selectedRelease.id);
  };

  // ---------------------------
  // GET SORT ICON
  // ---------------------------
  const getSortIcon = (order: 'asc' | 'desc' | null) => {
    if (order === 'asc') return <ArrowUpwardIcon fontSize="small" />;
    if (order === 'desc') return <ArrowDownwardIcon fontSize="small" />;
    return null;
  };

  // ---------------------------
  // LINKS
  // ---------------------------
  const discogsLink = selectedRelease?.links?.find((link) => link.platform === 'discogs')?.url;
  const youtubeLink = selectedRelease?.links?.find((link) => link.platform === 'youtube')?.url;

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div className="home-desktop">
      <section className="search_filter_section_desktop sticky-section">
        {/* SEARCH */}
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          inputRef={searchRef}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    searchRef.current?.focus();
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* GENRE SELECT */}
        <FormControl size="small" style={{ minWidth: 150 }} disabled={selectedStyle !== ''}>
          <InputLabel>Genre</InputLabel>
          <Select
            value={selectedGenre}
            label="Genre"
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.name}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* STYLE SELECT */}
        <FormControl size="small" style={{ minWidth: 150 }} disabled={selectedGenre !== ''}>
          <InputLabel>Style</InputLabel>
          <Select
            value={selectedStyle}
            label="Style"
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {styles.map((style) => (
              <MenuItem key={style.id} value={style.name}>
                {style.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* DISC FILTER */}
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

        {/* SORT */}
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
          sx={{ borderRadius: '5px', minWidth: 40 }}
        >
          <RestartAltIcon />
        </Button>
      </section>

      <section className="releases_list_section_desktop">
        {loadingReleases ? (
          <div className="loader" />
        ) : (
          filteredReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
              onClick={handleOpenInfo}
            />
          ))
        )}
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

export default HomeDesktop;

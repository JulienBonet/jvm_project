import { useEffect, useState, useRef } from 'react';
import { TextField, Select, MenuItem, Button, InputLabel, FormControl } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ReleaseCard from '../../components/ReleaseCard/ReleaseCard';
import ReleaseDetailDialogDesktop from '../../components/ReleaseDetailDialogDesktop/ReleaseDetailDialogDesktop';
import './homeDesktop.css';

function HomeDesktop() {
  const searchRef = useRef(null);
  const [releases, setReleases] = useState([]);
  const [genres, setGenres] = useState([]);
  const [styles, setStyles] = useState([]);
  // states filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [discFilter, setDiscFilter] = useState('ALL');
  const [alphaOrder, setAlphaOrder] = useState(null);
  const [yearOrder, setYearOrder] = useState(null);
  // states modal
  const [selectedReleaseId, setSelectedReleaseId] = useState(null);
  const [releaseDetail, setReleaseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  // states loader
  const [loadingReleases, setLoadingReleases] = useState(true);

  console.info('releases', releases);
  console.info('styles', styles);

  const backendUrl = `${import.meta.env.VITE_BACKEND_URL}`;
  const cloudinaryUrl = `${import.meta.env.VITE_CLOUDINARY_BASE_URL}`;

  /* =======================
     FETCHS INITIALS
  ======================= */
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

  /* =======================
     RESET
  ======================= */

  const handleReset = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedStyle('');
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
    // 🔎 Recherche
    .filter((release) => release.title.toLowerCase().includes(searchTerm.toLowerCase()))

    // 🎵 Genre
    .filter((release) =>
      selectedGenre ? release.genres?.toLowerCase().includes(selectedGenre.toLowerCase()) : true,
    )

    // 🎵 Style
    .filter((release) =>
      selectedStyle ? release.styles?.toLowerCase().includes(selectedStyle.toLowerCase()) : true,
    )

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
        return yearOrder === 'asc' ? a.year - b.year : b.year - a.year;
      }

      // 3️⃣ Pas de tri
      return 0;
    });

  /* =======================
     HANDLERS MODAL
  ======================= */
  const handleOpenInfo = async (release) => {
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
  const getSortIcon = (order) => {
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

        {/* GENRE STYLE */}
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
            sx={{
              borderRadius: '5px 0 0 5px',
            }}
            onClick={() => setDiscFilter('ALL')}
          >
            TOUT
          </Button>

          <Button
            variant={discFilter === '33T' ? 'contained' : 'outlined'}
            sx={{
              borderRadius: 0,
            }}
            onClick={() => setDiscFilter('33T')}
          >
            33T
          </Button>

          <Button
            variant={discFilter === '45T' ? 'contained' : 'outlined'}
            sx={{
              borderRadius: '0 5px 5px 0',
            }}
            onClick={() => setDiscFilter('45T')}
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

export default HomeDesktop;

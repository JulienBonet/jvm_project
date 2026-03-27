import { useEffect, useState, useMemo } from 'react';
import {
  TextField,
  Typography,
  TableCell,
  IconButton,
  CircularProgress,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EntityTable from '../../../components/Admin/EntityTable';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReleaseDetailDialogDesktop from '../../../components/ReleaseDetailDialogDesktop/ReleaseDetailDialogDesktop';
import CreateRelease from '../../../components/Admin/CreateRelease';
import DeleteConfirmDialog from '../../../components/Admin/DeleteConfirmDialog.jsx';
import { useReleaseDetail } from '../../../hooks/useReleaseDetail';
import AdminSnackbar from '../../../components/Admin/AdminSnackbar';
import { Release } from '../../../types/entities/release.types';
import '../adminPage.css';

function ReleasesAdmin() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // -- GLOBAL STATES -- //
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // -- CREATE STATES -- //
  const [openCreate, setOpenCreate] = useState<boolean>(false);

  // --  UPDATE / EDIT STATES --/
  const { selectedRelease, loadingDetail, openDetail, setOpenDetail, fetchSelectedRelease } =
    useReleaseDetail(backendUrl, showSnackbar);

  // --  DELETE STATES --//

  const [releaseToDelete, setReleaseToDelete] = useState<Release | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  // --  PAGINATION STATES --//

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  //  FETCH RELEASE
  // ---------------------------
  const fetchReleases = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/api/release`);

      if (!res.ok) throw new Error('Erreur serveur');

      const data = await res.json();
      setReleases(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les releases.');
    } finally {
      setLoading(false);
    }
  };

  // fetch des releases au chargement
  useEffect(() => {
    fetchReleases();
  }, []);

  // recharger aprés update
  const handleReleaseUpdated = async () => {
    // 1️⃣ refetch liste globale
    await fetchReleases();

    // 2️⃣ refetch détail de la release ouverte
    if (selectedRelease?.id) {
      await fetchSelectedRelease(selectedRelease.id);
    }
  };

  // ---------------------------
  //  CREATE
  // ---------------------------
  const handleCloseCreate = () => {
    setOpenCreate(false);
  };

  const handleReleaseCreated = () => {
    fetchReleases();
    setOpenCreate(false);

    showSnackbar('Release créée avec succès', 'success');
  };

  // ---------------------------
  //  DELETE
  // ---------------------------

  const handleDeleteConfirmed = async () => {
    if (!releaseToDelete) return;

    try {
      const res = await fetch(`${backendUrl}/api/release/${releaseToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erreur suppression');

      await fetchReleases();

      showSnackbar('Release supprimée', 'success');

      setConfirmOpen(false);
      setReleaseToDelete(null);
    } catch (err) {
      console.error(err);
      showSnackbar('Erreur delete release', 'error');
    }
  };

  // ---------------------------
  //  PAGINATION & FILTER
  // ---------------------------
  const filteredReleases = useMemo(
    () => releases.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase())),
    [releases, searchTerm],
  );
  const paginatedReleases = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredReleases.slice(start, start + rowsPerPage);
  }, [filteredReleases, page, rowsPerPage]);

  /* =======================
     LINKS IN MODAL
  ======================= */
  const discogsLink = selectedRelease?.links?.find((link) => link.platform === 'discogs')?.url;
  const youtubeLink = selectedRelease?.links?.find((link) => link.platform === 'youtube')?.url;

  // ---------------------------
  //  HELPERS IMAGE
  // ---------------------------
  //   const getArtistAvatarSrc = () => {
  //     if (previewNewImage) return previewNewImage;
  //     if (!newArtist.image_url) return `${cloudinaryUrl}/jvm/artists/00_artist_default`;
  //     if (newArtist.image_url.startsWith('http')) return newArtist.image_url;
  //     return `${cloudinaryUrl}/jvm/artists/${newArtist.image_url}`;
  //   };

  //   const getEditArtistImageSrc = () => {
  //     if (previewEditImage) return previewEditImage;
  //     if (editedArtist?.discogs_image_url) return editedArtist.discogs_image_url;
  //     if (!editedArtist?.image_url) return `${cloudinaryUrl}/jvm/artists/00_artist_default`;
  //     if (editedArtist.image_url.startsWith('http')) return editedArtist.image_url;
  //     return `${cloudinaryUrl}/jvm/artists/${editedArtist.image_url}?t=${Date.now()}`;
  //   };

  // ---------------------------
  //  RENDER
  // ---------------------------
  return (
    <main className="admin_page_main">
      <section className="adminTopSection">
        <Typography
          className="Title-adminTopSection"
          sx={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'var(--font-01)' }}
        >
          Admin Releases
        </Typography>
        <div className="Actions-adminTopSection">
          <TextField
            label="Rechercher un titre"
            variant="outlined"
            size="small"
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              endAdornment: searchTerm && (
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <CloseIcon />
                </IconButton>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="contained"
            sx={{ backgroundColor: 'var(--color-02)' }}
            onClick={() => setOpenCreate(true)}
          >
            <AddCircleOutlineIcon />
          </Button>
        </div>
      </section>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      <EntityTable
        columns={[
          { key: 'id', label: 'ID', width: '5%' },
          { key: 'cover', label: '-', width: '5%' },
          { key: 'title', label: 'TITRE', width: '30%' },
          { key: 'artiste', label: 'ARTISTE', width: '25%' },
          { key: 'type', label: 'TYPE', width: '4%' },
          { key: 'speed', label: 'SPEED', width: '4%' },
        ]}
        data={paginatedReleases}
        totalCount={filteredReleases.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e: unknown, newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
        renderRow={(Release: Release) => (
          <>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">
              {Release.id}
            </TableCell>
            <TableCell sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={`${cloudinaryUrl}/jvm/releases/${Release.image_url}`}
                alt={Release.title}
                style={{ height: 60 }}
              />
            </TableCell>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">
              {Release.title}
            </TableCell>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">
              {Release.artists}
            </TableCell>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">
              {Release.release_type}
            </TableCell>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">
              {Release.disc_speed}
            </TableCell>
          </>
        )}
        onView={(release: Release) => {
          fetchSelectedRelease(release.id);
        }}
        onDelete={(release: Release) => {
          setReleaseToDelete(release);
          setConfirmOpen(true);
        }}
      />

      <ReleaseDetailDialogDesktop
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        releaseDetail={selectedRelease}
        loadingDetail={loadingDetail}
        imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
        discogsLink={discogsLink}
        youtubeLink={youtubeLink}
        onUpdated={handleReleaseUpdated}
        onSnackbar={showSnackbar}
      />

      <CreateRelease
        open={openCreate}
        onClose={handleCloseCreate}
        onCreated={handleReleaseCreated}
        onSnackbar={showSnackbar}
      />

      <DeleteConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        entityName={releaseToDelete?.title}
        label="la release"
      />

      <AdminSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </main>
  );
}

export default ReleasesAdmin;

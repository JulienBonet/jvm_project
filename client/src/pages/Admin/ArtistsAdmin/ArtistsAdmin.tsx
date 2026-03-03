/* eslint-disable consistent-return */
import { useEffect, useState, useMemo } from 'react';
import {
  TextField,
  Typography,
  TableCell,
  IconButton,
  CircularProgress,
  Button,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EntityTable from '../../../components/Admin/EntityTable.jsx';
import EntityCreateModal from '../../../components/Admin/EntityCreateModal.jsx';
import EntityDetailModal from '../../../components/Admin/EntityDetailModal.jsx';
import DeleteConfirmDialog from '../../../components/Admin/DeleteConfirmDialog.jsx';
import AdminSnackbar from '../../../components/Admin/AdminSnackbar.jsx';
import useCrudEntity from '../../../hooks/useCrudEntity';
import '../adminPage.css';

interface Artist {
  id: number;
  name: string;
  sorted_name: string;
  image_url: string;
  release_count: number;
  discogs_id?: number;
  discogs_image_url?: string;
}

interface ArtistForm {
  name: string;
  sorted_name: string;
  image_url: string;
  discogs_id?: number;
}

function ArtistAdmin() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;

  // --  CRUD via hook --//
  const {
    data: artists,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove,
  } = useCrudEntity<Artist>({
    listEndpoint: '/api/artist/admin',
    baseEndpoint: '/api/artist',
  });

  console.info('artists', artists);

  // -- GLOBAL STATES -- //
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // -- CREATE STATES -- //
  const [openCreate, setOpenCreate] = useState(false);
  const [newArtist, setNewArtist] = useState<ArtistForm>({
    name: '',
    sorted_name: '',
    image_url: '',
    discogs_id: undefined,
  });
  const [previewNewImage, setPreviewNewImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [uploadingNew, setUploadingNew] = useState(false);

  // --  UPDATE / EDIT STATES --/
  const [openDetail, setOpenDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedArtist, setEditedArtist] = useState<Artist | null>(null);
  const [previewEditImage, setPreviewEditImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // --  DELETE STATES --//

  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // --  FETCHING EXTERNES STATES --//
  const [fetchingDiscogs, setFetchingDiscogs] = useState(false);

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

  const showSnackbar = (message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ---------------------------
  //  FETCH ARTISTS
  // ---------------------------
  useEffect(() => {
    fetchAll();
  }, []);

  // ---------------------------
  //  FETCH FROM DISCOGS
  // ---------------------------
  const handleFetchFromDiscogs = async () => {
    if (!newArtist.discogs_id) return;

    try {
      setFetchingDiscogs(true);
      const res = await fetch(`${backendUrl}/api/artist/discogs-preview/${newArtist.discogs_id}`);
      if (!res.ok) throw new Error('Erreur Discogs');

      const data = await res.json();

      setNewArtist((prev) => ({
        ...prev,
        name: data.name || '',
        sorted_name: data.sorted_name || '',
        image_url: data.image_url || '',
      }));

      if (data.image_url) setPreviewNewImage(data.image_url);
    } catch (err) {
      console.error(err);
      showSnackbar('Erreur récupération Discogs', 'error');
    } finally {
      setFetchingDiscogs(false);
    }
  };

  const handleFetchDiscogsForEdit = async () => {
    if (!editedArtist || !editedArtist.discogs_id) return;

    try {
      setFetchingDiscogs(true);
      const res = await fetch(
        `${backendUrl}/api/artist/discogs-preview/${editedArtist.discogs_id}`,
      );
      if (!res.ok) throw new Error('Erreur Discogs');

      const discogsData = await res.json();

      setEditedArtist({
        ...editedArtist,
        name: discogsData.name ?? editedArtist.name,
        sorted_name: discogsData.sorted_name ?? editedArtist.sorted_name,
        discogs_image_url: discogsData.image_url ?? editedArtist.discogs_image_url,
      });

      if (discogsData.image_url) setPreviewEditImage(discogsData.image_url);
    } catch (err) {
      console.error(err);
      showSnackbar('Erreur récupération Discogs', 'error');
    } finally {
      setFetchingDiscogs(false);
    }
  };

  // ---------------------------
  //  CREATE ARTIST
  // ---------------------------
  const handleCreate = async () => {
    try {
      setUploadingNew(true);
      const formData = new FormData();
      formData.append('name', newArtist.name);
      formData.append('sorted_name', newArtist.sorted_name);

      if (newArtist.discogs_id !== undefined) {
        formData.append('discogs_id', String(newArtist.discogs_id));
      }
      if (newImageFile) formData.append('file', newImageFile);
      if (!newImageFile && newArtist.image_url?.startsWith('http')) {
        formData.append('discogs_image_url', newArtist.image_url);
      }

      await create(formData);
      console.info('formData', formData);
      showSnackbar('Artiste créé avec succès', 'success');

      setOpenCreate(false);
      setNewArtist({
        name: '',
        sorted_name: '',
        image_url: '',
        discogs_id: undefined,
      });
      console.info('newArtist', newArtist);
      setPreviewNewImage(null);
      setNewImageFile(null);
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Erreur inconnue', 'error');
      }
    } finally {
      setUploadingNew(false);
    }
  };

  const handleNewImageUpload = (file: File | null) => {
    if (!file) return;
    setNewImageFile(file);
    setPreviewNewImage(URL.createObjectURL(file));
  };

  // ---------------------------
  //  UPDATE ARTIST
  // ---------------------------
  const handleUpdate = async () => {
    if (!editedArtist) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('name', editedArtist.name);
      formData.append('sorted_name', editedArtist.sorted_name);

      if (editedArtist.discogs_id !== undefined) {
        formData.append('discogs_id', String(editedArtist.discogs_id));
      }
      if (editedArtist.discogs_image_url && !newImageFile) {
        formData.append('discogs_image_url', editedArtist.discogs_image_url);
      }
      if (newImageFile) formData.append('file', newImageFile);

      const data = await update(editedArtist.id, formData);

      // setEditedArtist((prev) => ({
      //   ...prev,
      //   image_url: data.image_filename || prev.image_url,
      // }));

      setEditedArtist(data);

      setPreviewEditImage(null);
      setNewImageFile(null);
      setEditMode(false);
      showSnackbar('Artiste mis à jour', 'success');
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Erreur inconnue', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageUpload = (file: File | null) => {
    if (!file) return;
    setNewImageFile(file);
    setPreviewEditImage(URL.createObjectURL(file));
  };

  // ---------------------------
  //  DELETE ARTIST
  // ---------------------------
  const handleDeleteConfirmed = async () => {
    if (!artistToDelete) return;
    try {
      await remove(artistToDelete.id);
      showSnackbar('Artiste supprimé', 'success');
      setConfirmOpen(false);
      setArtistToDelete(null);
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Erreur inconnue', 'error');
      }
    }
  };

  // ---------------------------
  //  PAGINATION & FILTER
  // ---------------------------
  const filteredArtists = useMemo(
    () => artists.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [artists, searchTerm],
  );
  const paginatedArtists = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredArtists.slice(start, start + rowsPerPage);
  }, [filteredArtists, page, rowsPerPage]);

  // ---------------------------
  //  HELPERS IMAGE
  // ---------------------------
  const getArtistAvatarSrc = () => {
    if (previewNewImage) return previewNewImage;
    if (!newArtist.image_url) return `${cloudinaryUrl}/jvm/artists/00_artist_default`;
    if (newArtist.image_url.startsWith('http')) return newArtist.image_url;
    return `${cloudinaryUrl}/jvm/artists/${newArtist.image_url}`;
  };

  const getEditArtistImageSrc = () => {
    if (previewEditImage) return previewEditImage;
    if (!editedArtist?.image_url) return `${cloudinaryUrl}/jvm/artists/00_artist_default`;
    if (editedArtist.image_url.startsWith('http')) return editedArtist.image_url;
    return `${cloudinaryUrl}/jvm/artists/${editedArtist.image_url}?t=${Date.now()}`;
  };

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
          Admin Artistes
        </Typography>
        <div className="Actions-adminTopSection">
          <TextField
            label="Rechercher un artiste"
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
            Créer Artiste
          </Button>
        </div>
      </section>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      <EntityTable
        columns={[
          { key: 'id', label: 'ID', width: '5%' },
          { key: 'avatar', label: '-', width: '5%' },
          { key: 'name', label: 'NOM', width: '35%' },
          { key: 'sorted_name', label: 'SORTED_N', width: '35%' },
          { key: 'release_count', label: 'RELEASES', width: '10%' },
        ]}
        data={paginatedArtists}
        totalCount={filteredArtists.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e: unknown, newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
        renderRow={(artist: Artist) => (
          <>
            <TableCell>{artist.id}</TableCell>
            <TableCell>
              <Avatar src={`${cloudinaryUrl}/jvm/artists/${artist.image_url}`} />
            </TableCell>
            <TableCell align="center">{artist.name}</TableCell>
            <TableCell align="center">{artist.sorted_name}</TableCell>
            <TableCell align="center">{artist.release_count}</TableCell>
          </>
        )}
        onView={(artist: Artist) => {
          setSelectedArtist(artist);
          setEditedArtist({ ...artist });
          setPreviewEditImage(null);
          setOpenDetail(true);
          setEditMode(false);
        }}
        onDelete={(artist: Artist) => {
          setArtistToDelete(artist);
          setConfirmOpen(true);
        }}
      />

      <EntityCreateModal
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          setPreviewNewImage(null);
        }}
        onSubmit={handleCreate}
        title="Créer un Artiste"
        formData={newArtist}
        setFormData={setNewArtist}
        getImageSrc={getArtistAvatarSrc}
        onImageUpload={handleNewImageUpload}
        onFetchExternal={handleFetchFromDiscogs}
        uploading={uploadingNew}
        fetching={fetchingDiscogs}
      />

      <EntityDetailModal
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setPreviewEditImage(null);
          setEditMode(false);
        }}
        title="Détails Artiste"
        entity={editedArtist}
        setEntity={setEditedArtist}
        editMode={editMode}
        setEditMode={setEditMode}
        getImageSrc={getEditArtistImageSrc}
        onEditImageUpload={handleEditImageUpload}
        onFetchExternal={handleFetchDiscogsForEdit}
        onSave={handleUpdate}
        uploading={uploading}
        fetching={fetchingDiscogs}
      />

      <DeleteConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirmed}
        entityName={artistToDelete?.name}
        label="l’artiste"
      />

      <AdminSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </main>
  );
}

export default ArtistAdmin;

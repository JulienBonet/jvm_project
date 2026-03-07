import { useEffect, useState, useMemo } from 'react';
import {
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Button,
  TableCell,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EntityTable from '../../../components/Admin/EntityTable';
import EntityCreateModal from '../../../components/Admin/EntityCreateModal02.jsx';
import EntityDetailModal from '../../../components/Admin/EntityDetailModal02.jsx';
import DeleteConfirmDialog from '../../../components/Admin/DeleteConfirmDialog';
import AdminSnackbar from '../../../components/Admin/AdminSnackbar';
import '../adminPage.css';
import { Genre} from '../../../types/entities/release.types';

function GenresAdmin() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // -- GLOBAL STATES -- //
  const [genres, setGenres] = useState<Genre[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // -- CREATE STATES -- //
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [newGenre, setNewGenre] = useState<string>('');

  // --  UPDATE / EDIT STATES --/
  const [originalGenre, setOriginalGenre] = useState<Genre | null>(null);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');

  // --  DELETE STATES --//
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [genreToDelete, setGenreToDelete] = useState<Genre | null>(null);

  // --  PAGINATION STATES --//
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

  /* =======================
     FETCH
  ======================= */

  const fetchGenres = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/api/genre/orderbyid`);

      if (!res.ok) throw new Error('Erreur serveur');

      const data = await res.json();
      setGenres(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les genres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  /* =======================
     CREATE 
  ======================= */

  const handleCreate = async () => {
    if (!newGenre.trim()) return;

    try {
      const res = await fetch(`${backendUrl}/api/genre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGenre }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur save');

      showSnackbar(`Genre "${newGenre}" créé avec succès !`, 'success');
      setNewGenre('');
      setOpenCreate(false);
      fetchGenres(); // refresh automatique
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Impossible de créer le genre.', 'error');
      }
    }
  };

  /* =======================
     UPDATE
  ======================= */

  const startEdit = () => {
    setOriginalGenre(selectedGenre);
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (!originalGenre) return;
    setEditedName(originalGenre.name);
    setEditMode(false);
  };

  const handleUpdate = async () => {
    if (!editedName.trim()) return;
    if (!selectedGenre) return;

    try {
      const res = await fetch(`${backendUrl}/api/genre/${selectedGenre.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur update');

      fetchGenres();
      setSelectedGenre((prev) => {
        if (!prev) return prev;
        return { ...prev, name: editedName };
      });
      setEditMode(false);
      showSnackbar(`Genre mis à jour en "${editedName}" !`, 'success');
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Impossible de modifier le genre.', 'error');
      }
    }
  };

  /* =======================
     DELETE
  ======================= */

  const handleDeleteConfirmed = async (id: number) => {
    try {
      const res = await fetch(`${backendUrl}/api/genre/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur suppression');

      showSnackbar(`Genre supprimé !`, 'success');
      fetchGenres();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Impossible de supprimer le genre.', 'error');
      }
    }
  };

  /* =======================
     FILTRAGE + PAGINATION
  ======================= */
  const filteredGenres = useMemo(() => {
    return genres.filter((style) => style.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [genres, searchTerm]);

  const paginatedGenres = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredGenres.slice(start, start + rowsPerPage);
  }, [filteredGenres, page, rowsPerPage]);

  /* =======================
     RENDER
  ======================= */

  return (
    <main className="admin_page_main">
      <section className="adminTopSection">
        <Typography
          className="Title-adminTopSection"
          sx={{
            fontSize: 24,
            fontWeight: 'bold',
            fontFamily: 'var(--font-01)',
          }}
        >
          Admin Genres
        </Typography>
        <div className="Actions-adminTopSection">
          {/* searchbar */}
          <TextField
            label="Rechercher un genre"
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
          {/* create BTN */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: 'var(--color-02)',
            }}
            onClick={() => setOpenCreate(true)}
          >
            Créer Genre
          </Button>
        </div>
      </section>

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      <EntityTable
        columns={[
          { key: 'id', label: 'ID', width: '10%' },
          { key: 'name', label: 'NOM', width: '80%' },
        ]}
        data={paginatedGenres}
        totalCount={filteredGenres.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e: unknown, newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
        renderRow={(genre: Genre) => (
          <>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">{genre.id}</TableCell>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">{genre.name}</TableCell>
          </>
        )}
        onView={(genre: Genre) => {
          setSelectedGenre(genre);
          setOpenDetail(true);
          setEditMode(false);
        }}
        onDelete={(genre: Genre) => {
          setGenreToDelete(genre);
          setConfirmOpen(true);
        }}
      />

      <EntityCreateModal
        open={openCreate}
        title="Créer un genre"
        label="Nom du genre"
        newValue={newGenre}
        setOpenCreate={setOpenCreate}
        setNewValue={setNewGenre}
        handleCreate={handleCreate}
      />

      <EntityDetailModal
        open={openDetail}
        setOpenDetail={setOpenDetail}
        title="Genre Details"
        label="Nom du genre"
        editMode={editMode}
        selectedItem={selectedGenre}
        editedName={editedName}
        setEditedName={setEditedName}
        handleUpdate={handleUpdate}
        startEdit={startEdit}
        cancelEdit={cancelEdit}
      />

      <DeleteConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (!genreToDelete) return;
          handleDeleteConfirmed(genreToDelete.id);
          setConfirmOpen(false);
        }}
        entityName={genreToDelete?.name}
        label="le genre"
      />

      <AdminSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </main>
  );
}

export default GenresAdmin;

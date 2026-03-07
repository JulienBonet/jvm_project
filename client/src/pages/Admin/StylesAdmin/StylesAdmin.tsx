import { useEffect, useState, useMemo } from 'react';
import { TextField, Typography, IconButton, CircularProgress, Button, TableCell  } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EntityTable from '../../../components/Admin/EntityTable';
import EntityCreateModal from '../../../components/Admin/EntityCreateModal02.jsx';
import EntityDetailModal from '../../../components/Admin/EntityDetailModal02.jsx';
import DeleteConfirmDialog from '../../../components/Admin/DeleteConfirmDialog';
import AdminSnackbar from '../../../components/Admin/AdminSnackbar';
import '../adminPage.css';
import { Style} from '../../../types/entities/release.types';

function StylesAdmin() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // -- GLOBAL STATES -- //
  const [styles, setStyles] = useState<Style[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // -- CREATE STATES -- //
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [newStyle, setNewStyle] = useState<string>('');

  // --  UPDATE / EDIT STATES --/
  const [originalStyle, setOriginalStyle] = useState<Style | null>(null);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');

  // --  DELETE STATES --//
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [styleToDelete, setStyleToDelete] = useState<Style | null>(null);

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
  const fetchStyles = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/api/style/orderbyid`);

      if (!res.ok) throw new Error('Erreur serveur');

      const data = await res.json();
      setStyles(data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les styles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  /* =======================
     CREATE 
  ======================= */

  const handleCreate = async () => {
    if (!newStyle.trim()) return;

    try {
      const res = await fetch(`${backendUrl}/api/style`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newStyle }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur save');

      showSnackbar(`Genre "${newStyle}" créé avec succès !`, 'success');
      setNewStyle('');
      setOpenCreate(false);
      fetchStyles(); // refresh automatique
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Impossible de créer le style.', 'error');
      }
    }
  };

  /* =======================
     UPDATE
  ======================= */
  const startEdit = () => {
    if (!selectedStyle) return;
    setOriginalStyle(selectedStyle);
    setEditedName(selectedStyle.name);
    setEditMode(true);
  };

  const cancelEdit = () => {
    if (!originalStyle) return;
    setEditedName(originalStyle.name);
    setEditMode(false);
  };

  const handleUpdate = async () => {
    if (!editedName.trim()) return;
    if (!selectedStyle) return;

    try {
      const res = await fetch(`${backendUrl}/api/style/${selectedStyle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur update');

      fetchStyles();
      setSelectedStyle((prev) => {
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
        showSnackbar('Impossible de modifier le style.', 'error');
      }
    }
  };

  /* =======================
     DELETE
  ======================= */

  const handleDeleteConfirmed = async (id: number) => {
    try {
      const res = await fetch(`${backendUrl}/api/style/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur suppression');

      showSnackbar(`Style supprimé !`, 'success');
      fetchStyles();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('Impossible de supprimer le style.', 'error');
      }
    }
  };

  /* =======================
     FILTRAGE + PAGINATION
  ======================= */

  const filteredStyles = useMemo(() => {
    return styles.filter((style) => style.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [styles, searchTerm]);

  const paginatedStyles = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredStyles.slice(start, start + rowsPerPage);
  }, [filteredStyles, page, rowsPerPage]);

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
          Admin Styles
        </Typography>
        <div className="Actions-adminTopSection">
          {/* searchbar */}
          <TextField
            label="Rechercher un style"
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
            Créer style
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
        data={paginatedStyles}
        totalCount={paginatedStyles.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_e: unknown, newPage: number) => setPage(newPage)}
        onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRowsPerPage(parseInt(e.target.value, 10))
        }
        renderRow={(style: Style) => (
          <>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">{style.id}</TableCell>
            <TableCell sx={{ fontFamily: 'var(--font-02)', fontSize: 'medium' }} align="center">{style.name}</TableCell>
          </>
        )}
        onView={(style: Style) => {
          setSelectedStyle(style);
          setOpenDetail(true);
          setEditMode(false);
        }}
        onDelete={(style: Style) => {
          setStyleToDelete(style);
          setConfirmOpen(true);
        }}
      />

      <EntityCreateModal
        open={openCreate}
        title="Créer un Style"
        label="Nom du Style"
        newValue={newStyle}
        setOpenCreate={setOpenCreate}
        setNewValue={setNewStyle}
        handleCreate={handleCreate}
      />

      <EntityDetailModal
        open={openDetail}
        setOpenDetail={setOpenDetail}
        title="Style Details"
        label="Nom du style"
        editMode={editMode}
        selectedItem={selectedStyle}
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
          if (!styleToDelete) return;
          handleDeleteConfirmed(styleToDelete.id);
          setConfirmOpen(false);
        }}
        entityName={styleToDelete?.name}
        label="le style"
      />

      <AdminSnackbar snackbar={snackbar} setSnackbar={setSnackbar} />
    </main>
  );
}

export default StylesAdmin;

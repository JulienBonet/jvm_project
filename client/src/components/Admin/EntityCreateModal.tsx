// > ENTITY CREATE MODAL : artists & label //
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { BaseEntityForm } from '../../types/entities';

interface EntityCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  formData: BaseEntityForm;
  setFormData: React.Dispatch<React.SetStateAction<BaseEntityForm>>;
  getImageSrc: () => string;
  onImageUpload: (file: File) => void;
  onFetchExternal: () => void;
  uploading?: boolean;
  fetching?: boolean;
}

function EntityCreateModal({
  open,
  onClose,
  onSubmit,
  title,
  formData,
  setFormData,
  getImageSrc,
  onImageUpload,
  onFetchExternal,
  uploading = false,
  fetching = false,
}: EntityCreateModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src={getImageSrc()} alt="Preview" style={{ width: '200px', height: '200px' }} />
        </Box>

        <TextField
          label="Discogs ID"
          type="number"
          fullWidth
          sx={{ mb: 1 }}
          value={formData.discogs_id || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              discogs_id: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />

        <Button
          variant="outlined"
          onClick={onFetchExternal}
          disabled={!formData.discogs_id || fetching}
          sx={{ mb: 1, mr: 1 }}
        >
          {fetching ? 'Récupération...' : 'Remplir depuis Discogs'}
        </Button>

        <TextField
          label="Name"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <TextField
          label="Sorted Name"
          fullWidth
          sx={{ mb: 2 }}
          value={formData.sorted_name || ''}
          onChange={(e) => setFormData({ ...formData, sorted_name: e.target.value })}
        />

        <Button variant="outlined" component="label" sx={{ mb: 2 }}>
          Upload image
          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              onImageUpload(file);
            }}
          />
        </Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: 'var(--color-02)' }}
          onClick={onSubmit}
          disabled={uploading}
        >
          {uploading ? 'Upload en cours…' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EntityCreateModal;

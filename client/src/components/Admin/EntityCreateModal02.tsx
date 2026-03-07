// > ENTITY CREATE MODAL : Genre & Style //
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface EntityCreateModalProps {
  open: boolean;
  title: string;
  label: string;
  newValue: string;
  setOpenCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setNewValue: React.Dispatch<React.SetStateAction<string>>;
  handleCreate: () => void;
}

function EntityCreateModal02({
  open,
  title,
  label,
  newValue,
  setOpenCreate,
  setNewValue,
  handleCreate,
}: EntityCreateModalProps) {
  return (
    <Dialog open={open} onClose={() => setOpenCreate(false)}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label={label}
          fullWidth
          variant="outlined"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button
          sx={{ color: 'var(--color-02)' }}
          onClick={() => {
            setOpenCreate(false);
            setNewValue('');
          }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: 'var(--color-02)',
          }}
          onClick={handleCreate}
        >
          Créer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default EntityCreateModal02;

// client\src\components\ReleaseDetailDialogDesktop\ReleaseDetailDialogDesktop.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import ReleaseDetailView from './ReleaseDetailView';
import ReleaseEditForm from './ReleaseEditForm';

import { ReleaseMDetail } from '../../types/entities/release.types';

interface ReleaseDetailDialogDesktopProps {
  open: boolean;
  onClose: () => void;
  releaseDetail: ReleaseMDetail | null;
  loadingDetail: boolean;
  imageBaseUrl: string;
  discogsLink?: string;
  youtubeLink?: string;
  onUpdated: () => void;
}

function ReleaseDetailDialogDesktop({
  open,
  onClose,
  releaseDetail,
  loadingDetail,
  imageBaseUrl,
  discogsLink,
  youtubeLink,
  onUpdated,
}: ReleaseDetailDialogDesktopProps) {
  const [mode, setMode] = useState<'read' | 'edit'>('read');

  const handleClose = () => {
    setMode('read'); // reset mode
    onClose();
  };

  const handleEdit = () => setMode('edit');
  const handleCancelEdit = () => setMode('read');

  const handleUpdated = () => {
    setMode('read');
    onUpdated();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{padding: '26px 24px'}}>
        <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {mode === 'read' ? (
          <ReleaseDetailView
            releaseDetail={releaseDetail}
            loadingDetail={loadingDetail}
            imageBaseUrl={imageBaseUrl}
            discogsLink={discogsLink}
            youtubeLink={youtubeLink}
            onEdit={handleEdit}
          />
        ) : (
          <ReleaseEditForm
            releaseDetail={releaseDetail}
            imageBaseUrl={imageBaseUrl}
            onCancel={handleCancelEdit}
            onUpdated={handleUpdated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReleaseDetailDialogDesktop;
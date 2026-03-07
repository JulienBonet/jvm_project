/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DiscogsLogo from '../../../assets/images/Discogs.png';
import { ReleaseMDetail } from '../../../types/entities/release.types';
import { Track } from '../../../types/entities/track.types';

interface ReleaseDetailDialogMobileProps {
  open: boolean;
  onClose: () => void;
  releaseDetail: ReleaseMDetail | null;
  loadingDetail: boolean;
  imageBaseUrl: string;
  discogsLink?: string;
  tracks?: Track[];
}

function ReleaseDetailDialogMobile({
  open,
  onClose,
  releaseDetail,
  loadingDetail,
  imageBaseUrl,
  discogsLink,
}: ReleaseDetailDialogMobileProps) {
  if (!releaseDetail) return null;

  const firstTrack = releaseDetail.tracks?.[0];

  // variable pour les blocs disc - track de la release //
  const groupedTracks = releaseDetail.tracks?.reduce<Record<number, Track[]>>((acc, track) => {
    const disc = track.disc_number;

    acc[disc] ??= []; // initialise si undefined
    acc[disc].push(track);

    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {releaseDetail?.title}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loadingDetail && <CircularProgress />}

        {!loadingDetail && releaseDetail && (
          <>
            {/* Cover */}
            {releaseDetail.cover?.[0]?.image_url && (
              <img
                src={`${imageBaseUrl}/${releaseDetail.cover[0].image_url}`}
                alt={releaseDetail.title}
                style={{ width: '100%', marginBottom: 16 }}
              />
            )}

            <Typography gutterBottom>
              <Typography component="span" fontWeight="bold">
                Artistes:
              </Typography>{' '}
              {releaseDetail.artists.map((a) => a.name).join(', ')}
            </Typography>

            <Typography gutterBottom>
              <Typography component="span" fontWeight="bold">
                Labels:
              </Typography>{' '}
              {releaseDetail.labels.map((l) => `${l.name} (${l.catalog_number})`).join(', ')}
            </Typography>

            {releaseDetail.genres && (
              <Typography gutterBottom>
                <Typography component="span" fontWeight="bold">
                  Genres:
                </Typography>{' '}
                {releaseDetail.genres.map((g) => g.name).join(', ')}
              </Typography>
            )}

            {releaseDetail.styles?.length && (
              <Typography gutterBottom>
                <Typography component="span" fontWeight="bold">
                  Styles:
                </Typography>{' '}
                {releaseDetail.styles.map((s) => s.name).join(', ')}
              </Typography>
            )}

            {releaseDetail.year && releaseDetail.year > 0 && (
              <Typography gutterBottom>
                <Typography component="span" fontWeight="bold">
                  Année:
                </Typography>{' '}
                {releaseDetail.year}
              </Typography>
            )}

            {releaseDetail.country && (
              <Typography gutterBottom>
                <Typography component="span" fontWeight="bold">
                  Pays:
                </Typography>{' '}
                {releaseDetail.country}
              </Typography>
            )}

            {releaseDetail.barcode && (
              <Typography gutterBottom>
                <Typography component="span" fontWeight="bold">
                  Barcode:
                </Typography>{' '}
                {releaseDetail.barcode}
              </Typography>
            )}

            <Typography gutterBottom>
              <Typography component="span" fontWeight="bold">
                Type:
              </Typography>{' '}
              {releaseDetail.release_type && `${releaseDetail.release_type}`}{' '}
              {firstTrack?.size && ` / ${firstTrack.size}`}
              {firstTrack?.speed && ` / ${firstTrack.speed} RPM`}
            </Typography>

            {/* Tracklist */}
            {groupedTracks && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Tracklist
                </Typography>

                {Object.entries(groupedTracks).map(([discNumber, tracks]) => (
                  <div key={discNumber}>
                    <Typography variant="subtitle1" gutterBottom sx={{ marginTop: '5px' }}>
                      Disc {discNumber}
                    </Typography>

                    {tracks.map((track) => (
                      <Typography key={`${track.disc_number}-${track.position}`} variant="body2">
                        {track.position} - {track.title}
                      </Typography>
                    ))}
                  </div>
                ))}
              </>
            )}

            {releaseDetail.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {releaseDetail.notes}
                </Typography>
              </>
            )}

            {discogsLink && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <IconButton
                    component="a"
                    href={discogsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={DiscogsLogo} alt="Discogs" style={{ height: 40 }} />
                  </IconButton>
                </Box>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReleaseDetailDialogMobile;

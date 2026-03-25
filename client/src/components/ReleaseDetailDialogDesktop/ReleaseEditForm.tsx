// client\src\components\ReleaseDetailDialogDesktop\ReleaseEditForm.tsx
import { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Stack,
  MenuItem,
  Button,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import EntitySelector from '../Admin/EntitySelector';
import {
  ReleaseMDetail,
  ReleaseFormState,
  DiscFormState,
  DiscogsRelease,
  Entity,
} from '../../types/entities/release.types';
import { createTrack } from '../../types/entities/track.types';

interface ReleaseEditFormProps {
  releaseDetail: ReleaseMDetail | null;
  imageBaseUrl: string;
  onCancel: () => void;
  onUpdated: () => void;
  onSnackbar?: (msg: string, type?: 'success' | 'error') => void;
}

function ReleaseEditForm({
  releaseDetail,
  imageBaseUrl,
  onCancel,
  onUpdated,
  onSnackbar,
}: ReleaseEditFormProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const releaseTypes = ['LP', 'Album', 'Single', 'EP', 'Maxi-Single', 'Mini-Album'];
  const releaseSizes = ['7', '10', '12'];
  const releaseSpeeds = ['33', '45', '78'];

  // -----------------------
  // STATES
  // -----------------------
  const [release, setRelease] = useState<ReleaseFormState>({
    title: '',
    year: '',
    country: '',
    barcode: '',
    release_type: '',
    notes: '',
    image_url: '',
    discogs_id: null,
    discogs_image_url: undefined,
  });

  const [artists, setArtists] = useState<Entity[]>([]);
  const [labels, setLabels] = useState<Entity[]>([]);
  const [genres, setGenres] = useState<Entity[]>([]);
  const [styles, setStyles] = useState<Entity[]>([]);

  const [tracks, setTracks] = useState<createTrack[]>([]);
  const [disc, setDisc] = useState<DiscFormState>({
    format: '',
    size: '',
    speed: '',
  });

  const [discogsLink, setDiscogLink] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [initialCover, setInitialCover] = useState('');

  const [loading, setLoading] = useState(false);

  console.info('releaseDetail in edit', releaseDetail);

  // -----------------------
  // PREFILL 🔥
  // -----------------------
  useEffect(() => {
    if (!releaseDetail) return;

    const firstTrack = releaseDetail?.tracks?.[0];
    const coverUrl = releaseDetail?.cover?.[0]?.image_url
      ? `${imageBaseUrl}/${releaseDetail.cover[0].image_url}`
      : '';
    setInitialCover(coverUrl);

    setRelease({
      title: releaseDetail.title || '',
      year: releaseDetail.year ? String(releaseDetail.year) : '',
      country: releaseDetail.country || '',
      barcode: releaseDetail.barcode || '',
      release_type: releaseDetail.release_type || '',
      notes: releaseDetail.notes || '',
      image_url: coverUrl || '',
      discogs_image_url: '',
      discogs_id: releaseDetail.discogs_id ?? null,
    });

    setArtists(releaseDetail.artists || []);
    setLabels(releaseDetail.labels || []);
    setGenres(releaseDetail.genres || []);
    setStyles(releaseDetail.styles || []);
    setTracks(
      releaseDetail.tracks?.map((t) => ({
        position: t.position,
        title: t.title,
        duration: '',
      })) ?? [],
    );

    setDisc({
      format: releaseDetail.release_type || '',
      size: firstTrack?.size ? String(firstTrack.size) : '',
      speed: firstTrack?.speed ? String(firstTrack.speed) : '',
    });

    setDiscogLink(releaseDetail.links?.find((l) => l.platform === 'discogs')?.url || '');

    setYoutubeLink(releaseDetail.links?.find((l) => l.platform === 'youtube')?.url || '');
  }, [releaseDetail]);

  // -----------------------
  // COVER PREVIEW 🔥
  // -----------------------
  useEffect(() => {
    let objectUrl: string | undefined;

    if (coverFile) {
      objectUrl = URL.createObjectURL(coverFile);
      setCoverPreview(objectUrl);
    } else if (release.discogs_image_url) {
      setCoverPreview(release.discogs_image_url);
    } else if (release.image_url) {
      setCoverPreview(release.image_url);
    } else {
      setCoverPreview(`${imageBaseUrl}/00_release_default`);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile, release, imageBaseUrl]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverFile(file);
  };

  const removeCover = () => {
    setCoverFile(null);
    setRelease((prev) => ({
      ...prev,
      image_url: initialCover,
      discogs_image_url: '',
    }));
  };

  // -----------------------
  // TRACKS
  // -----------------------
  const updateTrack = (index: number, field: keyof createTrack, value: string) => {
    const updated = [...tracks];
    if (!updated[index]) return;
    updated[index][field] = value;
    setTracks(updated);
  };

  const addTrack = () => {
    setTracks([...tracks, { position: '', title: '', duration: '' }]);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  // -----------------------
  // DISCOGS IMPORT 🔥
  // -----------------------
  const populateRelease = (data: DiscogsRelease) => {
    const barcode = data.identifiers?.find((id) => id.type === 'Barcode')?.value ?? '';

    setRelease((prev) => ({
      ...prev,
      title: data.title ?? '',
      year: data.year ? String(data.year) : '',
      country: data.country ?? '',
      barcode: barcode.replace(/\s/g, ''),
      notes: data.notes ?? '',
      discogs_image_url: data.images?.[0]?.uri ?? '',
    }));

    setArtists(
      data.artists?.map((a) => ({
        name: a.name,
        discogs_id: a.id,
        thumbnail_url: a.thumbnail_url,
      })) ?? [],
    );

    setLabels(
      data.labels?.map((l) => ({
        name: l.name,
        discogs_id: l.id,
        thumbnail_url: l.thumbnail_url,
      })) ?? [],
    );

    setGenres(data.genres?.map((g) => ({ name: g })) ?? []);
    setStyles(data.styles?.map((s) => ({ name: s })) ?? []);

    setTracks(data.tracklist ?? []);

    setDiscogLink(data.uri ?? '');
    setYoutubeLink(data.videos?.[0]?.uri ?? '');
  };

  const handleDiscogsFetch = async () => {
    try {
      console.info('fetch discog');
      console.log('Discogs ID envoyé →', release.discogs_id);
      if (!release.discogs_id) {
        onSnackbar?.('Discogs ID manquant', 'error');
        return;
      }
      const res = await fetch(`${backendUrl}/api/release/discogs/${release.discogs_id}`);
      const data = await res.json();

      console.info('data', data);

      if (data.message) {
        onSnackbar?.(data.message, 'error');
        return;
      }

      populateRelease(data);
    } catch (err) {
      console.error(err);
      onSnackbar?.('Erreur Discogs', 'error');
    }
  };

  // -----------------------
  // VALIDATION
  // -----------------------
  const durationRegex: RegExp = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;

  // -----------------------
  // SUBMIT 🔥
  // -----------------------
  const handleSubmit = async () => {
    if (!releaseDetail) return;

    try {
      setLoading(true);
      const formData = new FormData();

      const payload = {
        ...release,
        year: release.year ? parseInt(release.year, 10) : null,
      };

      formData.append('release', JSON.stringify(payload));
      formData.append('artists', JSON.stringify(artists));
      formData.append('labels', JSON.stringify(labels));
      formData.append('genres', JSON.stringify(genres));
      formData.append('styles', JSON.stringify(styles));
      formData.append('tracks', JSON.stringify(tracks));
      formData.append('disc', JSON.stringify(disc));

      formData.append(
        'links',
        JSON.stringify([
          { platform: 'discogs', url: discogsLink },
          { platform: 'youtube', url: youtubeLink },
        ]),
      );

      if (coverFile) formData.append('file', coverFile);

      const res = await fetch(`${backendUrl}/api/release/${releaseDetail.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error();

      onSnackbar?.('Release updated', 'success');
      onUpdated();
      onCancel();
    } catch (err) {
      console.error(err);
      onSnackbar?.('Erreur update', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!releaseDetail) return null;

  return (
    <Stack
      spacing={3}
      sx={{
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        transition: 'opacity 0.2s ease',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-01)',
          fontSize: 'x-large',
        }}
      >
        Edit Release
      </Typography>

      {/* DISCOGS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Import from Discogs
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Discogs ID"
              value={release.discogs_id}
              onChange={(e) =>
                setRelease({
                  ...release,
                  discogs_id: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
            <Button onClick={handleDiscogsFetch} disabled={!release.discogs_id} variant="contained">
              IMPORT
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* RELEASE INFO */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Release Info
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={release.title}
              onChange={(e) => setRelease({ ...release, title: e.target.value })}
            />

            <TextField
              label="Year"
              value={release.year}
              onChange={(e) => setRelease({ ...release, year: e.target.value })}
            />

            <TextField
              label="Country"
              value={release.country}
              onChange={(e) => setRelease({ ...release, country: e.target.value })}
            />

            <TextField
              label="Barcode"
              value={release.barcode}
              onChange={(e) => setRelease({ ...release, barcode: e.target.value })}
            />

            <TextField
              select
              label="Type"
              value={release.release_type}
              onChange={(e) => setRelease({ ...release, release_type: e.target.value })}
            >
              {releaseTypes.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Size"
              value={disc.size}
              onChange={(e) => setDisc({ ...disc, size: e.target.value })}
            >
              {releaseSizes.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Speed"
              value={disc.speed}
              onChange={(e) => setDisc({ ...disc, speed: e.target.value })}
            >
              {releaseSpeeds.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      {/* GENRE / STYLE */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Genre / Style
          </Typography>

          <Stack spacing={2}>
            <EntitySelector
              label="Genres"
              endpoint="genre/search"
              value={genres}
              onChange={setGenres}
            />

            <EntitySelector
              label="Styles"
              endpoint="style/search"
              value={styles}
              onChange={setStyles}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* ARTIST / LABEL */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Artist / Label
          </Typography>

          <Stack spacing={2}>
            <EntitySelector
              label="Artists"
              endpoint="artist/search"
              value={artists}
              onChange={setArtists}
            />

            <EntitySelector
              label="Labels"
              endpoint="label/search"
              value={labels}
              onChange={setLabels}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* EXTERNAL LINKS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            External Links
          </Typography>

          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Discogs Link"
              value={discogsLink}
              onChange={(e) => setDiscogLink(e.target.value)}
              error={discogsLink !== '' && !discogsLink.startsWith('https://')}
              helperText={
                discogsLink && !discogsLink.startsWith('https://')
                  ? 'Le lien doit commencer par https://'
                  : ''
              }
            />

            <TextField
              fullWidth
              label="YouTube Link"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              error={youtubeLink !== '' && !youtubeLink.startsWith('https://')}
              helperText={
                youtubeLink && !youtubeLink.startsWith('https://')
                  ? 'Le lien doit commencer par https://'
                  : ''
              }
            />
          </Stack>
        </CardContent>
      </Card>

      {/* TRACKS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Tracklist
          </Typography>
          <Table>
            <TableBody>
              {tracks.map((t, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <TextField
                      value={t.position}
                      onChange={(e) => updateTrack(i, 'position', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={t.title}
                      onChange={(e) => updateTrack(i, 'title', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      value={t.duration}
                      error={Boolean(t.duration && !durationRegex.test(t.duration))}
                      onChange={(e) => updateTrack(i, 'duration', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeTrack(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Stack alignItems="center">
            <Button sx={{ mt: 2 }} variant="contained" onClick={addTrack}>
              Add Track
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* COVER */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="column" spacing={2} alignItems="center">
            <Typography variant="h6">Cover Image</Typography>
            <img
              src={coverPreview}
              alt="Cover Preview"
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 4 }}
            />

            <Button variant="outlined" component="label">
              Upload
              <input hidden type="file" onChange={handleCoverChange} />
            </Button>
            <Button onClick={removeCover}>Remove</Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
            <Button variant="outlined" color="error" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ReleaseEditForm;

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
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EntitySelector from './EntitySelector';
import './createRelease.css';
import {
  ReleaseState,
  DiscState,
  Entity,
  DiscogsRelease,
} from '../../types/entities/release.types';
import { createTrack } from '../../types/entities/track.types';

interface CreateReleaseProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onSnackbar?: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

function CreateRelease({ open, onClose, onCreated, onSnackbar }: CreateReleaseProps) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;
  const DEFAULT_COVER = 'jvm/releases/00_release_default';

  const releaseTypes = ['LP', 'Album', 'Single', 'EP', 'Maxi-Single', 'Mini-Album'];
  const releaseSizes = ['7', '10', '12'];
  const releaseSpeeds = ['33', '45', '78'];

  // -----------------------
  //  STATES
  // -----------------------
  const [release, setRelease] = useState<ReleaseState>({
    title: '',
    year: '',
    country: '',
    barcode: '',
    release_type: '',
    notes: '',
  });
  const [artists, setArtists] = useState<Entity[]>([]);
  const [labels, setLabels] = useState<Entity[]>([]);
  const [genres, setGenres] = useState<Entity[]>([]);
  const [styles, setStyles] = useState<Entity[]>([]);
  const [tracks, setTracks] = useState<createTrack[]>([{ position: '', title: '', duration: '' }]);
  const [disc, setDisc] = useState<DiscState>({
    format: '',
    size: '',
    speed: '',
  });
  // discogsId states
  const [discogsId, setDiscogsId] = useState<string>('');
  // cover image states
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(`${cloudinaryUrl}/${DEFAULT_COVER}`);
  // external link
  const [discogsLink, setDiscogLink] = useState<string>('');
  const [youtubeLink, setYoutubeLink] = useState<string>('');

  // -----------------------
  //  RESET FUNCTION
  // -----------------------
  const resetForm = () => {
    setDiscogsId('');

    setRelease({
      title: '',
      year: '',
      country: '',
      barcode: '',
      release_type: '',
      notes: '',
    });

    setDisc({
      format: '',
      size: '',
      speed: '',
    });

    setArtists([]);
    setLabels([]);
    setGenres([]);
    setStyles([]);

    setTracks([{ position: '', title: '', duration: '' }]);

    setDiscogLink('');
    setYoutubeLink('');

    setCoverFile(null);
    setCoverPreview(`${cloudinaryUrl}/${DEFAULT_COVER}`);
  };

  // -----------------------
  //  TRACKS FUNCTION
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
    const updated = tracks.filter((_, i) => i !== index);
    setTracks(updated);
  };

  // -----------------------
  //  COVER FUNCTION
  // -----------------------

  // effect de la preview
  useEffect(() => {
    let objectUrl: string | undefined;

    // image uploadée
    if (coverFile) {
      objectUrl = URL.createObjectURL(coverFile);
      setCoverPreview(objectUrl);
    }
    // image Discogs
    else if (release.discogs_image_url) {
      setCoverPreview(release.discogs_image_url);
    }
    // image par défaut
    else {
      setCoverPreview(`${cloudinaryUrl}/${DEFAULT_COVER}`);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile, release.discogs_image_url]);

  // handle change image
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverFile(file);
  };

  // Reset Cover
  const removeCover = () => {
    setCoverFile(null);
  };

  // -----------------------
  //  FETCH API DISCOGS
  // -----------------------

  const populateRelease = (data: DiscogsRelease) => {
    // release
    const barcode = data.identifiers?.find((id) => id.type === 'Barcode')?.value ?? '';

    const releaseType =
      data.formats?.[0]?.descriptions?.find((d) => releaseTypes.includes(d)) ?? '';

    setRelease((prev) => ({
      ...prev,
      title: data.title ?? '',
      year: data.year ? String(data.year) : '',
      barcode: barcode.replace(/\s/g, ''),
      country: data.country ?? '',
      release_type: releaseType,
      notes: data.notes ?? '',
    }));

    // artists
    const uniqueArtists = [
      ...new Map(
        (data.artists ?? []).map((a) => [a.id, { name: a.name, discogs_id: a.id }]),
      ).values(),
    ];

    setArtists(uniqueArtists);

    // labels
    setLabels(data.labels?.map((l) => ({ name: l.name, discogs_id: l.id })) ?? []);

    // genres
    setGenres(data.genres?.map((g) => ({ name: g })) ?? []);

    // styles
    setStyles(data.styles?.map((s) => ({ name: s })) ?? []);

    // disc
    const format = data.formats?.[0]?.name ?? '';
    const size =
      data.formats?.[0]?.descriptions
        ?.find((d) => ['7"', '10"', '12"'].includes(d))
        ?.replace('"', '') ?? '';
    const speed =
      data.formats?.[0]?.descriptions?.find((d) => d.includes('RPM'))?.replace(' RPM', '') ?? '';

    setDisc({ format, size, speed });

    // external links
    setDiscogLink(data.uri ?? '');
    setYoutubeLink(data.videos?.[0]?.uri ?? '');

    // tracklist
    setTracks(data.tracklist ?? []);

    // cover
    setRelease((prev) => ({ ...prev, discogs_image_url: data.images?.[0]?.uri ?? '' }));
  };

  const handleDiscogsFetch = async (): Promise<void> => {
    try {
      const response = await fetch(`${backendUrl}/api/release/discogs/${discogsId}`);

      if (!response.ok) {
        throw new Error('Discogs fetch error');
      }

      const data = await response.json();

      // Vérification du message d'erreur renvoyé par Discogs
      if (data.message) {
        onSnackbar?.(data.message, 'error');
        return;
      }

      console.log('Discogs data', data);

      populateRelease(data);
    } catch (error) {
      console.error('Discogs fetch error', error);
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      onSnackbar?.(message, 'error');
    }
  };

  // -----------------------
  //  SUBMIT FUNCTION
  // -----------------------

  const handleSubmit = async (): Promise<void> => {
    // 🚨 validation de champs obligatoires avant envoi
    if (!release.title.trim()) return onSnackbar?.('Le titre est obligatoire', 'error');
    if (!release.release_type) return onSnackbar?.('Le type de release est obligatoire', 'error');
    if (!disc.size) return onSnackbar?.('La taille du disque est obligatoire', 'error');
    if (!disc.speed) return onSnackbar?.('La vitesse du disque est obligatoire', 'error');
    if (artists.length === 0) return onSnackbar?.('Au moins un artiste est requis', 'error');
    if (!tracks.length || tracks.some((t) => !t.title.trim() || !t.position.trim())) {
      return onSnackbar?.('Chaque piste doit avoir une position et un titre', 'error');
    }
    try {
      // gestion de l'integer de year
      const releasePayload = {
        ...release,
        year: release.year ? parseInt(release.year, 10) : null,
      };

      // creation du formData
      const formData = new FormData();
      if (coverFile) {
        formData.append('file', coverFile);
      }
      formData.append('release', JSON.stringify(releasePayload));
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

      console.log('formData envoyé :', {
        releasePayload,
        tracks,
        coverFile,
        disc,
        discogsLink,
        youtubeLink,
      });

      // envoi post formData
      const response = await fetch(`${backendUrl}/api/release`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur serveur');
      }

      const data = await response.json();
      console.log('response backend :', data);

      // alert('Release créée !');
      onCreated();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur create release', error);
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      onSnackbar?.(message, 'error');
    }
  };

  // -----------------------
  //  HELPER
  // -----------------------
  const discogsLinkError = discogsLink !== '' && !discogsLink.startsWith('https://');

  const youtubeLinkError = youtubeLink !== '' && !youtubeLink.startsWith('https://');

  // -----------------------
  //  REGEX
  // -----------------------

  const durationRegex: RegExp = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;

  // -----------------------
  //  RETURN
  // -----------------------
  return (
    // <main className="createRelease_main">
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <main className="createRelease_main">
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 5px',
            fontFamily: 'var(--font-01)',
            fontSize: 'x-large',
          }}
        >
          Create Release
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* DISCOGS IMPORT */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Import from Discogs
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Discogs ID"
                type="number"
                value={discogsId}
                onChange={(e) => setDiscogsId(e.target.value)}
                fullWidth
              />

              <Button variant="contained" disabled={!discogsId} onClick={handleDiscogsFetch}>
                SUBMIT
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
                fullWidth
                label="Title"
                value={release.title}
                onChange={(e) => setRelease({ ...release, title: e.target.value })}
              />

              <TextField
                fullWidth
                label="Year"
                type="number"
                value={release.year}
                onChange={(e) => setRelease({ ...release, year: e.target.value })}
              />

              <TextField
                fullWidth
                label="Country"
                value={release.country}
                onChange={(e) => setRelease({ ...release, country: e.target.value })}
              />

              <TextField
                fullWidth
                label="Barcode"
                value={release.barcode}
                onChange={(e) => setRelease({ ...release, barcode: e.target.value })}
              />

              <TextField
                select
                fullWidth
                label="Release Type"
                value={release.release_type}
                onChange={(e) => setRelease({ ...release, release_type: e.target.value })}
              >
                {releaseTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="size"
                value={disc.size}
                onChange={(e) => setDisc({ ...disc, size: e.target.value })}
              >
                {releaseSizes.map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="speed"
                value={disc.speed}
                onChange={(e) => setDisc({ ...disc, speed: e.target.value })}
              >
                {releaseSpeeds.map((speed) => (
                  <MenuItem key={speed} value={speed}>
                    {speed}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="notes"
                multiline
                maxRows={20}
                value={release.notes}
                onChange={(e) => setRelease({ ...release, notes: e.target.value })}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* GENRE / STYLE INFO */}
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

        {/* ARTIST / LABEL INFO */}
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

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              External Link
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                label="lien discogs"
                value={discogsLink}
                onChange={(e) => setDiscogLink(e.target.value)}
                error={discogsLinkError}
                helperText={
                  discogsLink && !discogsLink.startsWith('https://')
                    ? 'Le lien doit commencer par https://'
                    : ''
                }
              />

              <TextField
                fullWidth
                label="lien Youtube"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                error={youtubeLinkError}
                helperText={
                  youtubeLink && !youtubeLink.startsWith('https://')
                    ? 'Le lien doit commencer par https://'
                    : ''
                }
              />
            </Stack>
          </CardContent>
        </Card>

        {/* TRACKLIST */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tracklist
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {tracks.map((track, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={track.position}
                        onChange={(e) => updateTrack(index, 'position', e.target.value)}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={track.title}
                        onChange={(e) => updateTrack(index, 'title', e.target.value)}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={track.duration}
                        error={Boolean(track.duration && !durationRegex.test(track.duration))}
                        helperText={
                          track.duration && !durationRegex.test(track.duration)
                            ? 'Format mm:ss ou hh:mm:ss'
                            : ''
                        }
                        onChange={(e) => updateTrack(index, 'duration', e.target.value)}
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton onClick={() => removeTrack(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button sx={{ mt: 2 }} variant="contained" onClick={addTrack}>
              Add Track
            </Button>
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
                Upload Image
                <input hidden type="file" accept="image/*" onChange={handleCoverChange} />
              </Button>

              <Button onClick={removeCover}>Remove image</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* BUTTONS FORM */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="column" spacing={2} alignItems="center">
              <Button variant="contained" size="large" onClick={handleSubmit}>
                Create Release
              </Button>

              <Button variant="contained" color="error" size="large" onClick={resetForm}>
                RESET
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </main>
    </Dialog>
  );
}

export default CreateRelease;

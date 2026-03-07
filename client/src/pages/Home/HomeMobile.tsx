// src/pages/HomeMobile/HomeMobile.tsx
import { useEffect, useMemo, useState } from 'react';
import './homeMobile.css';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useFormat } from '../../context/FormatContext.js';
import ReleaseItemMobile from '../../components/ReleaseItemMobile/ReleaseItemMobile.jsx';
import GroupHeader from '../../components/GroupHeader/GroupHeader.jsx';
import ReleaseDetailDialogMobile from '../../components/ReleaseDetailDialogMobile/ReleaseDetailDialogMobile.jsx';

interface ReleaseMobile {
  id: number;
  title: string;
  artists?: string;
  labels?: string;
  artist_sorted_name?: string;
  label_sorted_name?: string;
  links?: { platform: string; url: string }[];
}

type GroupByOption = 'title' | 'artist' | 'label';

function HomeMobile() {
  // -- GLOBAL STATES -- //
  const { selectedFormat, getSize } = useFormat();
  const [releases, setReleases] = useState<ReleaseMobile[]>([]);

  // -- FILTER STATES -- //
  const [groupBy, setGroupBy] = useState<GroupByOption>('title');
  const [search, setSearch] = useState<string>('');
  const [openGroup, setOpenGroup] = useState<Record<string, boolean>>({});

  // -- MODAL STATES -- //
  const [selectedReleaseId, setSelectedReleaseId] = useState<number | null>(null);
  const [releaseDetail, setReleaseDetail] = useState<ReleaseMobile | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_BASE_URL;

  // =======================
  // FETCH RELEASES
  // =======================
  useEffect(() => {
    fetch(`${backendUrl}/api/mobile?size=${getSize()}`)
      .then(res => res.json())
      .then((data: ReleaseMobile[]) => {
        setReleases(data);
        setOpenGroup({});
      })
      .catch(err => console.error('Erreur fetch releases:', err));
  }, [selectedFormat]);

  // =======================
  // STRING UTILS
  // =======================
  const ARTICLES = ['LE','LA','LES',"L'",'UN','UNE','AU','DES','DU','DE',"D'",'THE','A','AN'];

  const stripLeadingArticle = (value?: string): string => {
    if (!value) return '';
    const trimmed = value.trim();
    const upper = trimmed.toUpperCase();
    const article = ARTICLES.find(
      a => upper.startsWith(`${a} `) || (a.endsWith("'") && upper.startsWith(a))
    );
    if (!article) return trimmed;
    if (article.endsWith("'")) return trimmed.slice(article.length);
    return trimmed.slice(article.length + 1);
  };

  const getTitleSortKey = (title?: string): string => {
    const cleaned = stripLeadingArticle(title);
    const match = cleaned.toUpperCase().match(/[A-Z]/);
    return match ? match[0] : '#';
  };

  const getGroupValue = (release: ReleaseMobile): string => {
    if (groupBy === 'title') return release.title ?? '';
    if (groupBy === 'artist') return release.artists ?? '';
    if (groupBy === 'label') return release.labels ?? '';
    return '';
  };

  const getGroupLetter = (release: ReleaseMobile): string => {
    if (groupBy === 'title') return getTitleSortKey(release.title);
    if (groupBy === 'artist') return release.artist_sorted_name?.[0]?.toUpperCase() ?? '#';
    if (groupBy === 'label') return release.label_sorted_name?.[0]?.toUpperCase() ?? '#';
    return '#';
  };

  // =======================
  // FILTER + SEARCH
  // =======================
  const filteredReleases = useMemo(() => {
    if (!search) return releases;
    return releases.filter(r => getGroupValue(r).toLowerCase().includes(search.toLowerCase()));
  }, [releases, search, groupBy]);

  // =======================
  // GROUPING + SORT
  // =======================

  const groupedReleases = useMemo<Record<string, ReleaseMobile[]> | null>(() => {
  if (search) return null;

  const groups: Record<string, ReleaseMobile[]> = {};

  filteredReleases.forEach(release => {
    const letter = getGroupLetter(release);
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(release);
  });

  Object.keys(groups).forEach(letter => {
    groups[letter]?.sort((a, b) => {
      if (groupBy === 'title') return stripLeadingArticle(a.title).localeCompare(stripLeadingArticle(b.title), 'fr', { sensitivity: 'base' });
      if (groupBy === 'artist') {
        const cmp = (a.artist_sorted_name || '').localeCompare(b.artist_sorted_name || '', 'fr', { sensitivity: 'base' });
        if (cmp !== 0) return cmp;
        return stripLeadingArticle(a.title).localeCompare(stripLeadingArticle(b.title), 'fr', { sensitivity: 'base' });
      }
      if (groupBy === 'label') {
        const cmp = (a.label_sorted_name || '').localeCompare(b.label_sorted_name || '', 'fr', { sensitivity: 'base' });
        if (cmp !== 0) return cmp;
        return stripLeadingArticle(a.title).localeCompare(stripLeadingArticle(b.title), 'fr', { sensitivity: 'base' });
      }
      return 0;
    });
  });

  return groups;
}, [filteredReleases, search, groupBy]);

  const sortedLetters = groupedReleases ? Object.keys(groupedReleases).sort() : [];

  // =======================
  // TOGGLE GROUP
  // =======================
  const toggleGroup = (letter: string) => {
    setOpenGroup(prev => ({ ...prev, [letter]: !prev[letter] }));
  };

  useEffect(() => {
    setOpenGroup({});
  }, [groupBy]);

  // =======================
  // MODAL HANDLERS
  // =======================
  const handleOpenInfo = async (release: ReleaseMobile) => {
    setSelectedReleaseId(release.id);
    setOpenModal(true);
    setLoadingDetail(true);

    try {
      const res = await fetch(`${backendUrl}/api/release/${release.id}`);
      const data: ReleaseMobile = await res.json();
      setReleaseDetail(data);
    } catch (err) {
      console.error('Erreur fetch release detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setReleaseDetail(null);
    setSelectedReleaseId(null);
  };

  const discogsLink = releaseDetail?.links?.find(link => link.platform === 'discogs')?.url;

  // =======================
  // RENDER
  // =======================
  return (
    <div className="home-mobile">
      <section className="sticky-Mobile-section">
        <div className="search_filter_section_mobile">
          <FormControl size="small" fullWidth>
            <InputLabel>Recherche par</InputLabel>
            <Select
              value={groupBy}
              label="Grouper par"
              onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
            >
              <MenuItem value="title">Titres</MenuItem>
              <MenuItem value="artist">Artistes</MenuItem>
              <MenuItem value="label">Labels</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            fullWidth
            placeholder={`Rechercher ${groupBy}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div style={{ borderTop: '1px dashed #ccc', marginBottom: 10 }} />
      </section>

      <section className="releases_list_section_mobile">
            {!search && groupedReleases &&
  sortedLetters.map(letter => (
    <div key={letter}>
      <GroupHeader
        letter={letter}
        isOpen={openGroup[letter] ?? false}
        onToggle={() => toggleGroup(letter)}
      />
      {openGroup[letter] &&
        groupedReleases[letter]?.map(r => (
          <ReleaseItemMobile key={r.id} release={r} onInfoClick={handleOpenInfo} />
        ))
      }
    </div>
  ))
}
      </section>

      <ReleaseDetailDialogMobile
        open={openModal}
        onClose={handleCloseModal}
        releaseDetail={releaseDetail}
        loadingDetail={loadingDetail}
        backendUrl={backendUrl}
        imageBaseUrl={`${cloudinaryUrl}/jvm/releases`}
        discogsLink={discogsLink}
      />
    </div>
  );
}

export default HomeMobile;
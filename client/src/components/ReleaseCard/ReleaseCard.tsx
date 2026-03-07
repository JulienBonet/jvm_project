import { Card, CardMedia, CardContent, Typography } from '@mui/material';
import {Release} from '../../types/entities/release.types'

interface ReleaseCardProps {
  release: Release;
  imageBaseUrl: string; 
  onClick: (release: Release) => void;
}

function ReleaseCard({ release, imageBaseUrl, onClick }: ReleaseCardProps) {
  return (
    <Card
      onClick={() => onClick(release)}
      sx={{
        width: 220,
        cursor: 'pointer',
        border: '1px solid black',
        transition: '0.3s',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: 6,
        },
      }}
    >
      {release.image_url && (
        <CardMedia
          component="img"
          width="100%"
          height="auto"
          image={`${imageBaseUrl}/${release.image_url}`}
          alt={release.title}
        />
      )}

      <CardContent>
        <Typography variant="body2">{release.artists || 'N/A'}</Typography>

        <Typography variant="body2" fontWeight="bold">
          {release.title}
        </Typography>

        <Typography variant="body2">{release.labels || 'N/A'}</Typography>

        <Typography variant="caption">
          {release.year} • {release.release_type} • {release.disc_speed} RPM
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ReleaseCard;

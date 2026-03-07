/* eslint-disable react/prop-types */

import { Card, CardMedia, CardContent, Typography } from '@mui/material';

function ItemCard({ item, imageBaseUrl }) {
  return (
    <Card
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
      {item.image_url && (
        <CardMedia
          component="img"
          width="100%"
          height="auto"
          image={`${imageBaseUrl}/${item.image_url}`}
          alt={item.name}
        />
      )}

      <CardContent>
        <Typography variant="body1" fontWeight="400" align="center">
          {item.name}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ItemCard;

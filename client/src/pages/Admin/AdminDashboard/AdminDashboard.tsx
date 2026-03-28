import { NavLink, Outlet } from 'react-router-dom';
import { Box, Button, Stack, Divider } from '@mui/material';

const baseColor = 'var(--color-02)';
const hoverColor = 'var(--color-02h)';

export default function AdminDashboard() {
  const links = [
    { label: 'Releases', path: 'releases' },
    { label: 'Artists', path: 'artists' },
    { label: 'Labels', path: 'labels' },
    { label: 'Genres', path: 'genres' },
    { label: 'Styles', path: 'styles' },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 64,
          zIndex: 1000,
          p: 2,
          mx: 2,
          backgroundColor: '#fff',
        }}
      >
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
          {links.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {({ isActive }) => (
                <Button
                  variant={isActive ? 'contained' : 'outlined'}
                  sx={{
                    color: isActive ? '#fff' : baseColor,
                    borderColor: baseColor,
                    backgroundColor: isActive ? baseColor : 'transparent',
                    borderWidth: '1px',
                    '&:hover': {
                      backgroundColor: isActive ? hoverColor : 'rgba(24,83,79,0.08)',
                      borderColor: hoverColor,
                    },
                  }}
                >
                  {item.label}
                </Button>
              )}
            </NavLink>
          ))}
        </Stack>

        <Divider sx={{ mt: 2 , borderColor: 'black'}} />
      </Box>

      <Box >
        <Outlet/>
      </Box>
    </Box>
  );
}
import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useFormat } from '../../context/FormatContext.js';
import useIsMobile from '../../hooks/useIsMobile.js';
import { useAuth } from '../../context/AuthContext.js';
import type { UserFormat } from '../../context/FormatContext.js';

function Header() {
  const { selectedFormat, setSelectedFormat } = useFormat();
  const { token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleClose = () => setOpen(false);

  const handleFormatChange = (value: UserFormat): void => {
    setSelectedFormat(value);
    setOpen(false);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'var(--color-01)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* LOGO */}
        <Box
          component={Link}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <img src="/images/logo.png" alt="Logo" style={{ height: 40 }} />
        </Box>

        {/* BURGER — seulement si connecté */}
        {token && (
          <IconButton edge="end" color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* DRAWER */}
      {token && (
        <Drawer
          anchor="right"
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: { height: 'auto', minHeight: 100, mt: 8 },
            },
          }}
        >
          <Box sx={{ width: 260 }} role="presentation">
            <List>
              {isMobile ? (
                <>
                  {/* 📱 Mobile → choix format */}
                  {['LP', 'SINGLE'].map((format) => (
                    <ListItemButton
                      key={format}
                      onClick={() => handleFormatChange(format as UserFormat)}
                      sx={{
                        backgroundColor: selectedFormat === format ? 'primary.main' : 'transparent',
                        color: selectedFormat === format ? 'white' : 'inherit',
                        '&:hover': {
                          backgroundColor:
                            selectedFormat === format ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-01)',
                              fontSize: '1.1rem',
                              fontWeight: 500,
                            }}
                          >
                            {format === 'LP' ? '33 Tours' : '45 Tours'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}

                  {/* 🔴 Logout mobile */}
                  <ListItemButton
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    sx={{ mt: 2 }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LogoutIcon sx={{ fontSize: 20, color: 'var(--color-04)', }} />
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-01) !important',
                              fontSize: '1.1rem',
                              fontWeight: 500,
                              color: 'var(--color-04)',
                            }}
                          >
                            Logout
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </>
              ) : (
                <>
                  {/* 💻 Desktop → navigation */}
                  {['/', '/artists', '/labels', '/admin'].map((path) => (
                    <ListItemButton
                      key={path}
                      component={NavLink}
                      to={path}
                      onClick={handleClose}
                      sx={(theme) => ({
                        '&.active': {
                          backgroundColor: theme.palette.primary.main,
                          color: 'white',
                          '&:hover': { backgroundColor: theme.palette.primary.dark },
                        },
                      })}
                    >
                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-01)',
                              fontSize: '1.1rem',
                              fontWeight: 500,
                            }}
                          >
                            {path === '/'
                              ? 'Releases'
                              : path === '/artists'
                                ? 'Artists'
                                : path === '/labels'
                                  ? 'Labels'
                                  : 'Admin'}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}

                  {/* 🔴 Logout desktop */}
                  <ListItemButton onClick={logout} sx={{ mt: 1 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <LogoutIcon sx={{ fontSize: 20, color: 'var(--color-04)', }} />
                          <Typography
                            sx={{
                              fontFamily: 'var(--font-01)',
                              fontSize: '1.1rem',
                              fontWeight: 500,
                              color: 'var(--color-04)',
                            }}
                          >
                            Logout
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </>
              )}
            </List>

            <Divider />
          </Box>
        </Drawer>
      )}
    </AppBar>
  );
}

export default Header;

import { Box, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface GroupHeaderProps {
  letter: string;
  isOpen: boolean;
  onToggle: (letter: string) => void;
}

function GroupHeader({ letter, isOpen, onToggle }: GroupHeaderProps) {
  return (
    <Box
      onClick={() => onToggle(letter)}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Typography fontSize={20} sx={{ fontFamily: 'var(--font-01)' }}>
        {letter}
      </Typography>

      <Box
        sx={{
          display: 'inline-flex',
          transition: 'transform 0.25s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <KeyboardArrowDownIcon />
      </Box>
    </Box>
  );
}

export default GroupHeader;

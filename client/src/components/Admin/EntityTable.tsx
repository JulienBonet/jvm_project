// > ENTITY TABLE : artists & label //
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
}

interface EntityTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  rowsPerPage: number;

  onPageChange: (event: unknown, page: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  renderRow: (item: T) => React.ReactNode;
  onView: (item: T) => void;
  onDelete: (item: T) => void;
}

function EntityTable<T extends { id: number }>({
  columns,
  data,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  renderRow,
  onView,
  onDelete,
}: EntityTableProps<T>) {
  return (
    <>
      <Table sx={{ tableLayout: 'fixed' }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={String(col.key)} align="center" sx={{ width: col.width }}>
                {col.label}
              </TableCell>
            ))}
            <TableCell align="center" sx={{ width: '10%' }}>
              ACTIONS
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {renderRow(item)}

              <TableCell align="center">
                <IconButton onClick={() => onView(item)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(item)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}

export default EntityTable;

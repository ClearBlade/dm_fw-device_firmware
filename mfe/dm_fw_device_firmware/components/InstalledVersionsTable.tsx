import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Installation, Asset } from '../types';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.grey[50],
}));

interface Props {
  installations: Installation[];
  assets: Asset[];
}

export function InstalledVersionsTable({ installations, assets }: Props) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Installed Versions
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Device</StyledTableCell>
              <StyledTableCell>Version</StyledTableCell>
              <StyledTableCell>Installation Date</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {installations.map((install) => {
              const asset = assets.find(d => d.id === install.asset_id);
              return (
                <TableRow key={`${install.asset_id}-${install.version}`}>
                  <TableCell>{asset?.label || asset?.id}</TableCell>
                  <TableCell>{install.version}</TableCell>
                  <TableCell>{new Date(install.installation_date).toLocaleString()}</TableCell>
                  <TableCell>{install.status}</TableCell>
                </TableRow>
              );
            })}
            {installations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No installations found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 
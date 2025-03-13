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
  scheduledInstalls: Installation[];
  assets: Asset[];
}

export function ScheduledUpdatesTable({ scheduledInstalls, assets }: Props) {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Scheduled Updates
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>Device</StyledTableCell>
              <StyledTableCell>Version</StyledTableCell>
              <StyledTableCell>Scheduled Date</StyledTableCell>
              <StyledTableCell>Description</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scheduledInstalls.map((install) => {
              const asset = assets.find(d => d.id === install.asset_id);

              return (
                <TableRow key={`${install.asset_id}-${install.version}`}>
                  <TableCell>{asset?.label || asset?.id}</TableCell>
                  <TableCell>{install.version}</TableCell>
                  <TableCell>{new Date(install.installation_date).toLocaleString()}</TableCell>
                  <TableCell>{install.software_descriptor || '-'}</TableCell>
                </TableRow>
              );
            })}
            {scheduledInstalls.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No scheduled updates</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
} 
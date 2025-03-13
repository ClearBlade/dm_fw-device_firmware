import React from 'react';
import { getBasePath } from '@clearblade/ia-mfe-core';
import { AppProviders, appQueryClient, RecoilRoot } from '@clearblade/ia-mfe-react';
import { SnackbarProvider } from 'notistack';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import DeviceFirmware from "./device_firmware";
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { Subscribe } from "@react-rxjs/core";

export default function Root(props) {
  return (
    <AppProviders>
      <ThemeProvider theme={theme}>
        <RecoilRoot>
          <BrowserRouter basename={getBasePath()}>
            <QueryClientProvider contextSharing client={appQueryClient}>
              <SnackbarProvider>
                <DeviceFirmware />
              </SnackbarProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </RecoilRoot>
      </ThemeProvider>
    </AppProviders>
  );
}


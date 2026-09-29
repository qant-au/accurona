import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { AppDialog } from './AppDialog.js';

// The shapes @accurona/core's shortcutSections() and DIFFERENCES produce;
// restated here so the UI package does not depend on the core one.
export interface KeyboardShortcutSection {
  title: string;
  rows: { label: string; keys: string[] }[];
}

export interface KeyboardShortcutDifference {
  excalidraw: string;
  action: string;
  here: string;
  why: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  sections: KeyboardShortcutSection[];
  differences?: readonly KeyboardShortcutDifference[];
  title?: string;
}

const Keys = ({ keys }: { keys: string[] }) => (
  <Box component="span" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
    {keys.map((key) => (
      <Box
        component="kbd"
        key={key}
        sx={{
          fontFamily: 'inherit',
          fontSize: '0.8125rem',
          px: 0.75,
          py: 0.125,
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
          whiteSpace: 'nowrap'
        }}
      >
        {key}
      </Box>
    ))}
  </Box>
);

// The `?` dialog: every binding a tool has, from the shared keymap, and the
// Excalidraw bindings it deliberately does not match.
export const KeyboardShortcutsDialog = ({
  open,
  onClose,
  sections,
  differences,
  title = 'Keyboard shortcuts'
}: Props) => (
  <AppDialog open={open} onClose={onClose} title={title} maxWidth="md">
    <Stack spacing={3} data-testid="keyboard-shortcuts">
      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {sections.map((section) => (
          <Box key={section.title} component="section" aria-label={section.title}>
            <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
              {section.title}
            </Typography>
            <Table size="small">
              <TableBody>
                {section.rows.map((row) => (
                  <TableRow key={`${row.label}:${row.keys.join()}`}>
                    <TableCell sx={{ pl: 0 }}>{row.label}</TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      <Keys keys={row.keys} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </Box>
      {differences && differences.length > 0 && (
        <Box component="section" aria-label="Differences from Excalidraw" data-testid="excalidraw-differences">
          <Typography variant="subtitle2" component="h3" sx={{ mb: 1 }}>
            Differences from Excalidraw
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 0 }}>Excalidraw</TableCell>
                <TableCell>Here</TableCell>
                <TableCell sx={{ pr: 0 }}>Why</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {differences.map((d) => (
                <TableRow key={d.excalidraw + d.action}>
                  <TableCell sx={{ pl: 0 }}>
                    {d.excalidraw} ({d.action})
                  </TableCell>
                  <TableCell>{d.here}</TableCell>
                  <TableCell sx={{ pr: 0 }}>{d.why}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  </AppDialog>
);

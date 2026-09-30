import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { AppDialog } from './AppDialog.js';
import { shortcutKeys } from './shortcutKeys.js';

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

const Kbd = ({ children }: { children: string }) => (
  <Box
    component="kbd"
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
    {children}
  </Box>
);

const Joiner = ({ children }: { children: string }) => (
  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
    {children}
  </Box>
);

// Each entry is one way to trigger the action, so entries are separated by
// "or"; the keys of one chord are joined by "+". Without that, "V 1 S" and
// "⌘ ⇧ Z" were drawn alike and read as one combination (BUG15-14).
const Keys = ({ keys }: { keys: string[] }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 0.5,
      justifyContent: { xs: 'flex-start', sm: 'flex-end' }
    }}
  >
    {keys.map((entry, i) => {
      const parsed = shortcutKeys(entry);
      return (
        <Box component="span" key={entry} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          {i > 0 && <Joiner>or</Joiner>}
          {parsed.kind === 'text' ? (
            <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              {parsed.text}
            </Box>
          ) : (
            parsed.keys.map((key, j) => (
              <Box component="span" key={`${key}-${j}`} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                {j > 0 && <Joiner>+</Joiner>}
                <Kbd>{key}</Kbd>
              </Box>
            ))
          )}
        </Box>
      );
    })}
  </Box>
);

// On a phone the keys go under their label rather than beside it, where
// they were pushed off the dialog's right edge.
const rowSx = { display: { xs: 'block', sm: 'table-row' }, borderBottom: { xs: 1, sm: 0 }, borderColor: 'divider', py: { xs: 0.75, sm: 0 } };
const labelCellSx = { display: { xs: 'block', sm: 'table-cell' }, borderBottom: { xs: 0 }, p: { xs: 0 }, pb: { xs: 0.5 } };
// Up to half the width beside the label, so a long phrase wraps instead of
// squeezing the label to a word a line.
const keysCellSx = { display: { xs: 'block', sm: 'table-cell' }, borderBottom: { xs: 0 }, p: { xs: 0 }, width: { sm: '50%' }, textAlign: { xs: 'left', sm: 'right' } };

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
                  <TableRow key={`${row.label}:${row.keys.join()}`} sx={rowSx}>
                    <TableCell sx={{ pl: 0, ...labelCellSx }}>{row.label}</TableCell>
                    <TableCell align="right" sx={{ pr: 0, ...keysCellSx }}>
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

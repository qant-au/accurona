// Every linework package, installed from npm as a third party would, on one
// page. scripts in ../verify check it (check.mjs); the Docker image serves it.
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Box, Stack, ThemeProvider, Typography } from '@mui/material';
import {
  checkReferences,
  formatLength,
  LENGTH_UNITS,
  parseLength,
  validateScene
} from '@accurona/core';
import {
  createLineworkTheme,
  NotificationHost,
  notify,
  ToolButton
} from '@accurona/ui';
import manifest from '@accurona/elements/manifest.json';
import { Axonometra } from '@axonometra/editor';
import Reticulyne, { version as reticulyneVersion } from '@reticulyne/editor';
import { sceneWith } from './scene.js';

// The plan drawings of @accurona/elements. A glob cannot go through the
// package's exports, so it names the files.
const plans = import.meta.glob(
  '/node_modules/@accurona/elements/dist/plan/*.svg',
  { eager: true, query: '?url', import: 'default' }
);
const planUrl = (id) =>
  plans[`/node_modules/@accurona/elements/dist/plan/${id}.svg`];

const icons = ['wifi-ap', 'cctv-dome', 'firewall'].map((id) => ({
  id,
  name: manifest.elements.find((e) => e.id === id)?.name ?? id,
  url: planUrl(id),
  collection: 'accurona',
  isIsometric: false
}));
const scene = sceneWith(icons);
const checked = validateScene(scene);

const report = {
  core: {
    sceneValid: checked.ok,
    referenceProblems: checked.ok ? checkReferences(checked.scene).length : -1,
    lengths: Object.fromEntries(
      LENGTH_UNITS.map((u) => [u, formatLength(2700, u)])
    ),
    parsed: parseLength(`8' 10"`, 'mm')
  },
  elements: {
    count: manifest.elements.length,
    images: Object.keys(plans).length
  }
};
window.__verify = report;

function Section({ id, title, children }) {
  return (
    <Box
      component="section"
      aria-label={title}
      data-testid={id}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function App() {
  const axo = useRef(null);
  const [axoPlaced, setAxoPlaced] = useState(null);
  useEffect(() => {
    // After the editor has opened the scene: what it saves back.
    const id = setInterval(() => {
      const saved = axo.current?.getScene();
      if (!saved) return;
      const plan = saved.views.find((v) => v.kind === 'plan');
      const kept = saved.views.some((v) => v.kind === 'iso');
      const result = {
        placements: plan?.placements?.length ?? 0,
        walls: plan?.floors?.[0]?.walls?.length ?? 0,
        keepsDiagram: kept,
        savedValid: validateScene(saved).ok
      };
      report.axonometra = result;
      setAxoPlaced(result);
      clearInterval(id);
    }, 250);
    return () => clearInterval(id);
  }, []);

  return (
    <ThemeProvider theme={createLineworkTheme('light')}>
      <NotificationHost />
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography variant="h4" component="h1">
          Linework packages from npm
        </Typography>

        <Section id="core" title="@accurona/core">
          <Typography>
            Scene {checked.ok ? 'valid' : 'INVALID'},{' '}
            {report.core.referenceProblems} reference problems. 2700 mm is{' '}
            {LENGTH_UNITS.map((u) => formatLength(2700, u)).join(' · ')}.
          </Typography>
        </Section>

        <Section id="ui" title="@accurona/ui">
          <ToolButton
            name="Say hello"
            icon={<span aria-hidden>★</span>}
            onClick={() => notify({ message: 'Hello from @accurona/ui' })}
          />
        </Section>

        <Section id="elements" title="@accurona/elements">
          <Typography gutterBottom>
            {report.elements.count} elements, {report.elements.images} plan
            drawings.
          </Typography>
          <Stack direction="row" spacing={1}>
            {manifest.elements.slice(0, 12).map((e) => (
              <img
                key={e.id}
                src={planUrl(e.id)}
                alt={e.name}
                width={48}
                height={48}
              />
            ))}
          </Stack>
        </Section>

        <Section id="axonometra" title="@axonometra/editor">
          <Typography gutterBottom>
            {axoPlaced
              ? `Opened the scene: ${axoPlaced.walls} walls, ${axoPlaced.placements} devices; saving keeps the diagram: ${axoPlaced.keepsDiagram ? 'yes' : 'NO'}.`
              : 'Opening…'}
          </Typography>
          <Box sx={{ height: 420 }}>
            <Axonometra ref={axo} initialScene={scene} />
          </Box>
        </Section>

        <Section
          id="reticulyne"
          title={`@reticulyne/editor ${reticulyneVersion}`}
        >
          <Box sx={{ height: 420, position: 'relative' }}>
            <Reticulyne initialData={scene} editorMode="EDITABLE" />
          </Box>
        </Section>
      </Stack>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

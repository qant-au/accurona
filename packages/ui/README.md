# @accurona/ui

The shared screen parts of [Axonometra](https://github.com/qant-au/axonometra) and
[Reticulyne](https://github.com/qant-au/reticulyne): an [MUI](https://mui.com)
theme, toolbar buttons and menus, panels, dialogs and notifications, so the two
editors look and behave the same.

```sh
npm install @accurona/ui @mui/material @emotion/react @emotion/styled react react-dom
```

React, MUI and Emotion are peer dependencies: your app provides one copy of each.

| Export                                 | What                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| `createLineworkTheme(mode)`            | The theme: palette, type, shadows, component defaults.             |
| `ToolButton`, `ToolMenu`, `Surface`    | Toolbar buttons, a menu that opens on hover or click, their card.  |
| `SidePanel`, `FloatingPanel`           | A panel from the right; a non-modal panel pinned top right.        |
| `AppDialog`, `CloseButton`             | A modal with a titled header; every close is named "Close".        |
| `notify()`, `NotificationHost`         | Transient messages, raised from anywhere, including plain classes. |
| `createNotifier()`                     | Notifications for one editor, when a page has more than one.       |
| `ContextMenu`                          | The right-click menu on a drawing.                                 |
| `KeyboardShortcutsDialog`              | The `?` list of keyboard shortcuts.                                |
| `Panel`, `PanelSection`, `PanelHeader` | A properties panel: sticky header, titled sections.                |

```tsx
import { ThemeProvider } from '@mui/material';
import { createLineworkTheme, NotificationHost, notify } from '@accurona/ui';

export function App() {
  return (
    <ThemeProvider theme={createLineworkTheme('light')}>
      <NotificationHost />
      <button onClick={() => notify({ message: 'Saved' })}>Save</button>
    </ThemeProvider>
  );
}
```

`createLineworkTheme(mode, { cssVariables })` leaves MUI's CSS variables off
unless asked: MUI writes them to `:root`, which an embedded editor must not do to
its host page.

## License

MIT

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Box,
  ClickAwayListener,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  type PopperPlacementType
} from '@mui/material';
import { ToolButton } from './ToolButton.js';

export interface ToolMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  // Draw a divider above this item.
  divider?: boolean;
}

interface Props {
  name: string;
  icon: ReactNode;
  items: ToolMenuItem[];
  placement?: PopperPlacementType;
  // Gap between the button and the menu, in px.
  offset?: number;
  // How long the menu stays after the pointer leaves, in ms.
  closeDelay?: number;
}

// A toolbar button that opens a menu on hover, or on click and keyboard.
export const ToolMenu = ({
  name,
  icon,
  items,
  placement = 'right-start',
  offset = 8,
  closeDelay = 500
}: Props) => {
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  // Opened from the keyboard or a click: move focus into the menu.
  const [focusItems, setFocusItems] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  };
  const show = (focus: boolean) => {
    cancelClose();
    setFocusItems(focus);
    setOpen(true);
  };
  const close = () => {
    cancelClose();
    setOpen(false);
  };
  useEffect(() => cancelClose, []);

  return (
    <>
      <Box
        component="span"
        ref={anchor}
        sx={{ display: 'inline-flex' }}
        onMouseEnter={() => show(false)}
        onMouseLeave={scheduleClose}
      >
        <ToolButton
          name={name}
          icon={icon}
          hasPopup
          expanded={open}
          onClick={() => (open && focusItems ? close() : show(true))}
        />
      </Box>
      <Popper
        open={open}
        anchorEl={anchor.current}
        placement={placement}
        modifiers={[{ name: 'offset', options: { offset: [0, offset] } }]}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
      >
        <ClickAwayListener
          onClickAway={(e) => {
            // The button toggles the menu itself.
            if (anchor.current?.contains(e.target as Node)) return;
            close();
          }}
        >
          <Paper
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            sx={{ boxShadow: 3 }}
          >
            <MenuList
              aria-label={name}
              autoFocusItem={focusItems}
              onKeyDown={(e) => {
                if (e.key === 'Escape' || e.key === 'Tab') close();
              }}
            >
              {items.map((item, i) => (
                <Fragment key={item.label}>
                  {item.divider && i > 0 && <Divider />}
                  <MenuItem
                    onClick={() => {
                      close();
                      item.onClick();
                    }}
                  >
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText>{item.label}</ListItemText>
                  </MenuItem>
                </Fragment>
              ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

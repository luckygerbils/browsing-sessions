import { h } from '../../vendor/preact.module.js';
import { useState, useCallback } from '../../vendor/preact/hooks.module.js';
import { NewSessionPanel } from './NewSessionPanel.js';
import { SessionListPanel } from './SessionListPanel.js';
import { EditSessionPanel } from './EditSessionPanel.js';

export function Popup({ currentSessionId, sessions }) {
  const [ panelState, setPanelState ] = useState({ panel: "SessionListPanel" });
  const showSessionListPanel = useCallback(() => setPanelState({ panel: "SessionListPanel" }), []);
  const showNewSessionPanel = useCallback(() => setPanelState({ panel: "NewSessionPanel" }), []);
  const showEditSessionPanel = useCallback(session => setPanelState({ panel: "EditSessionPanel", session }), []);

  switch (panelState.panel) {
  case "SessionListPanel":
    return h(SessionListPanel, { 
      currentSessionId, sessions, 
      onNewSessionClick: showNewSessionPanel, 
      onEditSessionClick: showEditSessionPanel 
    });
  case "NewSessionPanel":
    return h(NewSessionPanel, { 
      onCancel: showSessionListPanel, 
      onAfterSubmit: showSessionListPanel 
    });
  case "EditSessionPanel":
    return h(EditSessionPanel, { 
      session: panelState.session, 
      onCancel: showSessionListPanel,
      onAfterUpdate: showSessionListPanel
    })
  }
}
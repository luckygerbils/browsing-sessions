import { useCallback } from '../../vendor/preact/hooks.module.js';
import { h, Fragment } from '../../vendor/preact/preact.module.js';
import { SessionListEntry } from './SessionListEntry.js';

export function SessionListPanel(props) {
  const { currentSessionId, sessions, onNewSessionClick, onEditSessionClick } = props;
  const closeCurrentSession = useCallback(() => 
    browser.runtime.sendMessage({ action: "closeCurrentSession" }),
    [ ]);
  const editCurrentSession = useCallback(() =>
    onEditSessionClick(sessions[currentSessionId]),
    [ onEditSessionClick, sessions, currentSessionId ]);

  return (
    h("div", { class: "panel" },
      h("header", { class: "panel-section panel-section-header" }, 
        !currentSessionId && h("div", { class: "text-section-header" }, h("i", null, "No Active Session")),
        currentSessionId &&
          h(Fragment, null,
            h("div", { class: "text-section-header" }, sessions[currentSessionId].name),
            h("div", { class: "header-buttons" },
              h("button", { class: "browser-style", onClick: editCurrentSession }, "Edit"),
              h("button", {  class: "browser-style default", onClick: closeCurrentSession }, "Close"),
            )  
          )
      ),
      Object.keys(sessions).length > 0 && 
        h("main", { class: "panel-content" },
          Object.entries(sessions).map(([, session]) =>
            h(SessionListEntry, { session, active: session.id === currentSessionId, onEditClick: onEditSessionClick })
          )
        ),
      h("footer", { class: "panel-section panel-section-footer" },
        h("div", { class: "panel-section-footer-button", onClick: onNewSessionClick }, "＋ New Session")
      )
    )
  );
}
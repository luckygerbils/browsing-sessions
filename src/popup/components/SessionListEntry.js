import { useCallback } from '../../vendor/preact/hooks.module.js';
import { h } from '../../vendor/preact/preact.module.js';

export function SessionListEntry({ session, onEditClick, active }) {
  const edit = useCallback(() => onEditClick(session), [onEditClick, session]);

  const switchSession = useCallback(() => {
    browser.runtime.sendMessage({ action: "switchSession", payload: session.id });
}, [session.id]);

  return (
    h("div", { class: `panel-section session-entry${active ? " session-entry-active" : ""}` },
      h("div", { class: "session-name" }, session.name),
      h("div", { class: "text" }, h("i", null, `${session.tabs.length} tab${session.tabs.length > 1 ? "s" : ""}`) ),
      h("div", { class: "session-buttons" },
        h("button", { class: "browser-style", onClick: edit }, "Edit"),
        h("button", { class: "browser-style default", onClick: switchSession, disabled: active }, "Switch"),
      )
    )
  );
}
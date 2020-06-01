import { useState, useCallback, useEffect, useRef } from '../../vendor/preact/hooks.module.js';
import { h } from '../../vendor/preact/preact.module.js';

export function NewSessionPanel({ onAfterSubmit, onCancel }) {
  const [ name, setName ] = useState("");
  const changeName = useCallback(e => setName(e.target.value), []);
  const submit = useCallback(async e => {
      e.preventDefault();
      await browser.runtime.sendMessage({ action: "newSession", payload: name });
      onAfterSubmit && onAfterSubmit(name);
  }, [name, onAfterSubmit]);

  const nameInput = useRef(null);
  useEffect(() => {
      if (nameInput.current) {
      nameInput.current.focus();
      }
  });

  return (
      h("div", { class: "panel panel-with-back-button" },
      h("button", { class: "back-button", onClick: onCancel }, "⟨"),
      h("form", { class: "panel-body", onSubmit: submit }, 
          h("main", { class: "panel-section-formElements" },
          h("div", { class: "panel-formElements-item" },
              h("label", { for: "name" }, "Name:"),
              h("input", { type: "text", id: "name", ref: nameInput, value: name, onInput: changeName })
          )
          ),
          h("footer", { class: "panel-section panel-section-footer" },
          h("button", { type: "button", class: "panel-section-footer-button", onClick: onCancel }, "Cancel"),
          h("div", { class: "panel-section-footer-separator" }),
          h("button", { type: "submit", class: "panel-section-footer-button default"}, "OK")
          )
      )
      )
  );
}
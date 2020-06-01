/* eslint-env browser */
import { h, render } from '../vendor/preact.module.js';
import { Popup } from "./components/Popup.js";

const popupProps = {};
function rerender() {
  render(h(Popup, popupProps), document.body);
}

browser.storage.sync.get(["currentSessionId", "sessions"])
  .then(props => {
    Object.assign(popupProps, {sessions: {}, currentSessionId: null}, props);
    rerender();
  });
browser.storage.onChanged.addListener((changes) => {
  for (let [ prop, { newValue }] of Object.entries(changes)) {
    popupProps[prop] = newValue;
  }
  rerender();
});
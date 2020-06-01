function trackSession({ onChange }) {
  const tabs = {};

  function save() {
    if (onChange != null) {
      onChange(Object.values(tabs)
        .sort((a, b) => a.index - b.index)
        .map(({ url, title }) => ({ url, title })));
    }
  }

  const addTab = (tab) => {
    tabs[tab.id] = { index: tab.index, url: tab.url, title: tab.title };
    save();
  };

  const updateTab = (tabId, changeInfo, /* tab */) => {
    if (tabs[tabId] == null) { 
      tabs[tabId] = {};
    }
    if (changeInfo.url) {
      tabs[tabId].url = changeInfo.url;
    }
    if (changeInfo.title) {
      tabs[tabId].title = changeInfo.title;
    }
    save();
  };

  const removeTab = (tabId, /* removeInfo */) => {
    delete tabs[tabId];
    save();
  };

  const moveTab = (tabId, moveInfo) => {
    tabs[tabId].index = moveInfo.toIndex;
    console.log("moved", moveInfo.fromIndex, moveInfo.toIndex);
    save();
  };

  browser.tabs.onCreated.addListener(addTab);
  browser.tabs.onUpdated.addListener(updateTab);
  browser.tabs.onRemoved.addListener(removeTab);
  browser.tabs.onMoved.addListener(moveTab);

  return () => {
    browser.tabs.onCreated.removeListener(addTab);
    browser.tabs.onUpdated.removeListener(updateTab);
    browser.tabs.onRemoved.removeListener(removeTab);
    browser.tabs.onMoved.removeListener(moveTab);
  };
}

async function replaceTabs(urls) {
  console.log("Opening tabs", urls);
  const tabs = await browser.tabs.query({});
  const openUrls = urls.map(async (url, i) => {
    let open;
    if (i < tabs.length) {
      const tab = tabs[i];
      if (tab.url !== urls[i]) {
        open = url => browser.tabs.update(tab.id, { url });
      } else {
        open = () => {};
      }
    } else {
      open = url => browser.tabs.create({ url, discarded: true })
    }

    try {
      await open(url);
    } catch (e) {
      if (e.message.match(/^Illegal URL/)) {
        return open(`/illegal-url.html?url=${encodeURIComponent(url)}`);
      }
      throw e;
    }
  });

  const closeUnusedTabs = 
    browser.tabs.remove(tabs.slice(urls.length).map(tab => tab.id));

  return Promise.all([
    ...openUrls,
    closeUnusedTabs
  ]);
}

let stopTracking;
function loadSession(session) {
  console.log(session.tabs);
  replaceTabs(session.tabs.map(tab => {
    if (typeof tab === "string") {
      return tab;
    } else {
      return tab.url;
    }
  }));

  if (stopTracking != null) {
    stopTracking();
    stopTracking = null;
  }

  stopTracking = trackSession({
    onChange: async tabs => {
      const { sessions } = await browser.storage.sync.get(["sessions"]);
      console.table(tabs);
      browser.storage.sync.set({
        sessions: {
          ...sessions,
          [session.id]: { 
            ...session,
            tabs
          }
        }
      });
    }
  });
}

async function loadPreviousSession() {
  const { currentSessionId, sessions={} } = await browser.storage.sync.get(["currentSessionId", "sessions"]);
  if (currentSessionId != null) {
    loadSession(sessions[currentSessionId]);
  }
}

async function switchSession(sessionId) {
  await browser.storage.sync.set({ currentSessionId: sessionId });
  const { sessions={} } = await browser.storage.sync.get(["sessions"]);
  loadSession(sessions[sessionId]);
}

async function newSession(name) {
  const { sessions={} } = await browser.storage.sync.get(["sessions"]);
  const tabs = (await browser.tabs.query({})).map(({ url, title }) => ({ url, title }));
  const sessionId = "session-" + Math.random();
  const session = {
    id: sessionId,
    name,
    tabs
  };
  
  browser.storage.sync.set({ 
    currentSessionId: sessionId,
    sessions: {
      ...sessions,
      [sessionId]: session
    }
  });

  loadSession(session);
}

async function deleteSession(sessionId) {
  let { currentSessionId, sessions={} } = await browser.storage.sync.get(["currentSessionId", "sessions"]);
  console.log("Deleting session", sessionId, sessions[sessionId].name);
  if (currentSessionId === sessionId) {
    console.log("Session", sessionId, "is current session, closing it");
    await closeCurrentSession();
  }
  delete sessions[sessionId];
  await browser.storage.sync.set({ currentSessionId, sessions });
}

async function closeCurrentSession() {
  console.log("Closing session");
  browser.storage.sync.set({ currentSessionId: null });
  if (stopTracking != null) {
    stopTracking();
    stopTracking = null;
  }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const action = {
    switchSession,
    newSession,
    deleteSession,
    closeCurrentSession
  }[request.action];
  if (action != null) {
    Promise.resolve(action(request.payload))
      .then(sendResponse, console.warn);
  } else {
    console.error("Unknown action", request.action);
  }
});

loadPreviousSession();


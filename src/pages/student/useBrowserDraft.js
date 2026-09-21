import { useEffect, useRef, useState } from "react";

let writeQueue = Promise.resolve();

function imageStore(mode, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("talentbridge-preview", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("drafts");
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Storage is busy. Close other TalentBridge tabs and retry."));
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("drafts", mode);
      const store = transaction.objectStore("drafts");
      const operation = mode === "readonly"
        ? store.get("student-avatar-v1")
        : store.put(value, "student-avatar-v1");
      transaction.oncomplete = () => {
        db.close();
        resolve(operation.result);
      };
      transaction.onabort = transaction.onerror = () => {
        db.close();
        reject(transaction.error || new Error("Storage failed"));
      };
    };
  });
}

// The key and storage type must stay constant for each mounted component.
export default function useBrowserDraft(key, initialValue, images = false) {
  const initial = useRef(initialValue);
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Loading saved data…");
  const [error, setError] = useState("");
  const lastSaved = useRef(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await writeQueue;
        const stored = images
          ? await imageStore("readonly")
          : JSON.parse(localStorage.getItem(key) || "null");
        if (!active) return;
        const restored = stored ?? initial.current;
        lastSaved.current = JSON.stringify(restored);
        setValue(restored);
        setReady(true);
        setStatus("Saved in this browser");
      } catch {
        if (active) {
          setError("Could not load browser storage. Allow site storage, then refresh to try again.");
          setStatus("Storage unavailable");
        }
      }
    }
    load();
    return () => { active = false; };
  }, [key, images]);

  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastSaved.current) return;
    let active = true;
    setStatus("Saving…");
    setError("");
    const save = writeQueue.then(async () => {
      if (images) await imageStore("readwrite", value);
      else localStorage.setItem(key, serialized);
    });
    writeQueue = save.catch(() => {});
    save.then(() => {
      if (active) {
        lastSaved.current = serialized;
        setStatus("Saved in this browser");
      }
    }).catch(() => {
      if (active) {
        setStatus("Not saved");
        setError("Could not save changes. Browser storage may be full or blocked. Keep this page open and try again after freeing space.");
      }
    });
    return () => { active = false; };
  }, [value, ready, key, images]);

  return [value, setValue, { ready, status, error }];
}

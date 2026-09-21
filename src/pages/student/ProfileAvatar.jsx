import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  ImagePlus,
  Smile,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import "./ProfileAvatar.css";
import useBrowserDraft from "./useBrowserDraft";

const avatars = [
  { id: "blue", background: "#dbeafe", shirt: "#2563eb", skin: "#dba77d" },
  { id: "purple", background: "#ede9fe", shirt: "#7c3aed", skin: "#965e42" },
  { id: "green", background: "#dcfce7", shirt: "#15803d", skin: "#f0c5a3" },
  { id: "rose", background: "#ffe4e6", shirt: "#e11d48", skin: "#bf825c" },
  { id: "orange", background: "#ffedd5", shirt: "#ea580c", skin: "#70452f" },
  { id: "teal", background: "#ccfbf1", shirt: "#0f766e", skin: "#e6b28c" },
];

function Character({ avatar }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" fill={avatar.background} />
      <path
        d="M14 100V88c0-21 16-33 36-33s36 12 36 33v12"
        fill={avatar.shirt}
      />
      <rect x="43" y="51" width="14" height="20" rx="6" fill={avatar.skin} />
      <ellipse cx="50" cy="39" rx="21" ry="25" fill={avatar.skin} />
      <path
        d="M29 39V28C29 6 72 6 72 29v12l-8-17c-8 9-20 11-35 9"
        fill="#243047"
      />
      <circle cx="42" cy="40" r="2" fill="#243047" />
      <circle cx="58" cy="40" r="2" fill="#243047" />
      <path
        d="M43 51q7 6 14 0"
        fill="none"
        stroke="#753f35"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AvatarPicture({ picture, initials, frame = "original" }) {
  return (
    <span className={`tb-avatar-picture tb-avatar-picture--${frame}`}>
      {picture?.type === "photo" ? (
        <img src={picture.value} alt="" />
      ) : picture?.type === "character" ? (
        <Character avatar={picture.value} />
      ) : (
        <span className="tb-avatar-initials">{initials}</span>
      )}

      {frame === "work" && (
        <span className="tb-avatar-frame-label">OPEN TO WORK</span>
      )}
    </span>
  );
}

export default function ProfileAvatar({ name = "" }) {
  const [savedAvatar, setSavedAvatar, storage] = useBrowserDraft(
    "student-avatar-v1", { picture: null, frame: "original" }, true
  );
  const { picture, frame } = savedAvatar;
  const setPicture = (next) => setSavedAvatar(current => ({ ...current, picture: next }));
  const setFrame = (next) => setSavedAvatar(current => ({ ...current, frame: next }));
  const [draftFrame, setDraftFrame] = useState("original");
  const [draftAvatar, setDraftAvatar] = useState(avatars[0]);
  const [screen, setScreen] = useState("menu");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);
  const headingRef = useRef(null);
  const uploadRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      uploadRequestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) headingRef.current?.focus();
  }, [screen, isOpen]);

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S";

  const titles = {
    menu: "Profile picture",
    view: "Your profile photo",
    avatars: "Choose your avatar",
    frames: "Add a profile frame",
    remove: "Remove profile picture?",
  };

  function openMenu() {
    setScreen("menu");
    setError("");
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeDialog() {
    uploadRequestRef.current += 1;
    dialogRef.current?.close();
    setIsOpen(false);
  }

  function goBack() {
    setError("");
    setScreen("menu");
  }

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const request = ++uploadRequestRef.current;
    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }

    let url;

    try {
      url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const image = new Image();
      image.src = url;
      await image.decode();

      if (request !== uploadRequestRef.current) {
        return;
      }

      setPicture({ type: "photo", value: url });
      closeDialog();
    } catch {
      if (request === uploadRequestRef.current) {
        setError("This image could not be opened. Please choose another.");
      }
    }
  }

  function applyAvatar() {
    uploadRequestRef.current += 1;
    setPicture({ type: "character", value: draftAvatar });
    closeDialog();
  }

  function removePicture() {
    uploadRequestRef.current += 1;
    setPicture(null);
    setFrame("original");
    closeDialog();
  }

  return (
    <div className="tb-avatar">
      <button
        ref={triggerRef}
        type="button"
        className="tb-avatar-trigger"
        aria-label="View or change profile picture"
        aria-haspopup="dialog"
        disabled={!storage.ready}
        onClick={openMenu}
      >
        <AvatarPicture picture={picture} initials={initials} frame={frame} />
        <span className="tb-avatar-camera" aria-hidden="true">
          <Camera size={17} />
        </span>
      </button>

      <p className="tb-avatar-note" role="status">{storage.status}</p>
      {storage.error && <p className="tb-avatar-error" role="alert">{storage.error}</p>}

      <dialog
        ref={dialogRef}
        className={`tb-avatar-dialog tb-avatar-dialog--${screen}`}
        aria-label={titles[screen]}
        onCancel={() => {
          uploadRequestRef.current += 1;
          setIsOpen(false);
        }}
        onClose={() => {
          setIsOpen(false);
          triggerRef.current?.focus();
        }}
      >
        <div className="tb-avatar-handle" aria-hidden="true" />

        <header className="tb-avatar-header">
          {screen !== "menu" && (
            <button
              type="button"
              className="tb-avatar-icon-button"
              aria-label="Back to picture options"
              onClick={goBack}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <h2 ref={headingRef} tabIndex={-1}>
            {titles[screen]}
          </h2>

          <button
            type="button"
            className="tb-avatar-icon-button"
            aria-label="Close"
            onClick={closeDialog}
          >
            <X size={20} />
          </button>
        </header>

        <div className="tb-avatar-body">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadPhoto}
            hidden
          />

          {screen === "menu" && (
  <div className="tb-avatar-menu">
    <button type="button" onClick={() => setScreen("view")}>
      <Camera size={20} />
      <span>View or edit profile photo</span>
      <ChevronRight size={17} />
    </button>

    <button
      type="button"
      onClick={() => {
        setDraftFrame(frame);
        setScreen("frames");
      }}
    >
      <ImagePlus size={20} />
      <span>Add frame</span>
      <ChevronRight size={17} />
    </button>
  </div>
)}

         {screen === "view" && (
  <>
    <div className="tb-avatar-photo-stage">
      <AvatarPicture
        picture={picture}
        initials={initials}
        frame={frame}
      />
    </div>

    <div className="tb-avatar-toolbar">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={22} aria-hidden="true" />
        <span>{picture ? "Update" : "Upload"}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setDraftAvatar(
            picture?.type === "character" ? picture.value : avatars[0]
          );
          setScreen("avatars");
        }}
      >
        <Smile size={22} aria-hidden="true" />
        <span>Avatars</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setDraftFrame(frame);
          setScreen("frames");
        }}
      >
        <ImagePlus size={22} aria-hidden="true" />
        <span>Frames</span>
      </button>

      {picture && (
        <button
          type="button"
          className="tb-avatar-toolbar-delete"
          onClick={() => setScreen("remove")}
        >
          <Trash2 size={22} aria-hidden="true" />
          <span>Delete</span>
        </button>
      )}
    </div>

    <p className="tb-avatar-note">
      JPG, PNG or WebP · Up to 5 MB
    </p>
  </>
)}

{screen === "avatars" && (
  <>
    <div className="tb-avatar-large-preview">
      <AvatarPicture
        picture={{ type: "character", value: draftAvatar }}
        initials={initials}
        frame={frame}
      />
    </div>

    <p className="tb-avatar-description">
      Pick a character for your profile.
    </p>

    <div className="tb-avatar-grid">
      {avatars.map((avatar, index) => (
        <button
          key={avatar.id}
          type="button"
          aria-label={`Choose avatar ${index + 1}`}
          aria-pressed={draftAvatar.id === avatar.id}
          onClick={() => setDraftAvatar(avatar)}
        >
          <Character avatar={avatar} />

          {draftAvatar.id === avatar.id && (
            <span className="tb-avatar-selected" aria-hidden="true">
              <Check size={13} />
            </span>
          )}
        </button>
      ))}
    </div>

    <button
      type="button"
      className="tb-avatar-primary"
      onClick={applyAvatar}
    >
      Apply avatar
    </button>
  </>
)}
          {screen === "frames" && (
            <>
              <div className="tb-avatar-large-preview">
                <AvatarPicture
                  picture={picture}
                  initials={initials}
                  frame={draftFrame}
                />
              </div>

              <div className="tb-avatar-frame-options">
                {[
                  { id: "original", label: "Original" },
                  { id: "work", label: "Open to Work" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={draftFrame === option.id}
                    onClick={() => setDraftFrame(option.id)}
                  >
                    <AvatarPicture
                      picture={picture}
                      initials={initials}
                      frame={option.id}
                    />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="tb-avatar-primary"
                onClick={() => {
                  setFrame(draftFrame);
                  closeDialog();
                }}
              >
                Apply frame
              </button>
            </>
          )}

          {screen === "remove" && (
            <>
              <p className="tb-avatar-description">
                Your picture will be replaced with your initials. You can add
                another picture anytime.
              </p>
              <div className="tb-avatar-confirm">
                <button type="button" onClick={goBack}>
                  Keep picture
                </button>
                <button
                  type="button"
                  className="tb-avatar-delete"
                  onClick={removePicture}
                >
                  Remove
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="tb-avatar-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}
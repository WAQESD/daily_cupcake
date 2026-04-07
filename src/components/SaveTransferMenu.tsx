import { startTransition, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";
import { exportGameState, importGameState } from "../lib/gameState";
import { useGameStore } from "../store/gameStore";
import type { GameState } from "../types/game";

type StatusTone = "info" | "success" | "error";
type StatusState = { message: string; tone: StatusTone };
type ActiveModal = "export" | "import" | null;

const menuWrapperStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gap: 10,
};

const triggerStyle: CSSProperties = {
  width: "fit-content",
  justifySelf: "start",
};

const menuPanelStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 12px)",
  right: 0,
  width: "min(320px, calc(100vw - 48px))",
  maxWidth: "calc(100vw - 48px)",
  padding: 18,
  border: "2px solid rgba(239, 154, 189, 0.72)",
  borderRadius: 24,
  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 246, 251, 0.94))",
  boxShadow: "0 22px 36px rgba(171, 79, 117, 0.18)",
  display: "grid",
  gap: 12,
  zIndex: 20,
};

const menuActionsStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const menuTextStyle: CSSProperties = {
  color: "var(--text-soft)",
  fontSize: "0.94rem",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  background: "rgba(78, 35, 55, 0.34)",
  backdropFilter: "blur(8px)",
};

const modalPanelStyle: CSSProperties = {
  width: "min(560px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 32px)",
  margin: 0,
  overflow: "auto",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const modalBodyStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  marginTop: 18,
};

const modalActionsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  flexWrap: "wrap",
};

const textAreaStyle: CSSProperties = {
  width: "100%",
  minHeight: 168,
  padding: "14px 16px",
  border: "2px solid rgba(239, 154, 189, 0.72)",
  borderRadius: 22,
  background: "rgba(255, 252, 254, 0.96)",
  color: "var(--text)",
  lineHeight: 1.5,
  resize: "vertical",
};

const warningStyle: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 18,
  border: "2px dashed rgba(239, 154, 189, 0.7)",
  background: "rgba(255, 242, 248, 0.88)",
  color: "var(--text-soft)",
  fontWeight: 700,
  lineHeight: 1.5,
};

function getStatusStyle(tone: StatusTone): CSSProperties {
  if (tone === "error") {
    return {
      borderStyle: "solid",
      borderColor: "rgba(201, 89, 89, 0.34)",
      background: "rgba(255, 238, 240, 0.94)",
      color: "#9a3d4d",
    };
  }

  if (tone === "success") {
    return {
      borderStyle: "solid",
      borderColor: "rgba(102, 181, 138, 0.34)",
      background: "rgba(241, 255, 247, 0.94)",
      color: "#2b7d54",
    };
  }

  return {
    borderStyle: "solid",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function SaveTransferMenu() {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const exportTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const importTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [exportValue, setExportValue] = useState("");
  const [importValue, setImportValue] = useState("");
  const [exportStatus, setExportStatus] = useState<StatusState>({ message: "", tone: "info" });
  const [importStatus, setImportStatus] = useState<StatusState>({ message: "", tone: "info" });

  const {
    inventory,
    selection,
    discoveredRecipeIds,
    collection,
    favorites,
    pendingBoxes,
    lastDeliveryResolvedAt,
    lastDailyClaimDate,
    dailyStreak,
    lastDailyChallengeDate,
    lastCraftedRecipeId,
    lastCraftedIngredientId,
    replaceGameState,
  } = useGameStore(
    useShallow((state) => ({
      inventory: state.inventory,
      selection: state.selection,
      discoveredRecipeIds: state.discoveredRecipeIds,
      collection: state.collection,
      favorites: state.favorites,
      pendingBoxes: state.pendingBoxes,
      lastDeliveryResolvedAt: state.lastDeliveryResolvedAt,
      lastDailyClaimDate: state.lastDailyClaimDate,
      dailyStreak: state.dailyStreak,
      lastDailyChallengeDate: state.lastDailyChallengeDate,
      lastCraftedRecipeId: state.lastCraftedRecipeId,
      lastCraftedIngredientId: state.lastCraftedIngredientId,
      replaceGameState: state.replaceGameState,
    })),
  );

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }

      setMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!activeModal) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveModal(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal]);

  useEffect(() => {
    if (activeModal !== "import") {
      return;
    }

    const timer = window.setTimeout(() => {
      importTextareaRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeModal]);

  useEffect(() => {
    if (activeModal !== "export" || !exportValue) {
      return;
    }

    const timer = window.setTimeout(() => {
      exportTextareaRef.current?.focus();
      exportTextareaRef.current?.select();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeModal, exportValue]);

  function createSnapshot(): GameState {
    return {
      inventory,
      selection,
      discoveredRecipeIds,
      collection,
      favorites,
      pendingBoxes,
      lastDeliveryResolvedAt,
      lastDailyClaimDate,
      dailyStreak,
      lastDailyChallengeDate,
      lastCraftedRecipeId,
      lastCraftedIngredientId,
    };
  }

  function closeModal() {
    setActiveModal(null);
  }

  async function handleOpenExport() {
    setMenuOpen(false);
    setActiveModal("export");
    setExportValue("");
    setExportStatus({ message: "압축 문자열을 생성하는 중이에요.", tone: "info" });

    try {
      const nextValue = await exportGameState(createSnapshot());
      setExportValue(nextValue);
      setExportStatus({
        message: "생성된 문자열을 복사해 다른 환경으로 옮겨 주세요.",
        tone: "success",
      });
    } catch (error) {
      setExportStatus({
        message: getErrorMessage(error, "저장 문자열을 생성하지 못했어요."),
        tone: "error",
      });
    }
  }

  function handleOpenImport() {
    setMenuOpen(false);
    setImportValue("");
    setImportStatus({
      message: "압축 문자열을 붙여넣은 뒤 가져오기를 눌러 주세요.",
      tone: "info",
    });
    setActiveModal("import");
  }

  async function handleCopyExport() {
    const trimmedValue = exportValue.trim();
    if (!trimmedValue) {
      setExportStatus({
        message: "먼저 내보내기 문자열을 생성해 주세요.",
        tone: "error",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmedValue);
      setExportStatus({ message: "압축 문자열을 클립보드에 복사했어요.", tone: "success" });
    } catch (error) {
      console.error("클립보드 복사에 실패했습니다.", error);
      exportTextareaRef.current?.focus();
      exportTextareaRef.current?.select();

      if (typeof document.execCommand === "function" && document.execCommand("copy")) {
        setExportStatus({ message: "압축 문자열을 클립보드에 복사했어요.", tone: "success" });
        return;
      }

      setExportStatus({
        message: "자동 복사에 실패했어요. 문자열을 직접 복사해 주세요.",
        tone: "error",
      });
    }
  }

  async function handleImport() {
    setImportStatus({ message: "저장 문자열을 확인하는 중이에요.", tone: "info" });

    try {
      const importedState = await importGameState(importValue);
      const confirmed = window.confirm(
        "현재 브라우저 저장 데이터가 가져온 값으로 전체 교체됩니다. 기존 데이터와 병합되지 않아요. 계속할까요?",
      );

      if (!confirmed) {
        setImportStatus({ message: "가져오기를 취소했어요.", tone: "info" });
        return;
      }

      startTransition(() => {
        replaceGameState(importedState);
      });

      setImportValue("");
      setActiveModal(null);
    } catch (error) {
      setImportStatus({
        message: getErrorMessage(error, "저장 문자열을 읽지 못했어요."),
        tone: "error",
      });
    }
  }

  return (
    <div ref={menuRef} style={menuWrapperStyle}>
      <button
        type="button"
        className="pixel-button pixel-button--ghost"
        style={triggerStyle}
        onClick={() => setMenuOpen((current) => !current)}
        aria-expanded={menuOpen}
      >
        저장 관리
      </button>

      {menuOpen ? (
        <div style={menuPanelStyle}>
          <div>
            <p className="eyebrow">백업 · 이동</p>
            <strong>압축 문자열로 현재 진행 데이터 옮기기</strong>
          </div>
          <p style={menuTextStyle}>
            내보내기로 현재 브라우저 저장값을 복사하고, 다른 환경에서는 가져오기로 그대로 복원할 수 있어요.
          </p>
          <div style={menuActionsStyle}>
            <button type="button" className="pixel-button pixel-button--primary" onClick={() => void handleOpenExport()}>
              내보내기
            </button>
            <button type="button" className="pixel-button" onClick={handleOpenImport}>
              가져오기
            </button>
          </div>
        </div>
      ) : null}

      {activeModal === "export" ? (
        <div style={overlayStyle} onClick={closeModal}>
          <div
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-export-title"
            style={modalPanelStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <p className="eyebrow">저장 데이터 내보내기</p>
                <h2 id="save-export-title">압축 문자열 생성</h2>
              </div>
              <button type="button" className="mini-button" onClick={closeModal}>
                닫기
              </button>
            </div>
            <div style={modalBodyStyle}>
              <p style={menuTextStyle}>
                아래 문자열을 복사해 두면 다른 브라우저나 기기에서도 현재 진행 상태를 그대로 이어서 플레이할 수 있어요.
              </p>
              <textarea
                ref={exportTextareaRef}
                value={exportValue}
                readOnly
                spellCheck={false}
                aria-label="내보낸 저장 데이터 문자열"
                style={textAreaStyle}
              />
              <div className="message-box" aria-live="polite" style={getStatusStyle(exportStatus.tone)}>
                {exportStatus.message}
              </div>
              <div style={modalActionsStyle}>
                <button type="button" className="pixel-button pixel-button--primary" onClick={() => void handleCopyExport()}>
                  문자열 복사
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeModal === "import" ? (
        <div style={overlayStyle} onClick={closeModal}>
          <div
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-import-title"
            style={modalPanelStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <p className="eyebrow">저장 데이터 가져오기</p>
                <h2 id="save-import-title">현재 진행 상태 복원</h2>
              </div>
              <button type="button" className="mini-button" onClick={closeModal}>
                닫기
              </button>
            </div>
            <div style={modalBodyStyle}>
              <p style={menuTextStyle}>
                내보내기에서 만든 압축 문자열을 붙여넣으면 현재 브라우저 저장 데이터가 가져온 값으로 전체 교체됩니다.
              </p>
              <div style={warningStyle}>가져오기를 확정하면 현재 저장 데이터는 덮어쓰이며, 병합되지 않아요.</div>
              <textarea
                ref={importTextareaRef}
                value={importValue}
                onChange={(event) => setImportValue(event.target.value)}
                spellCheck={false}
                aria-label="가져올 저장 데이터 문자열"
                placeholder="압축된 저장 문자열을 여기에 붙여넣어 주세요."
                style={textAreaStyle}
              />
              <div className="message-box" aria-live="polite" style={getStatusStyle(importStatus.tone)}>
                {importStatus.message}
              </div>
              <div style={modalActionsStyle}>
                <button type="button" className="pixel-button pixel-button--primary" onClick={() => void handleImport()}>
                  가져와서 덮어쓰기
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

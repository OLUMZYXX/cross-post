import { RotateCcw } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

const TONES = ["casual", "professional", "funny", "bold", "friendly", "formal"];

export default function RephraseModal({ open, onClose, composer }) {
  const { isRephrasing, rephrasedText, selectedTone, handleRephrase, applyRephrase } = composer;

  const apply = () => {
    applyRephrase();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} eyebrow="AI rephrase" title="Pick a tone">
      <p className="text-cp-muted text-sm mb-4">
        Same message, a different voice. Your facts stay the same.
      </p>
      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <button
            key={tone}
            type="button"
            onClick={() => handleRephrase(tone)}
            disabled={isRephrasing}
            aria-pressed={selectedTone === tone}
            className={`cp-press rounded-full border px-3.5 py-2 text-[13px] font-semibold capitalize transition-colors disabled:opacity-60 ${
              selectedTone === tone
                ? "bg-cp-ink border-cp-ink text-cp-card"
                : "bg-cp-card border-cp-rule text-cp-ink hover:border-cp-soft"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>

      {isRephrasing ? <Spinner className="py-8" size={20} /> : null}

      {rephrasedText && !isRephrasing ? (
        <div className="mt-5">
          <div className="rounded-2xl bg-cp-deep border border-cp-rule p-4 text-cp-ink text-[15px] leading-relaxed">
            {rephrasedText}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleRephrase(selectedTone)}
              className="flex-1"
            >
              <RotateCcw size={15} /> Regenerate
            </Button>
            <Button variant="primary" size="md" onClick={apply} className="flex-1">
              Use this
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default function QuestionBankList({ questionBank, onEdit, onAddNew }) {
  return (
    <>
      <p className="pp-hint">
        These are the field-tap "what does it mean" questions in Match Day. Tap one to edit its wording,
        markers, or answer zones, or add a new one below.
      </p>
      <div className="pp-list">
        {questionBank.map((q) => (
          <button key={q.id} className="pp-qbank-item" onClick={() => onEdit({ ...q })}>
            <span className="pp-qbank-term pp-pixel">{q.term || 'UNTITLED'}</span>
            <span className="pp-qbank-preview">{q.prompt}</span>
            <span className="pp-qbank-meta">{(q.zones || []).length} zone(s) &middot; {(q.context || []).length} marker(s)</span>
          </button>
        ))}
      </div>
      <div className="pp-action-bar">
        <button className="pp-btn primary" onClick={onAddNew}>+ ADD QUESTION</button>
      </div>
    </>
  );
}

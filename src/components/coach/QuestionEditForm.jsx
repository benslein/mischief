export const MARKER_TYPES = [
  { id: 'ball', label: 'BALL' },
  { id: 'teammate', label: 'TEAMMATE' },
  { id: 'opponent', label: 'OTHER TEAM' },
];

export default function QuestionEditForm({ term, setTerm, prompt, setPrompt, context, setContext, zones, setZones, markerType, setMarkerType, zoneMode, setZoneMode, zoneCorner, setZoneCorner, isNew, onSave, onCancel, onDelete, questionId }) {
  const canSave = prompt.trim().length > 0 && zones.length > 0;

  return (
    <>
      <input
        className="pp-text-input"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Term (e.g. Through Ball) - optional"
        maxLength={30}
      />
      <textarea
        className="pp-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Question prompt the player will read..."
        rows={4}
      />

      <p className="pp-hint">
        {zoneMode
          ? (zoneCorner ? 'Tap the opposite corner on the field to finish the answer zone.' : 'Tap one corner of the answer zone on the field.')
          : <>Tap the field to drop a <b>{MARKER_TYPES.find((m) => m.id === markerType)?.label.toLowerCase()}</b> marker, or tap ZONE to draw a correct-answer area (you can add more than one).</>}
      </p>

      <div className="pp-chip-row">
        {MARKER_TYPES.map((m) => (
          <button
            key={m.id}
            className={`pp-chip${!zoneMode && markerType === m.id ? ' active' : ''}`}
            onClick={() => { setMarkerType(m.id); setZoneMode(false); setZoneCorner(null); }}
          >
            + {m.label}
          </button>
        ))}
        <button
          className={`pp-chip${zoneMode ? ' active' : ''}`}
          onClick={() => { setZoneMode(true); setZoneCorner(null); }}
        >
          + ZONE
        </button>
      </div>

      {(context.length > 0 || zones.length > 0) && (
        <div className="pp-list">
          {context.map((m, i) => {
            const desc = m.render === 'ball' ? 'Ball'
              : m.render === 'player' ? 'Teammate'
              : (m.render === 'attacker' || m.render === 'defender') ? 'Other team'
              : m.render;
            return (
              <div className="pp-list-row" key={`m-${i}`}>
                <span>{desc} marker at ({Math.round(m.x)}, {Math.round(m.y)})</span>
                <button className="pp-list-remove" onClick={() => setContext((prev) => prev.filter((_, idx) => idx !== i))}>&times;</button>
              </div>
            );
          })}
          {zones.map((z, i) => (
            <div className="pp-list-row" key={`z-${i}`}>
              <span>Answer zone {i + 1}: x {Math.round(z.xMin)}-{Math.round(z.xMax)}, y {Math.round(z.yMin)}-{Math.round(z.yMax)}</span>
              <button className="pp-list-remove" onClick={() => setZones((prev) => prev.filter((_, idx) => idx !== i))}>&times;</button>
            </div>
          ))}
        </div>
      )}

      {!canSave && <p className="pp-hint">Needs a prompt and at least one answer zone before it can be saved.</p>}

      <div className="pp-action-bar">
        <button className="pp-btn" onClick={onCancel}>CANCEL</button>
        {!isNew && <button className="pp-btn" onClick={() => onDelete(questionId)}>DELETE</button>}
        <button className="pp-btn primary" disabled={!canSave} onClick={() => onSave({ id: questionId, term, prompt, context, zones })}>SAVE</button>
      </div>
    </>
  );
}

import { useState, useRef } from 'react';
import { Upload, Download, RotateCcw } from 'lucide-react';
import { ALL_SLOTS, FORMATION_2_3_1, ROLE_COLOR, ROSTER, SITUATIONS, SLOT_ORDER } from '../data/gameData.js';
import { getBallRects } from '../utils/sprites.jsx';
import { fieldClickToPercent } from '../utils/fieldLogic.jsx';
import FieldMarkings from '../components/FieldMarkings.jsx';
import EditField from '../components/coach/EditField.jsx';
import QuestionEditForm from '../components/coach/QuestionEditForm.jsx';
import QuestionBankList from '../components/coach/QuestionBankList.jsx';

/* =========================================================================
   COACH SCREEN
   ========================================================================= */

export default function CoachScreen({ positionData, onUpdatePosition, onResetSituation, questionBank, onSaveQuestion, onDeleteQuestion, onImportCoachData, venue }) {
  const [coachTab, setCoachTab] = useState('positions');
  const [situationId, setSituationId] = useState(SITUATIONS[0].id);
  const [selectedSlot, setSelectedSlot] = useState('gk');
  const fileInputRef = useRef(null);

  // Question editing state lives here (not inside the form component) so
  // both the field (main column) and the form controls (sidebar) can share
  // it - tapping the field updates context/zones, which the sidebar list
  // reflects immediately, and vice versa.
  const [editingQuestion, setEditingQuestion] = useState(null); // {id, term, prompt, context, zones, isNew} | null
  const [term, setTerm] = useState('');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState([]);
  const [zones, setZones] = useState([]);
  const [markerType, setMarkerType] = useState('ball');
  const [zoneMode, setZoneMode] = useState(false);
  const [zoneCorner, setZoneCorner] = useState(null);

  function startEditing(q) {
    setEditingQuestion(q);
    setTerm(q.term || '');
    setPrompt(q.prompt || '');
    setContext(q.context || []);
    setZones(q.zones || []);
    setMarkerType('ball');
    setZoneMode(false);
    setZoneCorner(null);
  }
  function stopEditing() {
    setEditingQuestion(null);
  }
  function handleAddNewQuestion() {
    startEditing({ id: `custom-${Date.now()}`, term: '', prompt: '', context: [], zones: [], isNew: true });
  }
  function handleSaveQuestion(q) {
    onSaveQuestion(q);
    stopEditing();
  }
  function handleDeleteQuestion(id) {
    onDeleteQuestion(id);
    stopEditing();
  }
  function handleEditFieldTap(pt) {
    if (zoneMode) {
      if (!zoneCorner) {
        setZoneCorner(pt);
      } else {
        const xMin = Math.min(zoneCorner.x, pt.x);
        const xMax = Math.max(zoneCorner.x, pt.x);
        const yMin = Math.min(zoneCorner.y, pt.y);
        const yMax = Math.max(zoneCorner.y, pt.y);
        setZones((prev) => [...prev, { xMin, xMax, yMin, yMax }]);
        setZoneCorner(null);
        setZoneMode(false);
      }
      return;
    }
    if (markerType === 'ball') {
      setContext((prev) => [...prev, { x: pt.x, y: pt.y, render: 'ball', label: 'Ball' }]);
      return;
    }
    if (markerType === 'teammate') {
      // Pick a random roster look at the moment the marker is placed, so it
      // renders as one of the team's own sprites (in the team kit) rather
      // than a generic dot. The pick is locked in on the marker itself, not
      // re-randomized on every render.
      const pick = ROSTER[Math.floor(Math.random() * ROSTER.length)];
      setContext((prev) => [...prev, {
        x: pt.x, y: pt.y, render: 'player',
        shape: pick.shape, colors: pick.colors, eyeRow: pick.eyeRow, mouthRow: pick.mouthRow,
        label: 'Teammate',
      }]);
      return;
    }
    // 'opponent' - renders as the fixed other-team look (blue kit, angry
    // expression) via the existing 'attacker' render branch.
    setContext((prev) => [...prev, { x: pt.x, y: pt.y, render: 'attacker', label: 'OTHER TEAM' }]);
  }

  const overrides = positionData[situationId] || {};
  const positions = {};
  ALL_SLOTS.forEach((slot) => {
    positions[slot.id] = overrides[slot.id] || { x: slot.x, y: slot.y };
  });
  const currentSituation = SITUATIONS.find((s) => s.id === situationId);

  function selectSituation(id) { setSituationId(id); setSelectedSlot('gk'); }
  function handleFieldClick(pct) {
    if (!selectedSlot) return;
    onUpdatePosition(situationId, selectedSlot, pct);
    const idx = SLOT_ORDER.indexOf(selectedSlot);
    setSelectedSlot(SLOT_ORDER[idx + 1] || null);
  }

  function handleExport() {
    const payload = { type: 'pixel-pitch-coach-data', version: 1, positionData, questionBank };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pixel-pitch-coach-data.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0]; e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data?.positionData || !Array.isArray(data?.questionBank)) { window.alert("Invalid export file."); return; }
        if (!window.confirm('Replace current positions and question bank?')) return;
        onImportCoachData(data.positionData, data.questionBank);
      } catch { window.alert('Could not read file.'); }
    };
    reader.readAsText(file);
  }

  const W = 300, H = 440;

  // Switching tabs away from "questions" while mid-edit would leave stale
  // editing state behind; clear it so re-opening Questions starts fresh.
  function switchTab(tab) {
    if (tab !== 'questions') stopEditing();
    setCoachTab(tab);
  }

  return (
    <div className="pp-main">
      {/* Left: field */}
      <div className="pp-field-col">
        {coachTab === 'positions' ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="pp-coach-field" onClick={(e) => {
            const { x, y } = fieldClickToPercent(e, W, H);
            handleFieldClick({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
          }}>
            <FieldMarkings W={W} H={H} venue={venue} />
            {FORMATION_2_3_1.map((slot) => {
              const px = (slot.x / 100) * W, py = (slot.y / 100) * H;
              return <circle key={`ref-${slot.id}`} cx={px} cy={py} r="10" fill="none" stroke="var(--field-line)" strokeWidth="1" strokeDasharray="2 2" opacity="0.35" />;
            })}
            {FORMATION_2_3_1.map((slot) => {
              const pos = positions[slot.id];
              const px = (pos.x / 100) * W, py = (pos.y / 100) * H;
              const isSel = selectedSlot === slot.id;
              return (
                <g key={slot.id}>
                  {isSel && <circle cx={px} cy={py} r="20" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />}
                  <circle cx={px} cy={py} r="14" fill={ROLE_COLOR[slot.id]} stroke="var(--bg)" strokeWidth="2" />
                  <text x={px} y={py + 1} className="pp-coach-label">{slot.label}</text>
                </g>
              );
            })}
            {(() => {
              const pos = positions.ball; const px = (pos.x / 100) * W, py = (pos.y / 100) * H;
              const scale = 3;
              return (
                <g>
                  {selectedSlot === 'ball' && <circle cx={px} cy={py} r="18" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />}
                  <g transform={`translate(${px - 4 * scale} ${py - 4 * scale}) scale(${scale})`}>{getBallRects()}</g>
                </g>
              );
            })()}
          </svg>
        ) : editingQuestion ? (
          <EditField context={context} zones={zones} pendingCorner={zoneCorner} onTap={handleEditFieldTap} />
        ) : (
          <div className="pp-field-empty-state">
            <p className="pp-hint">Select a question from the list, or add a new one, to edit it on the field.</p>
          </div>
        )}
      </div>

      {/* Right: sidebar */}
      <div className="pp-sidebar">
        <div className="pp-sidebar-inner">
          <div className="pp-action-bar">
            <button className="pp-btn" onClick={handleExport}><Download size={12} /> EXPORT</button>
            <button className="pp-btn" onClick={() => fileInputRef.current?.click()}><Upload size={12} /> IMPORT</button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
          </div>

          <div className="pp-subtab-row">
            <button className={`pp-subtab${coachTab === 'positions' ? ' active' : ''}`} onClick={() => switchTab('positions')}>POSITIONS</button>
            <button className={`pp-subtab${coachTab === 'questions' ? ' active' : ''}`} onClick={() => switchTab('questions')}>QUESTIONS</button>
          </div>

          {coachTab === 'positions' && (
            <>
              <div className="pp-situation-grid">
                {SITUATIONS.map((sit) => {
                  const count = Object.keys(positionData[sit.id] || {}).length;
                  return (
                    <button key={sit.id} className={`pp-sit-btn${sit.id === situationId ? ' active' : ''}${count === 8 ? ' done' : ''}`} onClick={() => selectSituation(sit.id)}>
                      <span className="pp-sit-group">{sit.group}</span>
                      <span className="pp-sit-side">{sit.side}</span>
                      <span className="pp-sit-progress">{count} / 8</span>
                    </button>
                  );
                })}
              </div>

              <p className="pp-hint">
                {selectedSlot
                  ? <>Tap field to place <b>{ALL_SLOTS.find((s) => s.id === selectedSlot).full}</b> — <b>{currentSituation.group} {currentSituation.side}</b></>
                  : <>All set for <b>{currentSituation.group} — {currentSituation.side}</b>. Tap a chip to adjust.</>}
              </p>

              <div className="pp-chip-row">
                {ALL_SLOTS.map((slot) => (
                  <button key={slot.id} className={`pp-chip${selectedSlot === slot.id ? ' active' : ''}${overrides[slot.id] ? ' set' : ''}`} onClick={() => setSelectedSlot(slot.id)}>
                    {slot.label}
                  </button>
                ))}
              </div>

              <button className="pp-btn" onClick={() => onResetSituation(situationId)}>
                <RotateCcw size={12} /> RESET
              </button>
            </>
          )}

          {coachTab === 'questions' && (
            editingQuestion ? (
              <QuestionEditForm
                term={term} setTerm={setTerm}
                prompt={prompt} setPrompt={setPrompt}
                context={context} setContext={setContext}
                zones={zones} setZones={setZones}
                markerType={markerType} setMarkerType={setMarkerType}
                zoneMode={zoneMode} setZoneMode={setZoneMode}
                zoneCorner={zoneCorner} setZoneCorner={setZoneCorner}
                isNew={!!editingQuestion.isNew}
                questionId={editingQuestion.id}
                onSave={handleSaveQuestion}
                onCancel={stopEditing}
                onDelete={handleDeleteQuestion}
              />
            ) : (
              <QuestionBankList questionBank={questionBank} onEdit={startEditing} onAddNew={handleAddNewQuestion} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive Room Editor for Keystone Training
 * 
 * Allows users to:
 * 1. Click and drag rooms to reposition them
 * 2. Resize rooms by dragging edges
 * 3. Record the changes and reasoning for ML training
 * 4. Save the annotated changes to the backend
 */

class RoomEditor {
  constructor(svgContainer, planSpec) {
    this.svgContainer = svgContainer;
    this.planSpec = JSON.parse(JSON.stringify(planSpec)); // deep copy
    this.originalPlanSpec = JSON.parse(JSON.stringify(planSpec));
    this.changes = []; // Array of {action, id, before, after, reason}
    this.selectedRoom = null;
    this.dragMode = null; // 'move', 'resize-right', 'resize-bottom', etc.
    this.dragStart = null;
    this.isEditing = false;
    
    this.init();
  }

  init() {
    // Create editor UI
    this.createEditorUI();
    this.attachEventListeners();
    this.renderEditableSVG();
  }

  createEditorUI() {
    const editor = document.createElement('div');
    editor.id = 'room-editor-panel';
    editor.className = 'room-editor-panel';
    editor.innerHTML = `
      <div class="editor-header">
        <h3>Room Editor</h3>
        <button id="editor-close-btn" class="editor-close-btn">×</button>
      </div>
      <div class="editor-toolbar">
        <button id="editor-undo-btn" class="editor-btn">↶ Undo</button>
        <button id="editor-reset-btn" class="editor-btn">⟲ Reset</button>
        <button id="editor-save-btn" class="editor-btn editor-save-btn">✓ Save Changes</button>
      </div>
      <div class="editor-info">
        <p id="editor-status">Click on a room to select it. Drag to move, drag edges to resize.</p>
      </div>
      <div class="editor-changes-log">
        <h4>Changes Log</h4>
        <div id="editor-changes-list"></div>
      </div>
    `;
    
    this.svgContainer.parentElement.insertBefore(editor, this.svgContainer);
    
    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .room-editor-panel {
        position: absolute;
        right: 0;
        top: 0;
        width: 300px;
        height: 100%;
        background: #1a1a1a;
        border-left: 1px solid #333;
        display: flex;
        flex-direction: column;
        z-index: 1000;
        overflow-y: auto;
      }
      .editor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #333;
      }
      .editor-header h3 {
        font-size: 14px;
        margin: 0;
        color: #fff;
      }
      .editor-close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
      }
      .editor-toolbar {
        display: flex;
        gap: 8px;
        padding: 8px;
        border-bottom: 1px solid #333;
      }
      .editor-btn {
        flex: 1;
        padding: 6px 8px;
        font-size: 11px;
        background: #252525;
        border: 1px solid #333;
        color: #e8e8e8;
        border-radius: 4px;
        cursor: pointer;
      }
      .editor-btn:hover {
        background: #333;
      }
      .editor-save-btn {
        background: #1d4ed8;
        border-color: #2563eb;
        color: #fff;
      }
      .editor-save-btn:hover {
        background: #2563eb;
      }
      .editor-info {
        padding: 8px;
        background: #161616;
        border-bottom: 1px solid #333;
      }
      .editor-info p {
        font-size: 11px;
        color: #888;
        margin: 0;
      }
      .editor-changes-log {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      .editor-changes-log h4 {
        font-size: 12px;
        color: #60a5fa;
        margin-bottom: 8px;
      }
      .change-item {
        background: #252525;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 8px;
        font-size: 11px;
      }
      .change-item-action {
        color: #fbbf24;
        font-weight: 600;
      }
      .change-item-reason {
        color: #888;
        margin-top: 4px;
        font-style: italic;
      }
      
      /* SVG editing styles */
      .editable-room {
        cursor: move;
        transition: opacity 0.2s;
      }
      .editable-room:hover {
        opacity: 0.8;
      }
      .editable-room.selected {
        stroke: #60a5fa !important;
        stroke-width: 2 !important;
      }
      .room-resize-handle {
        cursor: nwse-resize;
        fill: #60a5fa;
        opacity: 0;
      }
      .room-resize-handle:hover {
        opacity: 0.8;
      }
      .editable-room.selected .room-resize-handle {
        opacity: 0.5;
      }
    `;
    document.head.appendChild(style);
  }

  attachEventListeners() {
    document.getElementById('editor-close-btn').addEventListener('click', () => this.close());
    document.getElementById('editor-undo-btn').addEventListener('click', () => this.undo());
    document.getElementById('editor-reset-btn').addEventListener('click', () => this.reset());
    document.getElementById('editor-save-btn').addEventListener('click', () => this.saveChanges());
  }

  renderEditableSVG() {
    // Clear existing SVG
    this.svgContainer.innerHTML = '';
    
    // Create SVG for each level
    const levels = this.planSpec.levels || [];
    for (const level of levels) {
      const svg = this.createLevelSVG(level);
      this.svgContainer.appendChild(svg);
    }
  }

  createLevelSVG(level) {
    const width = level.width || 400;
    const height = level.height || 300;
    const scale = Math.min(800 / width, 600 / height);
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width * scale);
    svg.setAttribute('height', height * scale);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('style', 'border: 1px solid #333; margin: 8px; background: #0f0f0f;');
    
    // Draw rooms
    for (const room of level.rooms || []) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', room.x);
      rect.setAttribute('y', room.y);
      rect.setAttribute('width', room.w);
      rect.setAttribute('height', room.h);
      rect.setAttribute('fill', this.getRoomColor(room.type));
      rect.setAttribute('stroke', '#666');
      rect.setAttribute('stroke-width', '1');
      rect.setAttribute('data-room-id', room.id);
      rect.setAttribute('data-room-type', room.type);
      rect.setAttribute('data-level', level.level);
      rect.className = 'editable-room';
      
      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', room.x + room.w / 2);
      text.setAttribute('y', room.y + room.h / 2);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', '#fff');
      text.setAttribute('pointer-events', 'none');
      text.textContent = `${room.label || room.type}`;
      
      // Add resize handle (bottom-right corner)
      const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      handle.setAttribute('x', room.x + room.w - 4);
      handle.setAttribute('y', room.y + room.h - 4);
      handle.setAttribute('width', '8');
      handle.setAttribute('height', '8');
      handle.setAttribute('data-handle-type', 'resize-br');
      handle.className = 'room-resize-handle';
      
      // Event listeners
      rect.addEventListener('mousedown', (e) => this.onRoomMouseDown(e, room, level));
      handle.addEventListener('mousedown', (e) => this.onResizeHandleMouseDown(e, room, level));
      
      svg.appendChild(rect);
      svg.appendChild(text);
      svg.appendChild(handle);
    }
    
    return svg;
  }

  onRoomMouseDown(e, room, level) {
    if (e.button !== 0) return; // left click only
    
    this.selectedRoom = { room, level, rect: e.target };
    e.target.classList.add('selected');
    
    this.dragMode = 'move';
    this.dragStart = { x: e.clientX, y: e.clientY, roomX: room.x, roomY: room.y };
    
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    this.updateStatus(`Selected: ${room.label || room.type}`);
  }

  onResizeHandleMouseDown(e, room, level) {
    e.stopPropagation();
    if (e.button !== 0) return;
    
    this.selectedRoom = { room, level, rect: e.target.parentElement.querySelector('rect') };
    this.selectedRoom.rect.classList.add('selected');
    
    this.dragMode = 'resize-br';
    this.dragStart = { x: e.clientX, y: e.clientY, roomW: room.w, roomH: room.h };
    
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    this.updateStatus(`Resizing: ${room.label || room.type}`);
  }

  onMouseMove(e) {
    if (!this.selectedRoom || !this.dragStart) return;
    
    const { room, level } = this.selectedRoom;
    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;
    
    if (this.dragMode === 'move') {
      const newX = Math.max(0, Math.min(this.dragStart.roomX + dx / 10, (level.width || 400) - room.w));
      const newY = Math.max(0, Math.min(this.dragStart.roomY + dy / 10, (level.height || 300) - room.h));
      
      room.x = Math.round(newX / 2) * 2; // snap to 2ft grid
      room.y = Math.round(newY / 2) * 2;
    } else if (this.dragMode === 'resize-br') {
      const newW = Math.max(4, this.dragStart.roomW + dx / 10);
      const newH = Math.max(4, this.dragStart.roomH + dy / 10);
      
      room.w = Math.round(newW / 2) * 2; // snap to 2ft grid
      room.h = Math.round(newH / 2) * 2;
    }
    
    this.renderEditableSVG();
  }

  onMouseUp(e) {
    if (!this.selectedRoom) return;
    
    const { room, level } = this.selectedRoom;
    const originalRoom = this.findRoomInOriginal(room.id, level.level);
    
    // Record change if room was modified
    if (originalRoom && (
      originalRoom.x !== room.x ||
      originalRoom.y !== room.y ||
      originalRoom.w !== room.w ||
      originalRoom.h !== room.h
    )) {
      let action = (originalRoom.x !== room.x || originalRoom.y !== room.y) ? 'move' : 'resize';
      if (originalRoom.w !== room.w || originalRoom.h !== room.h) {
        action = 'resize_and_move';
      }
      
      this.recordChange({
          action,
          id: room.id,
          levelLevel: level.level,
          before: { x: originalRoom.x, y: originalRoom.y, w: originalRoom.w, h: originalRoom.h },
        after: { x: room.x, y: room.y, w: room.w, h: room.h },
        reason: prompt(`Why did you make this change to ${room.label || room.type}?`) || 'No reason provided'
      });
    }
    
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
    
    this.dragMode = null;
    this.dragStart = null;
  }

  recordChange(change) {
    this.changes.push(change);
    this.updateChangesLog();
    this.updateStatus(`Recorded: ${change.action} on ${change.id}`);
  }

  updateChangesLog() {
    const list = document.getElementById('editor-changes-list');
    list.innerHTML = this.changes.map((change, idx) => `
      <div class="change-item">
        <div class="change-item-action">${idx + 1}. ${change.action.toUpperCase()}</div>
        <div>Room: ${change.id}</div>
        <div class="change-item-reason">Why: ${change.reason}</div>
      </div>
    `).join('');
  }

  updateStatus(msg) {
    document.getElementById('editor-status').textContent = msg;
  }

  findRoomInOriginal(roomId, level) {
    const lvl = this.originalPlanSpec.levels.find(l => l.level === level);
    return lvl ? lvl.rooms.find(r => r.id === roomId) : null;
  }

  getRoomColor(type) {
    const colors = {
      'living_room': '#4f46e5',
      'kitchen': '#f59e0b',
      'dining_room': '#8b5cf6',
      'bedroom': '#10b981',
      'primary_bedroom': '#06b6d4',
      'bathroom': '#ec4899',
      'primary_bathroom': '#f43f5e',
      'hallway': '#6b7280',
      'stairs': '#9333ea',
      'garage': '#78716c',
      'entry': '#3b82f6',
      'laundry': '#14b8a6',
      'mudroom': '#a16207',
      'storage': '#64748b',
    };
    return colors[type] || '#6b7280';
  }

  undo() {
    if (this.changes.length > 0) {
      this.changes.pop();
      this.planSpec = JSON.parse(JSON.stringify(this.originalPlanSpec));
      // Reapply all remaining changes
      for (const change of this.changes) {
        const room = this.findRoomInCurrent(change.id, change.levelLevel);
        if (room) {
          room.x = change.after.x;
          room.y = change.after.y;
          room.w = change.after.w;
          room.h = change.after.h;
        }
      }
      this.renderEditableSVG();
      this.updateChangesLog();
      this.updateStatus('Undone last change');
    }
  }

  reset() {
    if (confirm('Are you sure you want to reset all changes?')) {
      this.changes = [];
      this.planSpec = JSON.parse(JSON.stringify(this.originalPlanSpec));
      this.renderEditableSVG();
      this.updateChangesLog();
      this.updateStatus('Reset to original plan');
    }
  }

  findRoomInCurrent(roomId, level) {
    const lvl = this.planSpec.levels.find(l => l.level === level);
    return lvl ? lvl.rooms.find(r => r.id === roomId) : null;
  }

  async saveChanges() {
    if (this.changes.length === 0) {
      alert('No changes to save');
      return;
    }
    
    try {
      const response = await fetch('/api/training/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: this.planSpec.id,
          changes: this.changes,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert('Changes saved successfully!');
        this.close();
      } else {
        alert('Failed to save changes');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  close() {
    const panel = document.getElementById('room-editor-panel');
    if (panel) panel.remove();
  }
}

// Export for use in training.html
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoomEditor;
}

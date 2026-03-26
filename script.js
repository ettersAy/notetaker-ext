class NoteService {
  constructor() {
    this.storageKey = 'notes';
  }

  getNotes(callback) {
    chrome.storage.local.get([this.storageKey], result => {
      callback(result[this.storageKey] || []);
    });
  }

  addNote(note, callback) {
    this.getNotes(notes => {
      notes.push(note);
      chrome.storage.local.set({ [this.storageKey]: notes }, () => {
        callback();
      });
    });
  }

  deleteNote(index, callback) {
    this.getNotes(notes => {
      const newNotes = notes.filter((_, i) => i !== index);
      chrome.storage.local.set({ [this.storageKey]: newNotes }, () => {
        callback();
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const noteService = new NoteService();
  const input = document.getElementById('note-input');
  const saveBtn = document.getElementById('save-btn');
  const notesList = document.getElementById('notes-list');

  // Render notes in the UI
  function renderNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach((note, idx) => {
      const li = document.createElement('li');
      li.textContent = note;
      li.dataset.idx = idx;
      // Clicking a note deletes it
      li.addEventListener('click', () => {
        noteService.deleteNote(idx, renderNotes);
      });
      notesList.appendChild(li);
    });
  }

  // Load existing notes on startup
  noteService.getNotes(renderNotes);

  // Save button click handler
  saveBtn.addEventListener('click', function() {
    const note = input.value.trim();
    if (note) {
      noteService.addNote(note, () => {
        input.value = '';
        noteService.getNotes(renderNotes);
      });
    }
  });
});
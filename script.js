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

  clearAll(callback) {
    chrome.storage.local.set({ [this.storageKey]: [] }, () => {
      callback();
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const noteService = new NoteService();
  const input = document.getElementById('note-input');
  const saveBtn = document.getElementById('save-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const notesList = document.getElementById('notes-list');

  // Render notes in the UI with delete and copy buttons
  function renderNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach((note, idx) => {
      const li = document.createElement('li');
      li.textContent = note;

      // Create delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.marginLeft = '5px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.addEventListener('click', event => {
        event.stopPropagation(); // Prevent triggering li click
        noteService.deleteNote(idx, () => {
          console.log('Note deleted');
          // Refresh the entire list by fetching fresh notes
          noteService.getNotes(renderNotes);
        });
      });

      // Create copy button
      const copyBtn = document.createElement('button');
      copyBtn.textContent = 'Copy';
      copyBtn.style.marginLeft = '5px';
      copyBtn.style.cursor = 'pointer';
      copyBtn.addEventListener('click', event => {
        event.stopPropagation(); // Prevent triggering li click
        navigator.clipboard.writeText(note).then(() => {
          console.log('Note copied to clipboard:', note);
        }).catch(err => {
          console.error('Failed to copy note: ', err);
        });
      });

      // Allow entire note to be edited maybe
      li.addEventListener('click', () => {
        if (event.target !== deleteBtn && event.target !== copyBtn) {
          // Optional: could start editing, but we just do nothing for now
          console.log('Note clicked');
        }
      });

      // Assemble elements
      const noteContainer = document.createElement('span');
      noteContainer.appendChild(li);
      noteContainer.appendChild(copyBtn);
      noteContainer.appendChild(deleteBtn);
      notesList.appendChild(noteContainer);
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
        // Refresh the list after adding
        noteService.getNotes(renderNotes);
      });
    }
  });

  // Clear All button click handler
  clearAllBtn.addEventListener('click', function() {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      noteService.clearAll(() => {
        console.log('All notes cleared');
        // Refresh the list after clearing
        noteService.getNotes(renderNotes);
      });
    }
  });
});
const OPENROUTER_API_KEY = "REPLACE_WITH_YOUR_OPENROUTER_KEY"; // replace with your real key
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";


const titleInput = document.getElementById("noteTitle");
const tagInput = document.getElementById("noteTags");
const contentInput = document.getElementById("noteContent");
const addBtn = document.getElementById("addNoteBtn");
const searchInput = document.getElementById("searchInput");

let notes = JSON.parse(localStorage.getItem('notes')) || [];
// Upgrade old notes so they have tags array
notes = notes.map(note => {
  if (!Array.isArray(note.tags)) note.tags = [];
  if (typeof note.summary !== "string") note.summary = "";
  return note;
});
renderNotes();

// Add Note
addBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const tags = tagInput.value
    .trim()
    .split(",")
    .map(t => t.trim())
    .filter(t => t);
  const content = contentInput.value.trim();

  if (!title || !content) {
    alert("Title and content is required");
    return;
  }

  const newNote = {
    title,
    tags,
    content,
    date: new Date().toLocaleString(),
    summary: ""
  };

  notes.push(newNote);
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();

  // Clear inputs
  titleInput.value = "";
  tagInput.value = "";
  contentInput.value = "";
});

// Main render
function renderNotesList(list, getIndex) {
  const container = document.getElementById("notesContainer");
  container.innerHTML = "";

  list.forEach((note, loopIndex) => {
    const noteCard = document.createElement("div");
    noteCard.className = "col-md-4 mb-3";

    const tagsHtml = (note.tags && note.tags.length)
      ? note.tags.map(tag => `<span class="badge bg-success me-1">${escapeHtml(tag)}</span>`).join("")
      : `<small class="text-muted">No tags</small>`;

    const idx = getIndex(note, loopIndex);

    noteCard.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${escapeHtml(note.title)}</h5>
          <h6 class="card-subtitle mb-2">${tagsHtml}</h6>
          <p class="card-text">${escapeHtml(note.content)}</p>
          ${note.summary ? `<div class="d-flex align-items-start mt-2">
          <p class="summary-text text-info me-2 mb-0">${escapeHtml(note.summary)}</p>
          <button class="btn btn-sm btn-outline-secondary copy-summary-btn" data-text="${escapeHtml(note.summary)}">Copy</button>
        </div>` : ""}

        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <small class="text-muted">${note.date}</small>
          <div>
            <button class="btn btn-sm btn-info summarize-btn me-1" data-index="${idx}">Summarize</button>
            <button class="btn btn-sm btn-danger delete-btn" data-index="${idx}">Delete</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(noteCard);
  });

  attachNoteHandlers();
}

// Wrapper for all notes
function renderNotes() {
  renderNotesList(notes, (_, i) => i);
}

// Wrapper for filtered notes
function renderFilteredNotes(filteredNotes) {
  renderNotesList(filteredNotes, (note) => {
    const foundIndex = notes.indexOf(note);
    if (foundIndex !== -1) return foundIndex;
    return notes.findIndex(n =>
      n.title === note.title &&
      n.content === note.content &&
      n.date === note.date
    );
  });
}


// Live search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderNotes();
    return;
  }

  const filtered = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(query);
    const tagMatch = Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(query));
    return titleMatch || tagMatch;
  });

  renderFilteredNotes(filtered);
});

// Escape HTML helper
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function attachNoteHandlers() {
  // Delete Handlers
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {

      const idx = Number(e.currentTarget.dataset.index)

      if (isNaN(idx) || idx < 0) return;
      notes.splice(idx, 1)
      localStorage.setItem("notes", JSON.stringify(notes))
      renderNotes()
    })
  })

  //summarize handlers

  document.querySelectorAll(".summarize-btn").forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = Number(e.currentTarget.dataset.index)
      if (isNaN(idx) || idx < 0) return;
      const noteToSummarize = notes[idx]

      const cardBody = e.currentTarget.closest(".card").querySelector(".card-body")
      let summaryEl = cardBody.querySelector(".summary-text");
      if (!summaryEl) {
        summaryEl = document.createElement("p");
        summaryEl.className = "summary-text text-info mt-2";
        cardBody.appendChild(summaryEl);
      }
      summaryEl.textContent = "Summarizing...";

      try {
        const res = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant that summarizes notes." },
              { role: "user", content: `Summarize this note in one short sentence: ${noteToSummarize.content}` }
            ],
            max_tokens: 50
          })
        });

        const data = await res.json();
        const summary = data.choices?.[0]?.message?.content?.trim() || "No summary available.";
        summaryEl.textContent = "";
        let i = 0;
        function typeWriter() {
          if (i < summary.length) {
            summaryEl.textContent += summary[i];
            i++;
            setTimeout(typeWriter, 30); // speed in ms
          }
        }
        typeWriter();

        notes[idx].summary = summary;
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch (err) {
        summaryEl.textContent = "Error summarizing note.";
        console.error(err);
      }
    })
  })

  //Copy to Clipboard Button
  document.querySelectorAll(".copy-summary-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-text");
      navigator.clipboard.writeText(text)
        .then(() => {
          btn.textContent = "Copied!";
          btn.classList.add("copied");

          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 1500);
        })
        .catch(err => {
          console.error("Clipboard copy failed:", err);
        });
    });
  });


}


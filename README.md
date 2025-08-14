# 📝 AI-Powered Notes App  

**Live Demo:** [https://ai-powered-notes-app-added.netlify.app/](https://ai-powered-notes-app-added.netlify.app/)  

A feature-rich, browser-based notes application with **AI-powered summaries** and **tag-based search filtering**. Built with HTML, CSS (Bootstrap), and Vanilla JavaScript — no backend required.  

---

## 🚀 Features  

- **Add, Delete & Persist Notes**  
  - Create and delete notes directly in the browser.  
  - All notes saved in `localStorage` for offline persistence.  

- **Tag System**  
  - Assign tags to notes for better categorization.  
  - Search instantly filters notes by title or tags.  

- **AI-Powered Summaries**  
  - One-click summarization of note content via GPT-3.5 API (OpenRouter).  
  - Summaries stored locally to avoid repeated API calls.  

- **New (Day 45) — Copy to Clipboard** ✨  
  - Quickly copy summaries to clipboard with a single click.  
  - Visual feedback (“Copied!” in green) then reverts back to “Copy”.  

- **Mobile-Friendly Layout** (Bootstrap Grid)  
  - Fully responsive, adapts to different screen sizes.  

---

## 📅 Development Timeline  

### **Day 45**  
- Added **tag filtering**.  
- Integrated AI summarization (OpenRouter GPT-3.5).  
- Search remembers last query in localStorage.  

### **Day 45** *(Current)*  
- **Refactored render logic** → merged duplicate rendering into a single `renderNotesList()` engine.  
- **Copy to Clipboard** for summaries using Clipboard API + UI feedback polish.  
- Fixed layout jump on “Copied!” button click.  

---

## 📦 Tech Stack  

- **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript (ES6+)  
- **AI API:** OpenRouter GPT-3.5 (Free tier)  
- **Storage:** `localStorage`  

---

## 🛠 Setup & Usage  

1. **Clone Repo**  
   ```bash
   git clone https://github.com/your-username/ai-powered-notes-app.git
   cd ai-powered-notes-app

A simplified clone of Google Keep built with vanilla JavaScript, HTML, and CSS.
This project replicates core note-taking functionality while adding several interactive features such as search, drag-and-drop ordering, dark mode, and color-coded notes.

The goal of this project was to practice front-end application state management, DOM manipulation, and local storage persistence without using frameworks.

✨ Features
📝 Notes Management

Create notes with a title and text

Edit existing notes

Delete notes

Archive notes

Persistent storage using localStorage

🔍 Functional Search

Live filtering of notes while typing

Searches both note title and note content

🎨 Color-Coded Notes

Change note background colors

Helps visually categorize notes

🌙 Dark Mode

Toggle between light and dark themes

Improves usability in different environments

↕️ Drag & Drop Reordering

Rearrange notes using drag-and-drop interactions

Notes maintain their order after refresh via localStorage

💾 Persistent Storage

All notes are stored in browser localStorage, meaning:

Notes remain after page refresh

No backend required

🛠️ Tech Stack

Frontend

HTML5

CSS3

JavaScript (ES6)

Browser APIs

DOM Manipulation

Local Storage API

Drag & Drop API

Libraries

CUID for unique note IDs

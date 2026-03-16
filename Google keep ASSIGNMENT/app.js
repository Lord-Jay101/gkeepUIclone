class Note {
  constructor(id, title, text, color = null) {
    this.id = id;
    this.title = title;
    this.text = text;
    this.color = color;
  }
}

class App {
  constructor() {
    // localStorage.setItem('test', JSON.stringify(['123']));
    // console.log(JSON.parse(localStorage.getItem('test')));
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.selectedNoteId = "";
    this.miniSidebar = true;
    this.searchQuery = "";
    this.darkMode = localStorage.getItem("darkMode") === "true";
    this.draggedNoteId = null;
    this.noteColors = [
      "#ffffff",
      "#f28b82",
      "#fbbc04",
      "#fff475",
      "#ccff90",
      "#a7ffeb",
      "#cbf0f8",
      "#aecbfa",
      "#d7aefb",
      "#fdcfe8",
    ];

    this.$activeForm = document.querySelector(".active-form");
    this.$inactiveForm = document.querySelector(".inactive-form");
    this.$noteTitle = document.querySelector("#note-title");
    this.$noteText = document.querySelector("#note-text");
    this.$notes = document.querySelector(".notes");
    this.$form = document.querySelector("#form");
    this.$modal = document.querySelector(".modal");
    this.$modalForm = document.querySelector("#modal-form");
    this.$modalTitle = document.querySelector("#modal-title");
    this.$modalText = document.querySelector("#modal-text");
    this.$closeModalForm = document.querySelector("#modal-btn");
    this.$sidebar = document.querySelector(".sidebar");
    this.$sidebarActiveItem = document.querySelector(".active-item");
    this.$searchInput = document.querySelector("#search-input");
    this.$darkModeToggle = document.querySelector("#dark-mode-toggle");
    this.$darkModeIcon = document.querySelector("#dark-mode-icon");

    this.applyTheme();
    this.addEventListeners();
    this.displayNotes();
  }

  addEventListeners() {
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      this.closeModal(event);
      this.openModal(event);
      this.handleArchiving(event);
      this.handleColorPickerClick(event);
      this.handleColorPickerOutside(event);
    });

    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
      this.addNote({ title, text });
      this.closeActiveForm();
    });

    this.$modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    this.$sidebar.addEventListener("mouseover", (event) => {
      this.handleToggleSidebar();
    });

    this.$sidebar.addEventListener("mouseout", (event) => {
      this.handleToggleSidebar();
    });

    this.$searchInput.addEventListener("input", (event) => {
      this.searchQuery = event.target.value.trim().toLowerCase();
      this.displayNotes();
    });

    this.$darkModeToggle.addEventListener("click", () => {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
      this.applyTheme();
    });

    this.$notes.addEventListener("dragstart", (e) => this.handleDragStart(e));
    this.$notes.addEventListener("dragover", (e) => this.handleDragOver(e));
    this.$notes.addEventListener("drop", (e) => this.handleDrop(e));
    this.$notes.addEventListener("dragend", (e) => this.handleDragEnd(e));
  }

  applyTheme() {
    if (this.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      this.$darkModeIcon.textContent = "light_mode";
      this.$darkModeToggle.querySelector(".tooltip-text").textContent = "Light mode";
    } else {
      document.documentElement.removeAttribute("data-theme");
      this.$darkModeIcon.textContent = "dark_mode";
      this.$darkModeToggle.querySelector(".tooltip-text").textContent = "Dark mode";
    }
  }

  handleFormClick(event) {
    const isActiveFormClickedOn = this.$activeForm.contains(event.target);
    const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);

    if (isInactiveFormClickedOn) {
      this.openActiveForm();
    } else if (!isInactiveFormClickedOn) {
      console.log("INACTIVE FORM IS NOT CLICKED ON");
    }
  }

  openActiveForm() {
    this.$inactiveForm.style.display = "none";
    this.$activeForm.style.display = "block";
    this.$noteText.focus();
  }

  closeActiveForm() {
    this.$inactiveForm.style.display = "block";
    this.$activeForm.style.display = "none";
    this.$noteText.value = "";
    this.$noteTitle.value = "";
  }

  openModal(event) {
    if (event.target.closest(".change-color") || event.target.closest(".color-picker-popover")) return;
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && !event.target.closest(".archive")) {
      this.selectedNoteId = $selectedNote.id;
      this.$modalTitle.value = $selectedNote.children[1].innerHTML;
      this.$modalText.value = $selectedNote.children[2].innerHTML;
      this.$modal.classList.add("open-modal");
    } else {
      return;
    }
  }

  closeModal(event) {
    if (!this.$modal.classList.contains("open-modal")) return;
    const isDeleteClicked = event.target.closest(".modal-delete");
    if (isDeleteClicked) {
      this.deleteNote(this.selectedNoteId);
      this.$modal.classList.remove("open-modal");
      return;
    }
    const isModalFormClickedOn = this.$modalForm.contains(event.target);
    const isCloseModalBtnClickedOn = this.$closeModalForm.contains(
      event.target
    );
    if (!isModalFormClickedOn || isCloseModalBtnClickedOn) {
      this.editNote(this.selectedNoteId, {
        title: this.$modalTitle.value,
        text: this.$modalText.value,
      });
      this.$modal.classList.remove("open-modal");
    }
  }

  handleArchiving(event) {
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && event.target.closest(".archive")) {
      this.selectedNoteId = $selectedNote.id;
      this.deleteNote(this.selectedNoteId);
    } else {
      return;
    }
  }

  handleDragStart(e) {
    const note = e.target.closest(".note");
    if (!note) return;
    this.draggedNoteId = note.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", note.id);
    note.classList.add("note-dragging");
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    this.$notes.querySelectorAll(".note-drag-over").forEach((el) => el.classList.remove("note-drag-over"));
    const note = e.target.closest(".note");
    if (note && note.id !== this.draggedNoteId) {
      note.classList.add("note-drag-over");
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const note = e.target.closest(".note");
    if (!note || !this.draggedNoteId || note.id === this.draggedNoteId) return;
    this.reorderNotes(this.draggedNoteId, note.id);
    note.classList.remove("note-drag-over");
  }

  handleDragEnd(e) {
    const note = e.target.closest(".note");
    if (note) note.classList.remove("note-dragging");
    this.$notes.querySelectorAll(".note-drag-over").forEach((el) => el.classList.remove("note-drag-over"));
    this.draggedNoteId = null;
  }

  reorderNotes(draggedId, dropTargetId) {
    const fromIndex = this.notes.findIndex((n) => n.id === draggedId);
    const toIndex = this.notes.findIndex((n) => n.id === dropTargetId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const [moved] = this.notes.splice(fromIndex, 1);
    const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    this.notes.splice(insertIndex, 0, moved);
    this.render();
  }

  addNote({ title, text }) {
    if (text != "") {
      const newNote = new Note(cuid(), title, text);
      this.notes = [...this.notes, newNote];
      this.render();
    }
  }

  editNote(id, { title, text }) {
    this.notes = this.notes.map((note) => {
      if (note.id == id) {
        note.title = title;
        note.text = text;
      }
      return note;
    });
    this.render();
  }

  updateNoteColor(id, color) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.color = color || null;
      this.render();
    }
  }

  handleColorPickerClick(event) {
    if (!event.target.closest(".change-color")) return;
    event.stopPropagation();
    const fromModal = event.target.closest(".modal");
    const noteId = fromModal ? this.selectedNoteId : event.target.closest(".note")?.id;
    if (!noteId) return;
    this.openColorPicker(noteId, event.target.closest(".change-color"));
  }

  openColorPicker(noteId, anchorEl) {
    this.closeColorPicker();
    const rect = anchorEl.getBoundingClientRect();
    const popover = document.createElement("div");
    popover.className = "color-picker-popover";
    popover.setAttribute("data-note-id", noteId);
    popover.innerHTML = this.noteColors
      .map(
        (hex) =>
          `<button type="button" class="color-swatch" data-color="${hex}" style="background-color: ${hex}; border: ${hex === "#ffffff" ? "1px solid #dadce0" : "none"}" title="${hex}"></button>`
      )
      .join("");
    popover.style.left = `${rect.left}px`;
    popover.style.top = `${rect.bottom + 4}px`;
    document.body.appendChild(popover);
    popover.addEventListener("click", (e) => {
      const swatch = e.target.closest(".color-swatch");
      if (swatch) {
        const color = swatch.getAttribute("data-color");
        this.updateNoteColor(noteId, color === "#ffffff" ? null : color);
        this.closeColorPicker();
      }
    });
  }

  closeColorPicker() {
    document.querySelectorAll(".color-picker-popover").forEach((el) => el.remove());
  }

  handleColorPickerOutside(event) {
    if (event.target.closest(".color-picker-popover") || event.target.closest(".change-color")) return;
    this.closeColorPicker();
  }

  handleMouseOverNote(element) {
    const $note = document.querySelector("#" + element.id);
    const $checkNote = $note.querySelector(".check-circle");
    const $noteFooter = $note.querySelector(".note-footer");
    $checkNote.style.visibility = "visible";
    $noteFooter.style.visibility = "visible";
  }

  handleMouseOutNote(element) {
    const $note = document.querySelector("#" + element.id);
    const $checkNote = $note.querySelector(".check-circle");
    const $noteFooter = $note.querySelector(".note-footer");
    $checkNote.style.visibility = "hidden";
    $noteFooter.style.visibility = "hidden";
  }

  handleToggleSidebar() {
    if (this.miniSidebar) {
      this.$sidebar.style.width = "250px";
      this.$sidebar.classList.add("sidebar-hover");
      this.$sidebarActiveItem.classList.add("sidebar-active-item");
      this.miniSidebar = false;
    } else {
      this.$sidebar.style.width = "80px";
      this.$sidebar.classList.remove("sidebar-hover");
      this.$sidebarActiveItem.classList.remove("sidebar-active-item");
      this.miniSidebar = true;
    }
  }

  saveNotes() {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  render() {
    this.saveNotes();
    this.displayNotes();
  }

  displayNotes() {
    const filteredNotes = this.searchQuery
      ? this.notes.filter(
          (note) =>
            (note.title || "").toLowerCase().includes(this.searchQuery) ||
            (note.text || "").toLowerCase().includes(this.searchQuery)
        )
      : this.notes;
    this.$notes.innerHTML = filteredNotes
      .map(
        (note) =>
          `
        <div class="note" id="${note.id}" draggable="true" onmouseover="app.handleMouseOverNote(this)" onmouseout="app.handleMouseOutNote(this)" style="${note.color ? `background-color: ${note.color}` : ""}">
          <span class="material-symbols-outlined check-circle"
            >check_circle</span
          >
          <div class="title">${note.title}</div>
          <div class="text">${note.text}</div>
          <div class="note-footer">
            <div class="tooltip">
              <span class="material-symbols-outlined hover small-icon"
                >add_alert</span
              >
              <span class="tooltip-text">Remind me</span>
            </div>
            <div class="tooltip">
              <span class="material-symbols-outlined hover small-icon"
                >person_add</span
              >
              <span class="tooltip-text">Collaborator</span>
            </div>
            <div class="tooltip change-color">
              <span class="material-symbols-outlined hover small-icon"
                >palette</span
              >
              <span class="tooltip-text">Change Color</span>
            </div>
            <div class="tooltip">
              <span class="material-symbols-outlined hover small-icon"
                >image</span
              >
              <span class="tooltip-text">Add Image</span>
            </div>
            <div class="tooltip archive">
              <span class="material-symbols-outlined hover small-icon"
                >archive</span
              >
              <span class="tooltip-text">Archive</span>
            </div>
            <div class="tooltip">
              <span class="material-symbols-outlined hover small-icon"
                >more_vert</span
              >
              <span class="tooltip-text">More</span>
            </div>
          </div>
        </div>
        `
      )
      .join("");
  }

  deleteNote(id) {
    this.notes = this.notes.filter((note) => note.id != id);
    this.render();
  }
}

const app = new App();
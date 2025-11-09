const input = document.querySelector(".add-task input");
const addBtn = document.querySelector(".add-btn");
const taskList = document.querySelector(".task-list");
const filterBtns = document.querySelectorAll(".filter-btn");
const taskCounter = document.querySelector(".task-counter");
const toggleBtn = document.querySelector(".toggle-mode");

// data
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "All";
let draggedIndex = null;


// utility
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(animated = false) {
  let firstRects = [];
  if (animated) {
    firstRects = Array.from(tasklist.children).map((el) =>
      el.getBoundingClientRect()
    );
  }

  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "Active") return !task.completed;
    if (currentFilter === "Completed") return task.completed;

    return true;
  });

  filteredTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = `task ${task.completed ? "completed" : ""}`;
    li.draggable = true;
    li.dataset.index = index;

    li.innerHTML = `
      <input type="checkbox" ${
        task.completed ? "checked" : ""
      } data-index="${index}" class="complete-checkbox" />
      <span class="task-text" data-index="${index}">${task.text}</span>
      <button class="delete-btn" data-index="${index}">X</button>
    `;

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    taskList.appendChild(li);
  });

  if (animated) {
    const lastRects = Array.from(taskList.children).map(el => el.getBoundingClientRect());
    lastRects.forEach((last, i) => {
      const first = firstRects[i];
      if (!first) return;
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const el = taskList.children[i];
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.transition = "transform 0s";
      requestAnimationFrame(() => {
        el.style.transform = "translate(0, 0)";
        el.style.transition = "transform 0.25s ease";
      });
    });
  }

  updateCounter();
}

function updateCounter() {
  const activeCount = tasks.filter(task => !task.completed).length;
  taskCounter.textContent = `${activeCount} task${activeCount !== 1 ? "s" : ""} left`;
}

// logic
addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) {
    input.style.borderColor = "#E74C3C";
    setTimeout(() => (input.style.borderColor = ""), 1000);
    return;
  }
  tasks.push({ text, completed: false });
  saveTasks();
  renderTasks(true);
  input.value = "";
});


taskList.addEventListener("change", e => {
  if (e.target.classList.contains("complete-checkbox")) {
    const index = e.target.dataset.index;
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks(true);
  }
});

taskList.addEventListener("click", e => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(true);
  }
});

//edit task 
taskList.addEventListener("click", e => {
  if (e.target.classList.contains("task-text")) {
    const index = e.target.dataset.index;
    const span = e.target;
    const inputEdit = document.createElement("input");

    inputEdit.type = "text";
    inputEdit.value = tasks[index].text;
    inputEdit.classList.add("edit-input");
    span.replaceWith(inputEdit);
    inputEdit.focus();

    inputEdit.addEventListener("blur", () => {
      tasks[index].text = inputEdit.value.trim() || tasks[index].text;
      saveTasks();
      renderTasks(true);
    });

    inputEdit.addEventListener("keypress", e => {
      if (e.key === "Enter") inputEdit.blur();
    });
  }
});

// filters 
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.textContent;
    renderTasks(true);
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");
  const taskList = document.getElementById("taskList");

  // 날짜 함수
  function getToday() {
    return new Date().toLocaleDateString();
  }

  // 고유 ID 생성
  function createId() {
    return Date.now().toString();
  }

  // ------------------------
  // 저장된 데이터 불러오기
  // ------------------------
  chrome.storage.local.get(["tasks"], (result) => {
    const tasks = result.tasks || [];
    tasks.forEach(task => renderTask(task));
  });

  // ------------------------
  // 할일 추가
  // ------------------------
  function addTask() {
    const text = taskInput.value.trim();
    if (text === "") return;

    const task = {
      id: createId(),
      text: text,
      date: getToday()
    };

    renderTask(task);
    saveTask(task);

    taskInput.value = "";
    taskInput.focus();
  }

  // 버튼 클릭
  addBtn.addEventListener("click", addTask);

  // ✅ 엔터로 추가 (저장까지 확실히)
  taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  // ------------------------
  // 화면에 그리기
  // ------------------------
  function renderTask(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;

    const left = document.createElement("div");
    left.className = "task-left";

    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;

    const dateSpan = document.createElement("span");
    dateSpan.className = "task-date";
    dateSpan.textContent = `(${task.date})`;

    left.appendChild(textSpan);
    left.appendChild(dateSpan);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "del";
    deleteBtn.textContent = "❌";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);

    // 수정
    editBtn.addEventListener("click", () => startEdit(task, li));
    left.addEventListener("dblclick", () => startEdit(task, li));

    // 삭제
    deleteBtn.addEventListener("click", () => {
      li.remove();
      deleteTask(task.id);
    });
  }

  // ------------------------
  // 수정 기능 (날짜 갱신)
  // ------------------------
  function startEdit(task, li) {
    const left = li.querySelector(".task-left");
    left.innerHTML = "";

    const input = document.createElement("input");
    input.type = "text";
    input.value = task.text;
    input.style.width = "100%";
    input.style.padding = "6px";

    left.appendChild(input);
    input.focus();

    function saveEdit() {
      const newText = input.value.trim();
      if (newText === "") return;

      task.text = newText;
      task.date = getToday(); // ✅ 수정 시 날짜 갱신

      left.innerHTML = "";

      const textSpan = document.createElement("span");
      textSpan.textContent = task.text;

      const dateSpan = document.createElement("span");
      dateSpan.className = "task-date";
      dateSpan.textContent = `(${task.date})`;

      left.appendChild(textSpan);
      left.appendChild(dateSpan);

      updateTask(task);
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEdit();
      }
    });

    input.addEventListener("blur", saveEdit);
  }

  // ------------------------
  // Storage 처리
  // ------------------------
  function saveTask(task) {
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks || [];
      tasks.push(task);
      chrome.storage.local.set({ tasks });
    });
  }

  function deleteTask(id) {
    chrome.storage.local.get(["tasks"], (result) => {
      let tasks = result.tasks || [];
      tasks = tasks.filter(t => t.id !== id);
      chrome.storage.local.set({ tasks });
    });
  }

  function updateTask(updatedTask) {
    chrome.storage.local.get(["tasks"], (result) => {
      let tasks = result.tasks || [];
      tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      chrome.storage.local.set({ tasks });
    });
  }
});
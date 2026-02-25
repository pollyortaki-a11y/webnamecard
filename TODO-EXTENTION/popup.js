document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");
  const taskList = document.getElementById("taskList");

  // 저장된 데이터 불러오기
  chrome.storage.local.get(["tasks"], function (result) {
    const tasks = result.tasks || [];
    tasks.forEach(task => addTaskToUI(task));
  });

  // 버튼 클릭
  addBtn.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    addTaskToUI(taskText);
    saveTask(taskText);

    taskInput.value = "";
  });

  function addTaskToUI(taskText) {
    const li = document.createElement("li");
    li.textContent = taskText;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", function () {
      li.remove();
      removeTask(taskText);
    });

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  }

  function saveTask(taskText) {
    chrome.storage.local.get(["tasks"], function (result) {
      const tasks = result.tasks || [];
      tasks.push(taskText);
      chrome.storage.local.set({ tasks: tasks });
    });
  }

  function removeTask(taskText) {
    chrome.storage.local.get(["tasks"], function (result) {
      let tasks = result.tasks || [];
      tasks = tasks.filter(task => task !== taskText);
      chrome.storage.local.set({ tasks: tasks });
    });
  }
});
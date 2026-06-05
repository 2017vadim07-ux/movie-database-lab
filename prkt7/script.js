"use strict";

console.log("Підключено JavaScript для Практичної роботи №7");

const loadDataButton = document.getElementById("loadData");
const output = document.getElementById("output");

const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTask");
const clearTasksButton = document.getElementById("clearTasks");
const taskList = document.getElementById("taskList");
const stats = document.getElementById("stats");

const STORAGE_KEY = "tasks";

// JSON.parse та JSON.stringify
loadDataButton.addEventListener("click", function() {
  try {
    const jsonString = '{"name":"Іван","age":30,"city":"Київ"}';
    const user = JSON.parse(jsonString);

    localStorage.setItem("user", JSON.stringify(user));

    const formattedJson = JSON.stringify(user, null, 2);

    output.textContent = formattedJson;
    console.log("JSON.parse результат:", user);
    console.log("JSON.stringify результат:", formattedJson);
  } catch (error) {
    output.textContent = "Помилка обробки JSON";
    console.error("Помилка JSON:", error);
  }
});

// Завантаження завдань з localStorage
function loadTasks() {
  try {
    const tasksJSON = localStorage.getItem(STORAGE_KEY);
    return tasksJSON ? JSON.parse(tasksJSON) : [];
  } catch (error) {
    console.error("Помилка читання localStorage:", error);
    return [];
  }
}

// Збереження завдань у localStorage
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Відображення завдань
function displayTasks() {
  const tasks = loadTasks();

  taskList.innerHTML = "";

  tasks.forEach(function(task, index) {
    const li = document.createElement("li");

    if (task.done) {
      li.classList.add("done");
    }

    li.setAttribute("data-index", index);
    li.innerHTML = `
      ${task.text}
      <button class="delete" data-index="${index}">Видалити</button>
    `;

    taskList.appendChild(li);
  });

  showStats(tasks);
}

// map, filter, reduce
function showStats(tasks) {
  const taskNames = tasks.map(task => task.text);
  const doneTasks = tasks.filter(task => task.done);
  const totalLength = tasks.reduce((sum, task) => sum + task.text.length, 0);

  stats.textContent =
    `Усього: ${tasks.length}, виконано: ${doneTasks.length}, символів у завданнях: ${totalLength}`;

  console.log("map:", taskNames);
  console.log("filter:", doneTasks);
  console.log("reduce:", totalLength);
}

// Додавання завдання
function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Введіть текст завдання!");
    return;
  }

  const tasks = loadTasks();

  tasks.push({
    text: taskText,
    done: false
  });

  saveTasks(tasks);
  taskInput.value = "";
  displayTasks();

  console.log("Завдання додано:", taskText);
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// Делегування подій: виконання і видалення
taskList.addEventListener("click", function(event) {
  const tasks = loadTasks();
  const index = event.target.getAttribute("data-index");

  if (event.target.classList.contains("delete")) {
    tasks.splice(index, 1);
    saveTasks(tasks);
    displayTasks();
    console.log("Завдання видалено");
    return;
  }

  if (event.target.tagName === "LI") {
    tasks[index].done = !tasks[index].done;
    saveTasks(tasks);
    displayTasks();
    console.log("Статус завдання змінено");
  }
});

// Очистити всі завдання
clearTasksButton.addEventListener("click", function() {
  localStorage.removeItem(STORAGE_KEY);
  displayTasks();
  console.log("Усі завдання очищено");
});

// Стартове завантаження
displayTasks();
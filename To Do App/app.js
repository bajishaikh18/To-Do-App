document.addEventListener("DOMContentLoaded", () => {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let editingIndex = null;

  const themeToggleContainer = document.createElement("div");
  themeToggleContainer.className = "theme-toggle-container";

  themeToggleContainer.innerHTML = `
    <label class="theme-switch">
      <input type="checkbox" id="themeToggle" ${
        localStorage.getItem("theme") === "light" ? "checked" : ""
      }>
      <span class="slider">
        <span class="icon sun">☀️</span>
        <span class="icon moon">🌙</span>
      </span>
    </label>
  `;
  document.body.prepend(themeToggleContainer);

  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "dark";

  document.body.setAttribute("data-theme", savedTheme);

  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "light" : "dark";

    document.body.setAttribute("data-theme", newTheme);

    localStorage.setItem("theme", newTheme);
  });

  const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  };

  const addTask = () => {
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();

    if (text) {
      if (editingIndex !== null) {
        tasks[editingIndex].text = text;
        editingIndex = null;
      } else {
        tasks.push({ text: text, completed: false });
        if (navigator.vibrate) {
          navigator.vibrate(5);
        }
      }
      taskInput.value = "";
      updateTaskList();
      updateStats();
      saveTasks();
    }
  };

  const updateTaskList = () => {
    const taskList = document.getElementById("task-list");
    if (!taskList) return;

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
      const listItem = document.createElement("li");

      listItem.innerHTML = `
          <div class="taskItem">
            <div class="task ${task.completed ? "completed" : ""}">
              <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? "checked" : ""}
                onchange="toggleTaskComplete(${index})"
              />
              <p>${task.text}</p>
            </div>
            <div class="icons">
              <img src="./img/edit.png" onclick="editTask(${index})" />
              <img src="./img/bin.png" onclick="deleteTask(${index})" />
            </div>
          </div>
        `;
      taskList.append(listItem);
    });
  };

  window.toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    updateTaskList();
    updateStats();
    saveTasks();
  };

  window.editTask = (index) => {
    const taskInput = document.getElementById("taskInput");
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    taskInput.value = tasks[index].text;
    editingIndex = index;
    taskInput.focus();
  };

  const updateStats = () => {
    const completeTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const progressBar = document.getElementById("progress");
    const numbersElement = document.getElementById("numbers");
    const productivityText = document.querySelector(".details p");

    if (totalTasks === 0) {
      progressBar.style.width = "0%";
      numbersElement.innerText = `0 / 0`;
      return;
    }

    const progress = (completeTasks / totalTasks) * 100;
    progressBar.style.width = `${progress}%`;
    numbersElement.innerText = `${completeTasks} / ${totalTasks}`;

    if (completeTasks === totalTasks) {
      productivityText.textContent = "Keep it up 💪!";
      setTimeout(() => {
        productivityText.textContent = "Productivity, Simplified!";
      }, 3000);
      blastConfetti();
    }
  };

  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    addTask();
  });

  updateTaskList();
  updateStats();

  const blastConfetti = () => {
    const duration = 2 * 1000,
      animationEnd = Date.now() + duration,
      defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  };

  const popupOverlay = document.createElement("div");
  popupOverlay.className = "popup-overlay";
  popupOverlay.innerHTML = `
    <div class="popup">
      <h2>Are You Sure ?</h2>
      <div class="popup-buttons">
      <button class="cancel">CANCEL</button>
      <button class="confirm">DELETE</button>  
      
        
      </div>
    </div>
  `;
  document.body.appendChild(popupOverlay);

  const showPopup = (index) => {
    popupOverlay.style.display = "flex";

    setTimeout(() => {
      popupOverlay.classList.add("show");
    }, 10);

    const confirmButton = popupOverlay.querySelector(".confirm");
    const cancelButton = popupOverlay.querySelector(".cancel");

    confirmButton.onclick = () => {
      tasks.splice(index, 1);
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      updateTaskList();
      updateStats();
      saveTasks();
      closePopup();
    };

    cancelButton.onclick = closePopup;
  };

  const closePopup = () => {
    popupOverlay.classList.remove("show");
    setTimeout(() => {
      popupOverlay.style.display = "none";
    }, 3);
  };

  window.deleteTask = (index) => {
    showPopup(index);
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };
});

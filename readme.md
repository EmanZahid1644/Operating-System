# 🖥️ Disk Scheduling Visualization Project 🎯

A web-based interactive tool to visualize **disk scheduling algorithms** with animation, comparison charts, and request management. This project helps users understand how different disk scheduling algorithms work and their efficiency.

---

## 📜 Table of Contents

- [About](#about)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Disk Scheduling Algorithms](#disk-scheduling-algorithms)
- [Project Structure](#project-structure)
- [How to Run 💻](#how-to-run-)
- [Division of Work 🛠️](#division-of-work-)
- [Future Improvements 🚀](#future-improvements-)
- [Author 👩‍💻](#author-)

---

## 🔍 About

This project is a **Disk Scheduling Visualizer** built using **HTML, CSS, JavaScript, and Chart.js**.  

It allows users to:

- Enter disk size, head position, and requests ✅
- Generate random requests 🎲
- Select multiple disk scheduling algorithms simultaneously ✅
- Visualize head movement with **step-by-step animation** 🎬
- Compare total head movement across algorithms using a chart 📊
- Track algorithm efficiency and average seek time ⏱️

Perfect for **students learning operating system concepts** and disk scheduling techniques.

---

## ✨ Features

- Interactive **sliders** for disk size, head position, and number of requests 🎚️
- **Random request generator** 🔄
- **Multiple algorithm selection** (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK) ✅
- **Animation controls**: Play, Pause, Step, Reset ⏯️
- **Comparison charts** using Chart.js 📈
- **Timeline view** of head movement 🗓️
- **Export results as JSON** 💾
- **Responsive UI** for multiple screen sizes 📱
- Light/Dark mode toggle 🌗

---

## 🛠️ Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Libraries:** 
  - [Chart.js](https://www.chartjs.org/) for comparison charts 📊
  - [Toastify.js](https://github.com/apvarun/toastify-js) for notifications 🔔
- **Server (optional):** Apache via XAMPP (for live preview) 🌐
- **Algorithms Implemented:**
  - FCFS
  - SSTF
  - SCAN
  - C-SCAN
  - LOOK
  - C-LOOK

---

## 📚 Disk Scheduling Algorithms

| Algorithm | Description |
|-----------|-------------|
| **FCFS** | First Come First Serve – Services requests in arrival order ⏱️ |
| **SSTF** | Shortest Seek Time First – Services the nearest request to current head 🏃‍♂️ |
| **SCAN** | Elevator Algorithm – Moves head in one direction and reverses at end 🛗 |
| **C-SCAN** | Circular SCAN – Moves in one direction, jumps to start at end 🔄 |
| **LOOK** | Like SCAN but only goes to last request in each direction 👀 |
| **C-LOOK** | Like C-SCAN but only goes to last request, not disk end 🔁 |

---

## 🗂️ Project Structure

disk-scheduling/
│
├─ index.html # Main HTML page 🌐
├─ style.css # Styling for UI 🎨
├─ script.js # Main logic & animation 🎬
├─ chart.js # Chart.js library 📊
├─ toastify.js # Toast notifications 🔔
├─ main.c # core logic but can not accessed directly
└─ README.md # This file 📄


**Notes:**  
- The core logic is implemented in **JavaScript**, so it runs directly in the browser.  
- C language code (if any) is for reference and cannot run in browser directly.  

---

## 💻 How to Run

1. Install [XAMPP](https://www.apachefriends.org/) (if you want to run via localhost) 🏠
2. Copy the `disk-scheduling` folder into `C:/xampp/htdocs/`  
3. Start **Apache** server in XAMPP ✅  
4. Open browser and navigate to:  
5. For other devices in same network:
- Find your PC's IP (`ipconfig` → IPv4)  
- Access: `http://<your-ip>/disk-scheduling/index.html` 🌐  

---

## 🛠️ Division of Work (Project Phases)

1. **Requirement Gathering 📋**
- Understand disk scheduling algorithms
- Identify key features for visualization

2. **UI/UX Design 🎨**
- Sliders, input fields, result cards, charts, and timeline

3. **Frontend Development 💻**
- HTML/CSS layout
- Responsive design

4. **Algorithm Implementation 🧠**
- Implement FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK in JS
- Calculate total head movement and average seek

5. **Visualization & Animation 🎬**
- Animate head movement
- Highlight active requests
- Update timeline

6. **Chart & Comparison 📊**
- Display total head movement for each algorithm
- Highlight best and worst performance

7. **Testing & Debugging 🐞**
- Ensure correct calculations
- Validate inputs
- Check animation steps

8. **Deployment & Documentation 🚀**
- Setup project in XAMPP
- Create README, instructions, and export functionality

---

## 🚀 Future Improvements

- Integrate **server-side C code execution** via WebAssembly 🌐
- Add **more disk scheduling algorithms**  
- Enhance **animation speed control**  
- Add **user authentication** for saving multiple results 🔒  

---

## 👩‍💻 Author

**Eman Zahid** – Disk Scheduling Visualization Project 💡  
Contact: emanzahid234@gmail.com

---


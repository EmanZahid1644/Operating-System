// Global variables
let animationInterval;
let currentStep = {};
let isPlaying = false;
let speed = 500; // ms per step
let chart = null;
let selectedAlgorithms = new Set(['FCFS', 'SSTF', 'SCAN', 'C-SCAN']);

// Color mapping for algorithms
const algorithmColors = {
    'FCFS': '#ff5252',
    'SSTF': '#ffd700',
    'SCAN': '#00ff00',
    'C-SCAN': '#00bfff',
    'LOOK': '#ff00ff',
    'C-LOOK': '#ff8c00'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeChart();
    updateRangeValues();
});

// Setup event listeners
function setupEventListeners() {
    // Range sliders
    document.getElementById('disk-range').addEventListener('input', function() {
        document.getElementById('disk').value = this.value;
        document.querySelector('#disk-range + .range-value').textContent = this.value;
        updateHeadRange();
    });
    
    document.getElementById('head-range').addEventListener('input', function() {
        document.getElementById('head').value = this.value;
        document.querySelector('#head-range + .range-value').textContent = this.value;
    });
    
    document.getElementById('numReq-range').addEventListener('input', function() {
        document.getElementById('numReq').value = this.value;
        document.querySelector('#numReq-range + .range-value').textContent = this.value;
        generateRandomRequests();
    });
    
    document.getElementById('disk').addEventListener('input', function() {
        const value = Math.min(Math.max(parseInt(this.value) || 200, 1), 1000);
        this.value = value;
        document.getElementById('disk-range').value = value;
        document.querySelector('#disk-range + .range-value').textContent = value;
        updateHeadRange();
    });
    
    document.getElementById('head').addEventListener('input', function() {
        const diskSize = parseInt(document.getElementById('disk').value) || 200;
        const value = Math.min(Math.max(parseInt(this.value) || 50, 0), diskSize);
        this.value = value;
        document.getElementById('head-range').value = value;
        document.querySelector('#head-range + .range-value').textContent = value;
    });
    
    document.getElementById('numReq').addEventListener('input', function() {
        const value = Math.min(Math.max(parseInt(this.value) || 8, 1), 20);
        this.value = value;
        document.getElementById('numReq-range').value = value;
        document.querySelector('#numReq-range + .range-value').textContent = value;
    });
    
    document.getElementById('req').addEventListener('input', function() {
        updateRequestPreview();
    });
    
    // Algorithm selection
    document.querySelectorAll('.algorithm-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const algorithm = this.dataset.algo;
            const label = this.closest('.algorithm-checkbox');
            
            if (this.checked) {
                selectedAlgorithms.add(algorithm);
                label.classList.add('active');
            } else {
                selectedAlgorithms.delete(algorithm);
                label.classList.remove('active');
            }
            
            if (selectedAlgorithms.size === 0) {
                this.checked = true;
                selectedAlgorithms.add(algorithm);
                label.classList.add('active');
                showToast('At least one algorithm must be selected!', 'warning');
            }
        });
    });
    
    // Speed control
    document.getElementById('speed-range').addEventListener('input', function() {
        const speeds = ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'];
        const speedLabels = ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'];
        const index = Math.floor((this.value - 1) / 2);
        document.getElementById('speed-value').textContent = speedLabels[index];
        speed = 1000 - (this.value * 80); // Convert to milliseconds
    });
}

// Update range values display
function updateRangeValues() {
    const ranges = ['disk', 'head', 'numReq'];
    ranges.forEach(id => {
        const value = document.getElementById(id).value;
        document.querySelector(`#${id}-range + .range-value`).textContent = value;
        document.getElementById(`${id}-range`).value = value;
    });
    updateHeadRange();
}

// Update head range max based on disk size
function updateHeadRange() {
    const diskSize = parseInt(document.getElementById('disk').value) || 200;
    const headRange = document.getElementById('head-range');
    const headInput = document.getElementById('head');
    
    headRange.max = diskSize;
    headInput.max = diskSize;
    
    if (parseInt(headInput.value) > diskSize) {
        headInput.value = Math.floor(diskSize / 2);
        headRange.value = headInput.value;
        document.querySelector('#head-range + .range-value').textContent = headInput.value;
    }
}

// Update request preview
function updateRequestPreview() {
    const reqInput = document.getElementById('req').value;
    const preview = document.getElementById('request-preview').querySelector('.preview-values');
    
    if (reqInput.trim()) {
        const requests = reqInput.split(',').map(x => x.trim()).filter(x => x);
        preview.textContent = requests.join(', ');
    } else {
        preview.textContent = 'No requests entered';
    }
}

// Generate random requests
function generateRandomRequests() {
    const diskSize = parseInt(document.getElementById('disk').value) || 200;
    const numReq = parseInt(document.getElementById('numReq').value) || 8;
    
    const requests = [];
    for (let i = 0; i < numReq; i++) {
        requests.push(Math.floor(Math.random() * diskSize));
    }
    
    // Ensure no duplicates and sort for readability
    const uniqueRequests = [...new Set(requests)];
    while (uniqueRequests.length < numReq) {
        uniqueRequests.push(Math.floor(Math.random() * diskSize));
    }
    
    document.getElementById('req').value = uniqueRequests.join(',');
    updateRequestPreview();
    
    showToast(`Generated ${numReq} random requests`, 'success');
}

// Main visualization function
function visualize() {
    clearAnimation();
    resetAnimation();
    
    // Get input values
    const disk = parseInt(document.getElementById('disk').value) || 200;
    let head = parseInt(document.getElementById('head').value) || 50;
    const numReq = parseInt(document.getElementById('numReq').value) || 8;
    const reqInput = document.getElementById('req').value;
    
    // Parse requests
    let requests = reqInput.split(',').map(x => {
        const num = parseInt(x.trim());
        return isNaN(num) ? null : Math.min(Math.max(num, 0), disk);
    }).filter(x => x !== null);
    
    // Validation
    if (requests.length !== numReq) {
        showToast(`Expected ${numReq} requests, got ${requests.length}. Please check your input.`, 'error');
        return;
    }
    
    if (head < 0 || head > disk) {
        showToast(`Head position must be between 0 and ${disk}`, 'error');
        return;
    }
    
    // Calculate results for selected algorithms
    const results = {};
    const algorithmFunctions = {
        'FCFS': fcfs,
        'SSTF': sstf,
        'SCAN': scan,
        'C-SCAN': cscan,
        'LOOK': look,
        'C-LOOK': clook
    };
    
    // Calculate for each selected algorithm
    for (const algo of selectedAlgorithms) {
        if (algorithmFunctions[algo]) {
            results[algo] = algorithmFunctions[algo](head, [...requests], disk);
        }
    }
    
    // Display results
    displayResults(results, disk);
    
    // Update comparison chart
    updateComparisonChart(results);
    
    // Update timeline
    updateTimeline(results);
    
    // Show animation controls
    document.getElementById('animation-controls').classList.remove('hidden');
    
    showToast('Visualization complete! Click "Play Animation" to see head movement.', 'success');
}

// Display results in the UI
function displayResults(results, disk) {
    const output = document.getElementById('output');
    output.innerHTML = '';
    
    // Sort algorithms by total movement for comparison
    const sortedAlgorithms = Object.keys(results).sort((a, b) => 
        results[a].total - results[b].total
    );
    
    // Find best and worst algorithms
    const bestAlgo = sortedAlgorithms[0];
    const worstAlgo = sortedAlgorithms[sortedAlgorithms.length - 1];
    
    // Update stats summary
    document.getElementById('stats-summary').innerHTML = `
        <div class="stat">
            <span class="stat-label">Best Algorithm:</span>
            <span class="stat-value" style="color: ${algorithmColors[bestAlgo]}">${bestAlgo}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Lowest Movement:</span>
            <span class="stat-value">${results[bestAlgo].total}</span>
        </div>
        <div class="stat">
            <span class="stat-label">Highest Movement:</span>
            <span class="stat-value">${results[worstAlgo].total}</span>
        </div>
    `;
    
    // Create result cards for each algorithm
    for (const algo of sortedAlgorithms) {
        const data = results[algo];
        const color = algorithmColors[algo];
        
        // Create track visualization
        let trackHTML = '<div class="track-container">';
        trackHTML += `<div class="track-header">
            <span>0</span>
            <span>${disk}</span>
        </div>`;
        trackHTML += `<div class="track" id="track-${algo}" style="background: linear-gradient(90deg, 
            rgba(255,255,255,0.05) 0%, 
            rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.1) 50%, 
            rgba(255,255,255,0.05) 100%)">`;
        
        // Add request dots
        data.order.forEach((pos, index) => {
            if (index > 0) { // Skip initial head position
                const leftPercent = (pos / disk) * 100;
                trackHTML += `<div class="request-dot" 
                    data-algo="${algo}" 
                    data-index="${index}"
                    style="left: ${leftPercent}%; color: ${color};"></div>`;
            }
        });
        
        // Add head marker
        trackHTML += `<div class="head-marker" id="head-${algo}" 
            style="left: ${(data.order[0] / disk) * 100}%; 
                   background: ${color};
                   color: ${getContrastColor(color)};">
            H
        </div>`;
        trackHTML += '</div></div>';
        
        // Calculate average seek time
        const avgSeek = (data.total / (data.order.length - 1)).toFixed(2);
        
        // Create result card
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="algorithm-title" style="color: ${color};">
                    <i class="fas fa-project-diagram"></i>
                    ${algo}
                </div>
                <div class="total-movement" style="color: ${color};">
                    ${data.total} cyl
                </div>
            </div>
            
            <div class="order-sequence">
                ${data.order.join(' → ')}
            </div>
            
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total Movement:</span>
                    <span class="stat-value">${data.total} cylinders</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Average Seek:</span>
                    <span class="stat-value">${avgSeek} cylinders</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Requests Served:</span>
                    <span class="stat-value">${data.order.length - 1}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Efficiency:</span>
                    <span class="stat-value">${((disk / data.total) * 100).toFixed(1)}%</span>
                </div>
            </div>
            
            ${trackHTML}
            
            <div style="margin-top: 15px; font-size: 12px; color: var(--text-muted);">
                <i class="fas fa-info-circle"></i> 
                ${getAlgorithmDescription(algo)}
            </div>
        `;
        
        output.appendChild(resultCard);
    }
    
    // Initialize step tracking
    initializeStepTracking(results);
}

// Initialize step tracking for animation
function initializeStepTracking(results) {
    currentStep = {};
    for (const algo in results) {
        currentStep[algo] = 0;
    }
}

// Play animation
function playAnimation() {
    if (isPlaying) return;
    
    isPlaying = true;
    const algorithms = Object.keys(currentStep);
    let allComplete = false;
    
    animationInterval = setInterval(() => {
        allComplete = true;
        
        for (const algo of algorithms) {
            const headMarker = document.getElementById(`head-${algo}`);
            const requestDots = document.querySelectorAll(`.request-dot[data-algo="${algo}"]`);
            
            if (currentStep[algo] < requestDots.length) {
                allComplete = false;
                const dot = requestDots[currentStep[algo]];
                headMarker.style.left = dot.style.left;
                
                // Highlight active dot
                document.querySelectorAll(`.request-dot[data-algo="${algo}"]`).forEach(d => {
                    d.classList.remove('active');
                });
                dot.classList.add('active');
                
                currentStep[algo]++;
            }
        }
        
        if (allComplete) {
            stopAnimation();
            showToast('Animation complete!', 'success');
        }
    }, speed);
}

// Step animation (one step at a time)
function stepAnimation() {
    if (isPlaying) {
        pauseAnimation();
    }
    
    const algorithms = Object.keys(currentStep);
    let anyMoved = false;
    
    for (const algo of algorithms) {
        const headMarker = document.getElementById(`head-${algo}`);
        const requestDots = document.querySelectorAll(`.request-dot[data-algo="${algo}"]`);
        
        if (currentStep[algo] < requestDots.length) {
            anyMoved = true;
            const dot = requestDots[currentStep[algo]];
            headMarker.style.left = dot.style.left;
            
            // Highlight active dot
            document.querySelectorAll(`.request-dot[data-algo="${algo}"]`).forEach(d => {
                d.classList.remove('active');
            });
            dot.classList.add('active');
            
            currentStep[algo]++;
        }
    }
    
    if (!anyMoved) {
        showToast('Animation already at the end!', 'info');
    }
}

// Pause animation
function pauseAnimation() {
    clearInterval(animationInterval);
    isPlaying = false;
}

// Stop animation
function stopAnimation() {
    clearInterval(animationInterval);
    isPlaying = false;
    showToast('Animation stopped', 'info');
}

// Reset animation
function resetAnimation() {
    clearInterval(animationInterval);
    isPlaying = false;

    const algorithms = Object.keys(currentStep);
    for (const algo of algorithms) {
        currentStep[algo] = 0;
        const headMarker = document.getElementById(`head-${algo}`);
        if (headMarker) {
            // Store initial position if not already stored
            if (!headMarker.hasAttribute('data-initial-left')) {
                headMarker.setAttribute('data-initial-left', headMarker.style.left);
            }
            // Reset to initial position
            headMarker.style.left = headMarker.getAttribute('data-initial-left');
        }

        // Remove active class from all request dots
        document.querySelectorAll(`.request-dot[data-algo="${algo}"]`).forEach(dot => {
            dot.classList.remove('active');
        });
    }
}

// Clear animation
function clearAnimation() {
    clearInterval(animationInterval);
    isPlaying = false;
}

// Reset all
function resetAll() {
    clearAnimation();
    resetAnimation();

    // Clear outputs
    document.getElementById('output').innerHTML = '';
    document.getElementById('timeline').innerHTML = '';
    document.getElementById('animation-controls').classList.add('hidden');
    document.getElementById('stats-summary').innerHTML = `
        <div class="stat">
            <span class="stat-label">Best Algorithm:</span>
            <span class="stat-value">--</span>
        </div>
        <div class="stat">
            <span class="stat-label">Lowest Movement:</span>
            <span class="stat-value">--</span>
        </div>
        <div class="stat">
            <span class="stat-label">Highest Movement:</span>
            <span class="stat-value">--</span>
        </div>
    `;

    // Clear chart without deleting dataset
    if (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[0].backgroundColor = [];
        chart.data.datasets[0].borderColor = [];
        chart.update();
    }
}

// Initialize chart
function initializeChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Head Movement',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Algorithm Comparison',
                    color: '#ffffff',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    },
                    title: {
                        display: true,
                        text: 'Total Head Movement (cylinders)',
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update comparison chart
function updateComparisonChart(results) {
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];
    
    for (const algo in results) {
        labels.push(algo);
        data.push(results[algo].total);
        backgroundColors.push(algorithmColors[algo] + '80'); // 80 = 50% opacity
        borderColors.push(algorithmColors[algo]);
    }
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].backgroundColor = backgroundColors;
    chart.data.datasets[0].borderColor = borderColors;
    chart.update();
}

// Update timeline
function updateTimeline(results) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    // Find the algorithm with the most steps for timeline
    let maxSteps = 0;
    let maxAlgo = '';
    for (const algo in results) {
        if (results[algo].order.length > maxSteps) {
            maxSteps = results[algo].order.length;
            maxAlgo = algo;
        }
    }
    
    if (!maxAlgo) return;
    
    // Create timeline items
    results[maxAlgo].order.forEach((cylinder, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        timelineItem.innerHTML = `
            <div class="timeline-cylinder ${index === 0 ? 'active' : ''}" 
                 style="border: 2px solid ${algorithmColors[maxAlgo]}">
                ${cylinder}
            </div>
            <div class="timeline-step">Step ${index}</div>
        `;
        timeline.appendChild(timelineItem);
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const backgroundColor = type === 'error' ? '#f44336' : 
                           type === 'success' ? '#4caf50' : 
                           type === 'warning' ? '#ff9800' : '#2196f3';
    
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true
    }).showToast();
}

// Get algorithm description
function getAlgorithmDescription(algo) {
    const descriptions = {
        'FCFS': 'Services requests in arrival order. Simple but may cause high seek times.',
        'SSTF': 'Selects request with minimum seek time from current head position.',
        'SCAN': 'Moves head in one direction, servicing requests, then reverses direction.',
        'C-SCAN': 'Like SCAN but moves only in one direction, jumps to start when reaching end.',
        'LOOK': 'Like SCAN but doesn\'t go to disk ends, only to last request in each direction.',
        'C-LOOK': 'Like C-SCAN but only goes to last request, not disk end.'
    };
    return descriptions[algo] || 'Disk scheduling algorithm';
}

// Get contrast color for text
function getContrastColor(hexColor) {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

// Modal functions
function showAbout() {
    document.getElementById('about-modal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Toggle dark mode (placeholder - can be enhanced)
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    showToast('Dark mode toggled!', 'info');
}

// Export results as JSON
function exportResults() {
    const results = {};
    const resultCards = document.querySelectorAll('.result-card');
    
    resultCards.forEach(card => {
        const algo = card.querySelector('.algorithm-title').textContent.trim();
        const total = card.querySelector('.total-movement').textContent.replace(' cyl', '');
        const order = card.querySelector('.order-sequence').textContent.split(' → ');
        
        results[algo] = {
            total: parseInt(total),
            order: order,
            averageSeek: card.querySelectorAll('.stat-value')[1].textContent
        };
    });
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'disk-scheduling-results.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Results exported successfully!', 'success');
}

// DISK SCHEDULING ALGORITHMS

// FCFS (First Come First Serve)
function fcfs(head, requests, diskSize) {
    let totalMovement = 0;
    let order = [head];
    let current = head;
    
    requests.forEach(request => {
        totalMovement += Math.abs(current - request);
        current = request;
        order.push(current);
    });
    
    return { order, total: totalMovement };
}

// SSTF (Shortest Seek Time First)
function sstf(head, requests, diskSize) {
    let totalMovement = 0;
    let order = [head];
    let current = head;
    let remaining = [...requests];
    
    while (remaining.length > 0) {
        // Find request with minimum seek time
        let minIndex = 0;
        let minDistance = Math.abs(current - remaining[0]);
        
        for (let i = 1; i < remaining.length; i++) {
            const distance = Math.abs(current - remaining[i]);
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }
        
        totalMovement += minDistance;
        current = remaining[minIndex];
        order.push(current);
        remaining.splice(minIndex, 1);
    }
    
    return { order, total: totalMovement };
}

// SCAN (Elevator Algorithm)
function scan(head, requests, diskSize) {
    let totalMovement = 0;
    let order = [head];
    let current = head;
    
    // Sort requests
    const left = requests.filter(r => r < head).sort((a, b) => b - a); // Descending
    const right = requests.filter(r => r >= head).sort((a, b) => a - b); // Ascending
    
    // Move to end (diskSize - 1) if there are requests on the right
    if (right.length > 0) {
        for (let i = 0; i < right.length; i++) {
            totalMovement += Math.abs(current - right[i]);
            current = right[i];
            order.push(current);
        }
        
        // Go to end if not already there
        if (current < diskSize - 1) {
            totalMovement += Math.abs(current - (diskSize - 1));
            current = diskSize - 1;
            order.push(current);
        }
    }
    
    // Move left
    for (let i = 0; i < left.length; i++) {
        totalMovement += Math.abs(current - left[i]);
        current = left[i];
        order.push(current);
    }
    
    return { order, total: totalMovement };
}

// C-SCAN (Circular SCAN)
function cscan(head, requests, diskSize) {
    let totalMovement = 0;
    let order = [head];
    let current = head;
    
    // Sort requests
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    const left = requests.filter(r => r < head).sort((a, b) => a - b);
    
    // Move right to end
    for (let i = 0; i < right.length; i++) {
        totalMovement += Math.abs(current - right[i]);
        current = right[i];
        order.push(current);
    }
    
    // Jump to beginning if not already at start
    if (current !== 0) {
        totalMovement += Math.abs(current - 0);
        current = 0;
        order.push(current);
    }
    
    // Move through left requests
    for (let i = 0; i < left.length; i++) {
        totalMovement += Math.abs(current - left[i]);
        current = left[i];
        order.push(current);
    }
    
    return { order, total: totalMovement };
}

// LOOK Algorithm
function look(head, requests, diskSize) {
    let totalMovement = 0;
    let order = [head];
    let current = head;
    
    // Sort requests
    const left = requests.filter(r => r < head).sort((a, b) => b - a);
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    
    // Move right to last request
    for (let i = 0; i < right.length; i++) {
        totalMovement += Math.abs(current - right[i]);
        current = right[i];
        order.push(current);
    }
    
    // Move left to first request
    for (let i = 0; i < left.length; i++) {
        totalMovement += Math.abs(current - left[i]);
        current = left[i];
        order.push(current);
    }
    
    return { order, total: totalMovement };
}

// C-LOOK Algorithm
function clook(head, requests, diskSize) {
    let totalMovement = 0;
    let order = [head];
    let current = head;
    
    // Sort requests
    const right = requests.filter(r => r >= head).sort((a, b) => a - b);
    const left = requests.filter(r => r < head).sort((a, b) => a - b);
    
    // Move right to last request
    for (let i = 0; i < right.length; i++) {
        totalMovement += Math.abs(current - right[i]);
        current = right[i];
        order.push(current);
    }
    
    // Jump to first left request if any
    if (left.length > 0) {
        totalMovement += Math.abs(current - left[0]);
        current = left[0];
        order.push(current);
    }
    
    // Move through remaining left requests
    for (let i = 1; i < left.length; i++) {
        totalMovement += Math.abs(current - left[i]);
        current = left[i];
        order.push(current);
    }
    
    return { order, total: totalMovement };
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};
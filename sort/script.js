// Sorting Algorithm Visualizer - Smooth Animation Version

// Algorithm data
const algorithms = {
    insertion: {
        name: 'Insertion Sort',
        description: 'Insertion sort builds the final sorted array one item at a time, iteratively taking the next item and inserting it into its correct position among the already sorted items.',
        complexity: {
            best: 'O(n)',
            average: 'O(n²)',
            worst: 'O(n²)'
        },
        code: `<span class="keyword">def</span> <span class="function">insertion_sort</span>(arr):
    <span class="keyword">for</span> i <span class="keyword">in</span> <span class="built-in">range</span>(<span class="number">1</span>, <span class="built-in">len</span>(arr)):
        key = arr[i]
        j = i - <span class="number">1</span>
        <span class="keyword">while</span> j >= <span class="number">0</span> <span class="keyword">and</span> key < arr[j]:
            arr[j + <span class="number">1</span>] = arr[j]
            j -= <span class="number">1</span>
        arr[j + <span class="number">1</span>] = key
    <span class="keyword">return</span> arr`
    },
    selection: {
        name: 'Selection Sort',
        description: 'Selection sort divides the input into a sorted and unsorted region. It repeatedly selects the smallest element from the unsorted region and moves it to the end of the sorted region.',
        complexity: {
            best: 'O(n²)',
            average: 'O(n²)',
            worst: 'O(n²)'
        },
        code: `<span class="keyword">def</span> <span class="function">selection_sort</span>(arr):
    n = <span class="built-in">len</span>(arr)
    <span class="keyword">for</span> i <span class="keyword">in</span> <span class="built-in">range</span>(n):
        min_idx = i
        <span class="keyword">for</span> j <span class="keyword">in</span> <span class="built-in">range</span>(i + <span class="number">1</span>, n):
            <span class="keyword">if</span> arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    <span class="keyword">return</span> arr`
    },
    merge: {
        name: 'Merge Sort',
        description: 'Merge sort is a divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.',
        complexity: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n log n)'
        },
        code: `<span class="keyword">def</span> <span class="function">merge_sort</span>(arr):
    <span class="keyword">if</span> <span class="built-in">len</span>(arr) <= <span class="number">1</span>:
        <span class="keyword">return</span> arr
    mid = <span class="built-in">len</span>(arr) // <span class="number">2</span>
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    <span class="keyword">return</span> merge(left, right)

<span class="keyword">def</span> <span class="function">merge</span>(left, right):
    result = []
    i = j = <span class="number">0</span>
    <span class="keyword">while</span> i < <span class="built-in">len</span>(left) <span class="keyword">and</span> j < <span class="built-in">len</span>(right):
        <span class="keyword">if</span> left[i] <= right[j]:
            result.append(left[i])
            i += <span class="number">1</span>
        <span class="keyword">else</span>:
            result.append(right[j])
            j += <span class="number">1</span>
    result.extend(left[i:])
    result.extend(right[j:])
    <span class="keyword">return</span> result`
    },
    quick: {
        name: 'Quick Sort',
        description: 'Quick sort selects a pivot element and partitions the array around it, placing smaller elements before and larger elements after the pivot, then recursively sorts the sub-arrays.',
        complexity: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n²)'
        },
        code: `<span class="keyword">def</span> <span class="function">quick_sort</span>(arr, low, high):
    <span class="keyword">if</span> low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - <span class="number">1</span>)
        quick_sort(arr, pi + <span class="number">1</span>, high)
    <span class="keyword">return</span> arr

<span class="keyword">def</span> <span class="function">partition</span>(arr, low, high):
    pivot = arr[high]
    i = low - <span class="number">1</span>
    <span class="keyword">for</span> j <span class="keyword">in</span> <span class="built-in">range</span>(low, high):
        <span class="keyword">if</span> arr[j] < pivot:
            i += <span class="number">1</span>
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + <span class="number">1</span>], arr[high] = arr[high], arr[i + <span class="number">1</span>]
    <span class="keyword">return</span> i + <span class="number">1</span>`
    }
};

// State
let currentAlgorithm = 'insertion';
let array = [8, 3, 10, 5, 2, 7, 1, 9, 4, 6];
let originalArray = [...array];
let isPlaying = false;
let isPaused = false;
let comparisonCount = 0;
let animationSpeed = 525; // Default matches slider at 800: 2000 - ((800-100)/900)*1900
let sortingSteps = [];
let currentStepIndex = 0;
let animationFrameId = null;

// DOM Elements
const arrayContainer = document.getElementById('arrayContainer');
const comparisonCountEl = document.getElementById('comparisonCount');
const logContainer = document.getElementById('logContainer');
const algorithmTitle = document.getElementById('algorithmTitle');
const algorithmDescription = document.getElementById('algorithmDescription');
const codeContent = document.getElementById('codeContent');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');
const tabs = document.querySelectorAll('.tab');

// Element width for position calculations
const ELEMENT_WIDTH = 72; // 60px width + 12px gap

// Initialize
function init() {
    renderArray();
    updateAlgorithmInfo();
    setupEventListeners();
    addStatusMessage();
    addLegend();
    addSpeedControl();
}

// Add status message element
function addStatusMessage() {
    const arraySection = document.querySelector('.array-section');
    const container = document.getElementById('arrayContainer');
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'status-message';
    statusDiv.id = 'statusMessage';
    statusDiv.textContent = 'Press play to start sorting';
    
    arraySection.insertBefore(statusDiv, container);
}

// Add legend
function addLegend() {
    const arraySection = document.querySelector('.array-section');
    
    const legendDiv = document.createElement('div');
    legendDiv.className = 'legend';
    legendDiv.innerHTML = `
        <div class="legend-item">
            <div class="legend-dot default"></div>
            <span>Unsorted</span>
        </div>
        <div class="legend-item">
            <div class="legend-dot comparing"></div>
            <span>Comparing/Moving</span>
        </div>
        <div class="legend-item">
            <div class="legend-dot key"></div>
            <span>Key Element</span>
        </div>
        <div class="legend-item">
            <div class="legend-dot sorted"></div>
            <span>Sorted</span>
        </div>
    `;
    
    arraySection.appendChild(legendDiv);
}

// Add speed control
function addSpeedControl() {
    const controls = document.querySelector('.playback-controls');
    
    const speedDiv = document.createElement('div');
    speedDiv.className = 'speed-control';
    speedDiv.innerHTML = `
        <span class="speed-label">Speed:</span>
        <input type="range" class="speed-slider" id="speedSlider" min="100" max="1000" value="800">
    `;
    
    controls.appendChild(speedDiv);
    
    document.getElementById('speedSlider').addEventListener('input', (e) => {
        // Invert so higher slider = faster (lower ms)
        // Slowest: 2000ms, Fastest: 100ms
        const sliderVal = parseInt(e.target.value);
        const normalized = (sliderVal - 100) / 900; // 0 to 1
        animationSpeed = Math.round(2000 - normalized * 1900); // 2000ms to 100ms
    });
}

// Update status message
function updateStatus(message, highlight = false) {
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.classList.toggle('highlight', highlight);
    }
}

// Add entry to log
let logEntryCount = 0;

function addLogEntry(message, isComparison = false, isComplete = false) {
    if (!logContainer || !message) return;
    
    logEntryCount++;
    
    // Remove 'current' class from previous entries
    const prevCurrent = logContainer.querySelector('.log-entry.current');
    if (prevCurrent) {
        prevCurrent.classList.remove('current');
    }
    
    // Remove 'complete' class from all previous entries (only last should be green)
    const prevComplete = logContainer.querySelectorAll('.log-entry.complete');
    prevComplete.forEach(el => el.classList.remove('complete'));
    
    const entry = document.createElement('div');
    entry.className = 'log-entry current';
    
    if (isComplete) {
        entry.classList.add('complete');
    } else if (isComparison) {
        entry.classList.add('comparison');
    }
    
    entry.innerHTML = `<span class="log-entry-number">${logEntryCount}.</span>${message}`;
    
    logContainer.appendChild(entry);
    
    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Clear log
function clearLog() {
    if (logContainer) {
        logContainer.innerHTML = '';
        logEntryCount = 0;
    }
}

// Render array visualization (static, no flashing)
function renderArray(highlights = {}, arrowInfo = null) {
    // Create wrapper if it doesn't exist
    let wrapper = arrayContainer.querySelector('.array-wrapper');
    if (!wrapper) {
        arrayContainer.innerHTML = '';
        wrapper = document.createElement('div');
        wrapper.className = 'array-wrapper';
        arrayContainer.appendChild(wrapper);
    }
    
    // Check if we need to rebuild or just update
    const existingElements = wrapper.querySelectorAll('.array-element');
    const needsRebuild = existingElements.length !== array.length;
    
    if (needsRebuild) {
        wrapper.innerHTML = '';
        array.forEach((value, index) => {
            const element = createArrayElement(value, index, highlights);
            wrapper.appendChild(element);
        });
    } else {
        // Just update existing elements (no flashing)
        existingElements.forEach((element, index) => {
            const valueBox = element.querySelector('.array-value');
            const indexLabel = element.querySelector('.array-index');
            
            // Update value
            valueBox.textContent = array[index];
            indexLabel.textContent = index;
            
            // Update classes smoothly
            valueBox.className = 'array-value';
            element.classList.remove('dimmed');
            
            // Check if element is outside the working range (for merge sort)
            const inRange = !highlights.range || highlights.range.includes(index);
            
            if (!inRange) {
                valueBox.classList.add('default');
                element.classList.add('dimmed');
            } else if (highlights.sorted && highlights.sorted.includes(index)) {
                valueBox.classList.add('sorted');
            } else if (highlights.comparing && highlights.comparing.includes(index)) {
                valueBox.classList.add('comparing');
            } else if (highlights.key === index) {
                valueBox.classList.add('key');
            } else if (highlights.pivot === index) {
                valueBox.classList.add('pivot');
            } else if (highlights.active && highlights.active.includes(index)) {
                valueBox.classList.add('active');
            } else {
                valueBox.classList.add('default');
            }
            
            // Handle arrow indicators
            let arrow = element.querySelector('.arrow-indicator');
            if (!arrow) {
                arrow = document.createElement('div');
                arrow.className = 'arrow-indicator';
                arrow.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-8 8h6v8h4v-8h6z"/>
                    </svg>
                    <span class="arrow-label"></span>
                `;
                element.appendChild(arrow);
            }
            
            // Show/hide arrow based on arrowInfo
            if (arrowInfo && arrowInfo.index === index) {
                arrow.classList.add('visible');
                arrow.querySelector('.arrow-label').textContent = arrowInfo.label || '';
                arrow.style.color = arrowInfo.color || 'var(--primary-blue)';
            } else {
                arrow.classList.remove('visible');
            }
        });
    }
    
    // Draw movement arrows if needed
    drawMovementArrow(highlights.moveArrow);
}

// Create array element
function createArrayElement(value, index, highlights = {}) {
    const element = document.createElement('div');
    element.className = 'array-element';
    element.dataset.index = index;
    
    const indexLabel = document.createElement('span');
    indexLabel.className = 'array-index';
    indexLabel.textContent = index;
    
    const valueBox = document.createElement('div');
    valueBox.className = 'array-value';
    valueBox.textContent = value;
    
    // Apply initial state
    if (highlights.sorted && highlights.sorted.includes(index)) {
        valueBox.classList.add('sorted');
    } else {
        valueBox.classList.add('default');
    }
    
    // Arrow indicator (hidden by default)
    const arrow = document.createElement('div');
    arrow.className = 'arrow-indicator';
    arrow.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-8 8h6v8h4v-8h6z"/>
        </svg>
        <span class="arrow-label"></span>
    `;
    
    element.appendChild(arrow);
    element.appendChild(indexLabel);
    element.appendChild(valueBox);
    
    return element;
}

// Draw movement arrow between positions
function drawMovementArrow(moveInfo) {
    // Remove existing movement arrows
    const existing = arrayContainer.querySelectorAll('.movement-arrow, .swap-arrows');
    existing.forEach(el => el.remove());
    
    if (!moveInfo) return;
    
    const wrapper = arrayContainer.querySelector('.array-wrapper');
    if (!wrapper) return;
    
    const elements = wrapper.querySelectorAll('.array-element');
    
    if (moveInfo.type === 'swap') {
        // Draw curved swap arrows
        const fromEl = elements[moveInfo.from];
        const toEl = elements[moveInfo.to];
        
        if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            
            const fromX = fromRect.left - wrapperRect.left + fromRect.width / 2;
            const toX = toRect.left - wrapperRect.left + toRect.width / 2;
            
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('swap-arrows');
            svg.style.width = '100%';
            svg.style.height = '50px';
            svg.style.top = '-50px';
            
            // Top arrow (from -> to)
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const midX = (fromX + toX) / 2;
            path1.setAttribute('d', `M ${fromX} 45 Q ${midX} 5, ${toX} 45`);
            path1.classList.add('swap-arrow');
            
            // Arrow head
            const arrowHead1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            const angle1 = Math.atan2(40, toX - midX);
            const headSize = 8;
            arrowHead1.setAttribute('points', `
                ${toX},${45}
                ${toX - headSize * Math.cos(angle1 - 0.5)},${45 - headSize * Math.sin(angle1 - 0.5)}
                ${toX - headSize * Math.cos(angle1 + 0.5)},${45 - headSize * Math.sin(angle1 + 0.5)}
            `);
            arrowHead1.classList.add('swap-arrow-head');
            
            svg.appendChild(path1);
            svg.appendChild(arrowHead1);
            wrapper.appendChild(svg);
        }
    } else if (moveInfo.type === 'shift') {
        // Draw horizontal shift arrow
        const fromEl = elements[moveInfo.from];
        const toEl = elements[moveInfo.to];
        
        if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();
            const wrapperRect = wrapper.getBoundingClientRect();
            
            const fromX = fromRect.left - wrapperRect.left + fromRect.width / 2;
            const toX = toRect.left - wrapperRect.left + toRect.width / 2;
            
            const arrow = document.createElement('div');
            arrow.className = 'movement-arrow';
            arrow.style.left = `${Math.min(fromX, toX)}px`;
            arrow.style.width = `${Math.abs(toX - fromX)}px`;
            arrow.style.top = '50%';
            
            if (toX < fromX) {
                arrow.style.transform = 'rotate(180deg)';
                arrow.style.transformOrigin = 'right center';
            }
            
            wrapper.appendChild(arrow);
        }
    }
}

// Update algorithm info panel
function updateAlgorithmInfo() {
    const algo = algorithms[currentAlgorithm];
    algorithmTitle.textContent = algo.name;
    algorithmDescription.textContent = algo.description;
    codeContent.innerHTML = algo.code;
    
    // Update complexity values
    const complexityValues = document.querySelectorAll('.complexity-value');
    complexityValues[0].textContent = algo.complexity.best;
    complexityValues[1].textContent = algo.complexity.average;
    complexityValues[2].textContent = algo.complexity.worst;
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentAlgorithm = tab.dataset.algorithm;
            updateAlgorithmInfo();
            resetVisualization();
        });
    });
    
    // Playback controls
    playBtn.addEventListener('click', startSorting);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetVisualization);
    
    // Copy button
    copyBtn.addEventListener('click', copyCode);
}

// Generate detailed sorting steps
function generateSortingSteps() {
    sortingSteps = [];
    const arr = [...array];
    
    switch (currentAlgorithm) {
        case 'insertion':
            generateInsertionSortSteps(arr);
            break;
        case 'selection':
            generateSelectionSortSteps(arr);
            break;
        case 'merge':
            generateMergeSortSteps([...arr], 0, arr.length - 1, arr);
            break;
        case 'quick':
            quickSortSortedPositions = []; // Reset sorted positions tracker
            generateQuickSortSteps(arr, 0, arr.length - 1);
            break;
    }
}

// Insertion Sort Steps - detailed one-at-a-time
function generateInsertionSortSteps(arr) {
    const sorted = [];
    
    // Initial state - only first element is in range
    sortingSteps.push({
        array: [...arr],
        highlights: { range: [0], sorted: [0] },
        message: 'Starting insertion sort. First element is considered sorted.'
    });
    sorted.push(0);
    
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        // Range includes sorted portion plus current key
        const currentRange = Array.from({length: i + 1}, (_, idx) => idx);
        
        // Pick up the key
        sortingSteps.push({
            array: [...arr],
            highlights: { range: currentRange, key: i, sorted: [...sorted] },
            arrowInfo: { index: i, label: 'Key', color: '#F711E8' },
            message: `Pick up element ${key} at index ${i} as the key to insert.`
        });
        
        let j = i - 1;
        
        // Compare with each element
        while (j >= 0 && arr[j] > key) {
            // Show comparison
            sortingSteps.push({
                array: [...arr],
                highlights: { range: currentRange, key: i, comparing: [j], sorted: sorted.filter(s => s < j) },
                arrowInfo: { index: j, label: `${arr[j]} > ${key}?`, color: 'var(--accent-orange)' },
                message: `Compare: ${arr[j]} > ${key}? Yes! Shift ${arr[j]} to the right.`,
                isComparison: true
            });
            
            // Shift element right
            arr[j + 1] = arr[j];
            
            sortingSteps.push({
                array: [...arr],
                highlights: { 
                    range: currentRange,
                    key: i, 
                    active: [j + 1], 
                    sorted: sorted.filter(s => s < j)
                },
                moveArrow: { type: 'shift', from: j, to: j + 1 },
                message: `Shifted ${arr[j + 1]} from index ${j} to index ${j + 1}.`
            });
            
            j--;
        }
        
        // Show final comparison if we stopped early
        if (j >= 0) {
            sortingSteps.push({
                array: [...arr],
                highlights: { range: currentRange, key: i, comparing: [j], sorted: sorted.filter(s => s <= j) },
                arrowInfo: { index: j, label: `${arr[j]} > ${key}?`, color: 'var(--accent-orange)' },
                message: `Compare: ${arr[j]} > ${key}? No! Found insertion point.`,
                isComparison: true
            });
        }
        
        // Insert key
        arr[j + 1] = key;
        sorted.push(i);
        
        sortingSteps.push({
            array: [...arr],
            highlights: { range: currentRange, active: [j + 1], sorted: Array.from({length: i + 1}, (_, idx) => idx) },
            arrowInfo: { index: j + 1, label: 'Insert', color: '#10B981' },
            message: `Insert ${key} at index ${j + 1}. First ${i + 1} elements are now sorted.`
        });
    }
    
    // Final sorted state - all elements in range
    sortingSteps.push({
        array: [...arr],
        highlights: { sorted: Array.from({ length: arr.length }, (_, idx) => idx) },
        message: 'Array is now completely sorted!'
    });
}

// Selection Sort Steps
function generateSelectionSortSteps(arr) {
    sortingSteps.push({
        array: [...arr],
        highlights: {},
        message: 'Starting selection sort. Find the minimum and swap to front.'
    });
    
    for (let i = 0; i < arr.length - 1; i++) {
        let minIdx = i;
        
        // Mark current position
        sortingSteps.push({
            array: [...arr],
            highlights: { 
                active: [i],
                sorted: Array.from({length: i}, (_, idx) => idx)
            },
            arrowInfo: { index: i, label: 'Find min', color: 'var(--primary-blue)' },
            message: `Looking for minimum element from index ${i} to ${arr.length - 1}.`
        });
        
        for (let j = i + 1; j < arr.length; j++) {
            // Comparing
            sortingSteps.push({
                array: [...arr],
                highlights: { 
                    comparing: [j, minIdx],
                    sorted: Array.from({length: i}, (_, idx) => idx)
                },
                arrowInfo: { index: j, label: `${arr[j]} < ${arr[minIdx]}?`, color: 'var(--accent-orange)' },
                message: `Compare: Is ${arr[j]} < ${arr[minIdx]}? ${arr[j] < arr[minIdx] ? 'Yes! New minimum.' : 'No.'}`,
                isComparison: true
            });
            
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        if (minIdx !== i) {
            // Show swap
            sortingSteps.push({
                array: [...arr],
                highlights: { 
                    comparing: [i, minIdx],
                    sorted: Array.from({length: i}, (_, idx) => idx)
                },
                moveArrow: { type: 'swap', from: i, to: minIdx },
                message: `Swap ${arr[i]} at index ${i} with minimum ${arr[minIdx]} at index ${minIdx}.`
            });
            
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            
            sortingSteps.push({
                array: [...arr],
                highlights: { 
                    active: [i],
                    sorted: Array.from({length: i + 1}, (_, idx) => idx)
                },
                message: `Swapped! ${arr[i]} is now in its final position.`
            });
        } else {
            sortingSteps.push({
                array: [...arr],
                highlights: { 
                    sorted: Array.from({length: i + 1}, (_, idx) => idx)
                },
                message: `${arr[i]} is already the minimum. No swap needed.`
            });
        }
    }
    
    sortingSteps.push({
        array: [...arr],
        highlights: { sorted: Array.from({ length: arr.length }, (_, idx) => idx) },
        message: 'Array is now completely sorted!'
    });
}

// Merge Sort Steps
function generateMergeSortSteps(arr, left, right, fullArr) {
    if (left >= right) return;
    
    const mid = Math.floor((left + right) / 2);
    const rangeIndices = Array.from({length: right - left + 1}, (_, i) => left + i);
    
    sortingSteps.push({
        array: [...fullArr],
        highlights: { 
            range: rangeIndices,
            active: Array.from({length: mid - left + 1}, (_, i) => left + i),
            comparing: Array.from({length: right - mid}, (_, i) => mid + 1 + i)
        },
        message: `Divide: Split subarray [${left}...${right}] into [${left}...${mid}] and [${mid + 1}...${right}].`
    });
    
    generateMergeSortSteps(arr, left, mid, fullArr);
    generateMergeSortSteps(arr, mid + 1, right, fullArr);
    
    // Merge step
    const leftArr = fullArr.slice(left, mid + 1);
    const rightArr = fullArr.slice(mid + 1, right + 1);
    
    sortingSteps.push({
        array: [...fullArr],
        highlights: { 
            range: rangeIndices,
            active: Array.from({length: mid - left + 1}, (_, i) => left + i),
            comparing: Array.from({length: right - mid}, (_, i) => mid + 1 + i)
        },
        message: `Merge: Combining [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`
    });
    
    let i = 0, j = 0, k = left;
    const mergedSoFar = [];
    
    while (i < leftArr.length && j < rightArr.length) {
        sortingSteps.push({
            array: [...fullArr],
            highlights: { 
                range: rangeIndices,
                comparing: [left + i, mid + 1 + j],
                sorted: [...mergedSoFar]
            },
            message: `Compare ${leftArr[i]} and ${rightArr[j]}: ${leftArr[i] <= rightArr[j] ? leftArr[i] + ' is smaller' : rightArr[j] + ' is smaller'}`,
            isComparison: true
        });
        
        if (leftArr[i] <= rightArr[j]) {
            fullArr[k] = leftArr[i];
            i++;
        } else {
            fullArr[k] = rightArr[j];
            j++;
        }
        
        mergedSoFar.push(k);
        
        sortingSteps.push({
            array: [...fullArr],
            highlights: { 
                range: rangeIndices,
                active: [k],
                sorted: mergedSoFar.slice(0, -1)
            },
            message: `Placed ${fullArr[k]} at index ${k}`
        });
        
        k++;
    }
    
    while (i < leftArr.length) {
        fullArr[k] = leftArr[i];
        mergedSoFar.push(k);
        sortingSteps.push({
            array: [...fullArr],
            highlights: { 
                range: rangeIndices,
                active: [k],
                sorted: mergedSoFar.slice(0, -1)
            },
            message: `Placed remaining ${fullArr[k]} at index ${k}`
        });
        i++;
        k++;
    }
    
    while (j < rightArr.length) {
        fullArr[k] = rightArr[j];
        mergedSoFar.push(k);
        sortingSteps.push({
            array: [...fullArr],
            highlights: { 
                range: rangeIndices,
                active: [k],
                sorted: mergedSoFar.slice(0, -1)
            },
            message: `Placed remaining ${fullArr[k]} at index ${k}`
        });
        j++;
        k++;
    }
    
    // Show completed merge for this section
    sortingSteps.push({
        array: [...fullArr],
        highlights: { 
            range: rangeIndices,
            sorted: rangeIndices
        },
        message: `Merged section [${left}...${right}]: [${fullArr.slice(left, right + 1).join(', ')}]`
    });
    
    // Mark fully sorted at the end
    if (left === 0 && right === fullArr.length - 1) {
        sortingSteps.push({
            array: [...fullArr],
            highlights: { sorted: Array.from({length: fullArr.length}, (_, i) => i) },
            message: 'Array is now completely sorted!'
        });
    }
}

// Quick Sort Steps
// Track sorted pivot positions globally for quick sort
let quickSortSortedPositions = [];

function generateQuickSortSteps(arr, low, high) {
    if (low >= high) {
        // Single element is sorted
        if (low === high && !quickSortSortedPositions.includes(low)) {
            quickSortSortedPositions.push(low);
            sortingSteps.push({
                array: [...arr],
                highlights: { sorted: [...quickSortSortedPositions] },
                message: `Element ${arr[low]} at index ${low} is in its final position.`
            });
        }
        return;
    }
    
    const rangeIndices = Array.from({length: high - low + 1}, (_, i) => low + i);
    const pivot = arr[high];
    
    sortingSteps.push({
        array: [...arr],
        highlights: { range: rangeIndices, pivot: high, sorted: [...quickSortSortedPositions] },
        arrowInfo: { index: high, label: 'Pivot', color: '#F711E8' },
        message: `Quick sort [${low}...${high}]: Using ${pivot} (index ${high}) as pivot.`
    });
    
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        sortingSteps.push({
            array: [...arr],
            highlights: { range: rangeIndices, comparing: [j], pivot: high, sorted: [...quickSortSortedPositions] },
            arrowInfo: { index: j, label: `${arr[j]} < ${pivot}?`, color: 'var(--accent-orange)' },
            message: `Compare: Is ${arr[j]} < ${pivot}? ${arr[j] < pivot ? 'Yes! Move to left partition.' : 'No, stays in right partition.'}`,
            isComparison: true
        });
        
        if (arr[j] < pivot) {
            i++;
            if (i !== j) {
                sortingSteps.push({
                    array: [...arr],
                    highlights: { range: rangeIndices, comparing: [i, j], pivot: high, sorted: [...quickSortSortedPositions] },
                    moveArrow: { type: 'swap', from: i, to: j },
                    message: `Swap ${arr[i]} and ${arr[j]} to move smaller element left.`
                });
                
                [arr[i], arr[j]] = [arr[j], arr[i]];
                
                sortingSteps.push({
                    array: [...arr],
                    highlights: { range: rangeIndices, active: [i, j], pivot: high, sorted: [...quickSortSortedPositions] },
                    message: `Swapped! Elements rearranged.`
                });
            }
        }
    }
    
    // Place pivot in correct position
    const pivotPos = i + 1;
    if (pivotPos !== high) {
        sortingSteps.push({
            array: [...arr],
            highlights: { range: rangeIndices, comparing: [pivotPos, high], pivot: high, sorted: [...quickSortSortedPositions] },
            moveArrow: { type: 'swap', from: pivotPos, to: high },
            message: `Move pivot ${pivot} to its final position at index ${pivotPos}.`
        });
        
        [arr[pivotPos], arr[high]] = [arr[high], arr[pivotPos]];
    }
    
    quickSortSortedPositions.push(pivotPos);
    
    sortingSteps.push({
        array: [...arr],
        highlights: { range: rangeIndices, sorted: [...quickSortSortedPositions], pivot: pivotPos },
        arrowInfo: { index: pivotPos, label: 'Final', color: '#10B981' },
        message: `Pivot ${pivot} is now in its final sorted position at index ${pivotPos}!`
    });
    
    generateQuickSortSteps(arr, low, pivotPos - 1);
    generateQuickSortSteps(arr, pivotPos + 1, high);
    
    // Final state
    if (low === 0 && high === arr.length - 1) {
        sortingSteps.push({
            array: [...arr],
            highlights: { sorted: Array.from({ length: arr.length }, (_, idx) => idx) },
            message: 'Array is now completely sorted!'
        });
    }
}

// Start sorting animation
async function startSorting() {
    if (isPlaying && !isPaused) return;
    
    if (!isPlaying) {
        generateSortingSteps();
        currentStepIndex = 0;
    }
    
    isPlaying = true;
    isPaused = false;
    playBtn.classList.add('active');
    pauseBtn.classList.remove('active');
    
    await animateSorting();
}

// Animate sorting steps
async function animateSorting() {
    while (currentStepIndex < sortingSteps.length && isPlaying && !isPaused) {
        const step = sortingSteps[currentStepIndex];
        array = [...step.array];
        renderArray(step.highlights, step.arrowInfo);
        
        const isComplete = step.highlights.sorted?.length === array.length;
        
        if (step.message) {
            updateStatus(step.message, isComplete);
            addLogEntry(step.message, step.isComparison, isComplete);
        }
        
        // Only count comparison steps
        if (step.isComparison) {
            comparisonCount++;
            comparisonCountEl.textContent = comparisonCount;
        }
        
        currentStepIndex++;
        
        await sleep(animationSpeed);
    }
    
    if (currentStepIndex >= sortingSteps.length) {
        isPlaying = false;
        playBtn.classList.remove('active');
    }
}

// Toggle pause
function togglePause() {
    if (!isPlaying) return;
    
    isPaused = !isPaused;
    pauseBtn.classList.toggle('active', isPaused);
    playBtn.classList.toggle('active', !isPaused);
    
    if (isPaused) {
        updateStatus('Paused - Press play to continue');
    } else {
        animateSorting();
    }
}

// Reset visualization
function resetVisualization() {
    isPlaying = false;
    isPaused = false;
    comparisonCount = 0;
    currentStepIndex = 0;
    array = [...originalArray];
    sortingSteps = [];
    
    comparisonCountEl.textContent = '0';
    playBtn.classList.remove('active');
    pauseBtn.classList.remove('active');
    
    updateStatus('Press play to start sorting');
    clearLog();
    
    // Force rebuild of array
    const wrapper = arrayContainer.querySelector('.array-wrapper');
    if (wrapper) wrapper.innerHTML = '';
    renderArray();
}

// Copy code to clipboard
async function copyCode() {
    const algo = algorithms[currentAlgorithm];
    const plainCode = algo.code.replace(/<[^>]*>/g, '');
    
    try {
        await navigator.clipboard.writeText(plainCode);
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Copied!
        `;
        
        setTimeout(() => {
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
            `;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

// Utility: Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

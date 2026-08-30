// =============================================
// 3D BACKGROUND (Three.js)
// =============================================
const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfff5f7);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Floating particles (baby pink + white)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 300;
const positions = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
    positions[i*3] = (Math.random() - 0.5) * 80;
    positions[i*3+1] = (Math.random() - 0.5) * 60;
    positions[i*3+2] = (Math.random() - 0.5) * 40;
    
    const color = Math.random() > 0.6 ? new THREE.Color(0xd63384) : new THREE.Color(0xfff0f5);
    colors[i*3] = color.r;
    colors[i*3+1] = color.g;
    colors[i*3+2] = color.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Floating hearts (geometry)
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0);
heartShape.bezierCurveTo(0, -0.3, -0.5, -0.6, -0.5, -0.9);
heartShape.bezierCurveTo(-0.5, -1.2, 0, -1.4, 0, -1.2);
heartShape.bezierCurveTo(0, -1.4, 0.5, -1.2, 0.5, -0.9);
heartShape.bezierCurveTo(0.5, -0.6, 0, -0.3, 0, 0);

const heartGeometry = new THREE.ShapeGeometry(heartShape);
const heartMaterial = new THREE.MeshBasicMaterial({ color: 0xd63384, transparent: true, opacity: 0.15 });

const hearts = [];
for (let i = 0; i < 12; i++) {
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    heart.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 30
    );
    heart.scale.set(Math.random() * 0.6 + 0.3, Math.random() * 0.6 + 0.3, 1);
    heart.rotation.z = Math.random() * Math.PI * 2;
    scene.add(heart);
    hearts.push(heart);
}

// Mouse tracking for parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Animation loop
function animate3D() {
    requestAnimationFrame(animate3D);
    
    particles.rotation.x += 0.0003;
    particles.rotation.y += 0.0005;
    
    hearts.forEach((heart, i) => {
        heart.position.y += Math.sin(Date.now() / 3000 + i) * 0.005;
        heart.rotation.z += 0.002;
    });
    
    // Parallax effect
    particles.rotation.x += (mouseY * 0.01 - particles.rotation.x) * 0.02;
    particles.rotation.y += (mouseX * 0.01 - particles.rotation.y) * 0.02;
    
    renderer.render(scene, camera);
}
animate3D();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// =============================================
// DASHBOARD LOGIC
// =============================================
const API_BASE = 'http://localhost:8000/api';
const WS_URL = 'ws://localhost:8000/ws';

// Chart
const ctx = document.getElementById('sensorChart').getContext('2d');
const sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'LDR', data: [], borderColor: '#d63384', backgroundColor: 'rgba(214,51,132,0.05)', fill: true, tension: 0.3 },
            { label: 'Temp (°C)', data: [], borderColor: '#ff8a80', backgroundColor: 'rgba(255,138,128,0.05)', fill: true, tension: 0.3 },
            { label: 'Humidity (%)', data: [], borderColor: '#82b1ff', backgroundColor: 'rgba(130,177,255,0.05)', fill: true, tension: 0.3 }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { labels: { color: '#4a2c3a', font: { size: 11 } } }
        },
        scales: {
            x: { ticks: { color: '#b5838d', maxTicksLimit: 12 } },
            y: { ticks: { color: '#b5838d' } }
        }
    }
});

// =============================================
// API FUNCTIONS
// =============================================
async function fetchLatest() {
    try {
        const res = await fetch(`${API_BASE}/sensor-data/latest?limit=1`);
        const data = await res.json();
        if (data.length > 0) updateUI(data[0]);
    } catch (e) { console.error('API Error:', e); }
}

function updateUI(d) {
    document.getElementById('ldrValue').textContent = d.ldr_value;
    document.getElementById('tempValue').innerHTML = `${d.temperature.toFixed(1)} <span class="unit">°C</span>`;
    document.getElementById('humValue').innerHTML = `${d.humidity.toFixed(1)} <span class="unit">%</span>`;
    document.getElementById('distValue').innerHTML = `${d.distance_cm.toFixed(1)} <span class="unit">cm</span>`;
    
    const pct = Math.min(100, (d.ldr_value / 4095) * 100);
    document.getElementById('ldrBar').style.width = pct + '%';
    
    const gasEl = document.getElementById('gasValue');
    if (d.gas_detected) { gasEl.textContent = '⚠️ LEAK!'; gasEl.dataset.alert = 'true'; } 
    else { gasEl.textContent = '✅ Safe'; gasEl.dataset.alert = 'false'; }
    
    const motionEl = document.getElementById('motionValue');
    if (d.motion_detected) { motionEl.textContent = '🚨 DETECTED!'; motionEl.dataset.alert = 'true'; } 
    else { motionEl.textContent = '✅ None'; motionEl.dataset.alert = 'false'; }
    
    document.getElementById('relayValue').textContent = d.relay_status ? '🔵 ON' : '⚪ OFF';
    
    addToChart(d);
}

function addToChart(d) {
    const label = new Date().toLocaleTimeString();
    if (sensorChart.data.labels.length > 50) {
        sensorChart.data.labels.shift();
        sensorChart.data.datasets.forEach(ds => ds.data.shift());
    }
    sensorChart.data.labels.push(label);
    sensorChart.data.datasets[0].data.push(d.ldr_value);
    sensorChart.data.datasets[1].data.push(d.temperature);
    sensorChart.data.datasets[2].data.push(d.humidity);
    sensorChart.update('none');
}

async function fetchHistory(hours = 6) {
    try {
        const res = await fetch(`${API_BASE}/sensor-data/history?hours=${hours}`);
        const data = await res.json();
        sensorChart.data.labels = data.map(d => new Date(d.created_at).toLocaleTimeString());
        sensorChart.data.datasets[0].data = data.map(d => d.ldr_value);
        sensorChart.data.datasets[1].data = data.map(d => d.temperature);
        sensorChart.data.datasets[2].data = data.map(d => d.humidity);
        sensorChart.update();
    } catch (e) { console.error('History Error:', e); }
}

async function fetchAlerts() {
    try {
        const res = await fetch(`${API_BASE}/sensor-data/alerts?limit=10`);
        const data = await res.json();
        const list = document.getElementById('alertsList');
        if (data.length === 0) {
            list.innerHTML = '<li class="empty">✨ No alerts yet</li>';
            return;
        }
        list.innerHTML = data.map(d => {
            const type = d.gas_detected ? '🔥 Gas Leak' : '🚨 Motion Detected';
            return `<li>${type} • ${new Date(d.created_at).toLocaleString()}</li>`;
        }).join('');
    } catch (e) { console.error('Alerts Error:', e); }
}

// =============================================
// WEBSOCKET
// =============================================
let ws;
function connectWS() {
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
        document.querySelector('.status-badge').innerHTML = '<span class="dot"></span> Online';
    };
    ws.onmessage = (e) => {
        try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'new_data' && msg.data) {
                updateUI(msg.data);
                fetchAlerts();
            }
        } catch (err) {}
    };
    ws.onclose = () => {
        document.querySelector('.status-badge').innerHTML = '<span class="dot" style="background:#ff8a80;"></span> Offline';
        setTimeout(connectWS, 3000);
    };
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    fetchLatest();
    fetchAlerts();
    fetchHistory(6);
    connectWS();
    setInterval(fetchLatest, 10000);
    setInterval(fetchAlerts, 15000);
    
    // Chart controls
    document.querySelectorAll('.chart-controls button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-controls button').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            fetchHistory(parseInt(this.textContent));
        });
    });
});
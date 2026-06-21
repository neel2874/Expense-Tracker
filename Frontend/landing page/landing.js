// ═══════════════════════════════════════════════════════════════
// EXPNS Landing Page — Interactivity & Animations
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initExpenseCard();
    initDonutChart();
    initTrendBars();
    initScrollAnimations();
    initCounters();
});

// ─── Expense Dashboard Card ─────────────────────────────────────
function initExpenseCard() {
    const chartEl = document.getElementById('expenseChart');
    const progressEl = document.getElementById('progressRow');
    const legendEl = document.getElementById('legendRow');

    if (!chartEl) return;

    const bars = [
        { height: 55, label: 'M' },
        { height: 72, label: 'T' },
        { height: 40, label: 'W' },
        { height: 88, label: 'T' },
        { height: 63, label: 'F' },
        { height: 95, label: 'S', active: true },
        { height: 50, label: 'S' },
    ];

    const categories = [
        { name: 'Food', pct: 38, color: '#00e676' },
        { name: 'Transport', pct: 24, color: '#00b4d8' },
        { name: 'Shopping', pct: 22, color: '#c084fc' },
        { name: 'Bills', pct: 16, color: '#ff6b6b' },
    ];

    // Build bar chart
    bars.forEach((bar, i) => {
        const col = document.createElement('div');
        col.className = 'expense-card__bar-col';

        const barDiv = document.createElement('div');
        barDiv.className = 'expense-card__bar' + (bar.active ? ' expense-card__bar--active' : '');
        barDiv.style.height = '0%';

        const label = document.createElement('span');
        label.className = 'expense-card__bar-label';
        label.textContent = bar.label;

        col.appendChild(barDiv);
        col.appendChild(label);
        chartEl.appendChild(col);

        // Animate bar height after a staggered delay
        setTimeout(() => {
            barDiv.style.height = bar.height + '%';
        }, 800 + i * 80);
    });

    // Build category progress bars
    categories.forEach((cat) => {
        const track = document.createElement('div');
        track.className = 'expense-card__progress-track';

        const fill = document.createElement('div');
        fill.className = 'expense-card__progress-fill';
        fill.style.background = cat.color;
        fill.style.width = '0%';

        track.appendChild(fill);
        progressEl.appendChild(track);

        // Animate fill
        setTimeout(() => {
            fill.style.width = cat.pct + '%';
        }, 1200);
    });

    // Build legend
    categories.forEach((cat) => {
        const item = document.createElement('div');
        item.className = 'expense-card__legend-item';

        const dot = document.createElement('span');
        dot.className = 'expense-card__legend-dot';
        dot.style.background = cat.color;

        const text = document.createElement('span');
        text.className = 'expense-card__legend-text';
        text.textContent = cat.name;

        item.appendChild(dot);
        item.appendChild(text);
        legendEl.appendChild(item);
    });
}

// ─── Donut Chart (SVG) ──────────────────────────────────────────
function initDonutChart() {
    const svg = document.querySelector('.orb__donut-svg');
    if (!svg) return;

    const slices = [
        { pct: 38, color: '#00e676' },
        { pct: 24, color: '#00b4d8' },
        { pct: 22, color: '#c084fc' },
        { pct: 16, color: '#ff6b6b' },
    ];

    const r = 70, cx = 80, cy = 80;
    const circ = 2 * Math.PI * r;
    let offset = 0;

    slices.forEach((s) => {
        const dash = (s.pct / 100) * circ;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', s.color);
        circle.setAttribute('stroke-width', '20');
        circle.setAttribute('stroke-dasharray', `${dash} ${circ - dash}`);
        circle.setAttribute('stroke-dashoffset', `${-offset + circ / 4}`);
        circle.setAttribute('filter', 'url(#donutGlow)');
        circle.setAttribute('opacity', '0.85');
        svg.appendChild(circle);
        offset += dash;
    });
}

// ─── Trend Bars ─────────────────────────────────────────────────
function initTrendBars() {
    const container = document.getElementById('trendBars');
    if (!container) return;

    const heights = [40, 55, 48, 72, 60, 85, 78, 95];

    heights.forEach((h, i) => {
        const bar = document.createElement('div');
        bar.className = 'orb__trend-bar' + (i === heights.length - 1 ? ' orb__trend-bar--active' : '');
        bar.style.height = '0%';
        container.appendChild(bar);

        // Will be animated when scrolled into view via observer
        bar.dataset.targetHeight = h;
        bar.dataset.delay = (600 + i * 70);
    });
}

// ─── Scroll Animations (Intersection Observer) ──────────────────
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('visible');

                // Animate trend bars if this is their container
                if (el.closest('.orb--trend')) {
                    const bars = el.querySelectorAll('.orb__trend-bar');
                    bars.forEach((bar) => {
                        const delay = parseInt(bar.dataset.delay || 0);
                        setTimeout(() => {
                            bar.style.height = bar.dataset.targetHeight + '%';
                        }, delay);
                    });
                }

                observer.unobserve(el);
            }
        });
    }, observerOptions);

    // Observe all elements with data-observe attribute
    document.querySelectorAll('[data-observe]').forEach((el) => {
        observer.observe(el);
    });

    // Stats items with staggered delay
    document.querySelectorAll('.stats__item').forEach((item, i) => {
        item.style.transitionDelay = (i * 0.1) + 's';
        observer.observe(item);
    });

    // Feature cards with staggered delay
    document.querySelectorAll('.feature-card').forEach((card, i) => {
        card.style.transitionDelay = (i * 0.1) + 's';
    });
}

// ─── Animated Counters ──────────────────────────────────────────
function initCounters() {
    const counterEls = document.querySelectorAll('[data-counter]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    counterEls.forEach((el) => observer.observe(el));
}

function animateCounter(el) {
    const end = parseFloat(el.dataset.counter);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * end);
        el.textContent = prefix + current.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

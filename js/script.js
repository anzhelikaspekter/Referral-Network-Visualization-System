// =========================================================
// REFERRAL TREE — SINGLE FILE SYSTEM
// WITH PASSIVE LISTENERS FIXED FOR LIGHTHOUSE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------
    // 1. FIX ACTIVE CARD LABEL
    // -------------------------------
    (() => {
        const cards = document.querySelectorAll('.referral__grid-card.active');
        cards.forEach(card => {
            const status = card.querySelector('.referral__grid-status');
            if (!status) return;
            const text = [...status.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
            if (text) text.textContent = ' Active';
        });
    })();

    // =========================================================
    // 2. TOOLTIP SYSTEM
    // =========================================================
    const TooltipSystem = (() => {

        let activeTooltip = null;
        let originalParent = null;

        function openTooltip(tooltip, card, canvas) {
            tooltip.hidden = false;

            originalParent = tooltip.parentElement;
            canvas.appendChild(tooltip);

            tooltip.classList.add("__open");
            tooltip.style.position = "absolute";
            tooltip.style.zIndex = "999999";

            const cardRect = card.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();

            tooltip.style.left = (cardRect.left - canvasRect.left) + "px";
            tooltip.style.top = (cardRect.bottom - canvasRect.top + 8) + "px";

            activeTooltip = tooltip;

            document.dispatchEvent(new Event("referralTooltipUpdated"));
        }

        function closeTooltip(tooltip) {
            tooltip.classList.remove("__open");
            tooltip.hidden = true;

            if (originalParent) originalParent.appendChild(tooltip);

            tooltip.style.position = "";
            tooltip.style.left = "";
            tooltip.style.top = "";
            tooltip.style.zIndex = "";

            activeTooltip = null;

            document.dispatchEvent(new Event("referralTooltipUpdated"));
        }

        function initTooltip() {
            const canvas = document.querySelector(".referral__grid-canvas");
            if (!canvas) return;

            document.addEventListener("click", function (e) {
                const btn = e.target.closest(".referral__grid-card-user");
                const opened = document.querySelector(".referral__grid-user-tooltip.__open");

                if (!btn) {
                    if (opened) closeTooltip(opened);
                    return;
                }

                const card = btn.closest(".referral__grid-card");
                const tooltip = card.querySelector(".referral__grid-user-tooltip");
                if (!tooltip) return;

                if (tooltip === activeTooltip) {
                    closeTooltip(tooltip);
                    return;
                }

                if (opened) closeTooltip(opened);
                openTooltip(tooltip, card, canvas);
            }, { passive: true });
        }

        return { init: initTooltip };

    })();

    // =========================================================
    // 3. GRID BUILDER
    // =========================================================
    const GridBuilder = (() => {

        function rebuildGrid() {
            const grid = document.querySelector('.referral__grid');
            if (!grid) return null;

            const items = [...grid.querySelectorAll('.referral__grid-item[data-id]')];
            if (!items.length) return null;

            const nodes = new Map();

            items.forEach(el => {
                const id = el.dataset.id;
                nodes.set(id, {
                    id,
                    parentId: el.dataset.parent || null,
                    el,
                    children: [],
                    col: null,
                    level: null
                });
            });

            nodes.forEach(n => {
                if (!n.parentId) return;
                if (nodes.has(n.parentId)) {
                    nodes.get(n.parentId).children.push(n);
                }
            });

            const roots = [...nodes.values()].filter(n => !n.parentId || !nodes.has(n.parentId));
            const root = roots[0];

            if (!root) return grid;

            const levels = [];
            levels.push([root]);

            let i = 0;
            while (i < levels.length) {
                const next = [];
                levels[i].forEach(node => {
                    node.level = i;
                    node.children.forEach(ch => next.push(ch));
                });
                if (next.length) levels.push(next);
                i++;
            }

            let maxChildren = 0;
            nodes.forEach(n => {
                maxChildren = Math.max(maxChildren, n.children.length);
            });
            const maxCols = Math.max(3, maxChildren || 1);

            root.col = Math.floor(maxCols / 2);

            for (let levelIdx = 1; levelIdx < levels.length; levelIdx++) {
                const row = levels[levelIdx];
                const processed = new Set();

                row.forEach(node => {
                    const parent = nodes.get(node.parentId);
                    if (!parent || processed.has(parent.id)) return;

                    processed.add(parent.id);
                    const kids = parent.children;

                    const start = parent.col - Math.floor((kids.length - 1) / 2);

                    kids.forEach((ch, index) => {
                        ch.col = Math.min(maxCols - 1, Math.max(0, start + index));
                        ch.level = parent.level + 1;
                    });
                });
            }

            const newGrid = document.createElement('div');
            newGrid.className = 'referral__grid';

            levels.forEach(level => {
                const rowCells = Array.from({ length: maxCols }, () => {
                    const cell = document.createElement('div');
                    cell.className = 'referral__grid-item';
                    return cell;
                });

                level.forEach(node => {
                    const target = rowCells[node.col];
                    while (node.el.firstChild) target.appendChild(node.el.firstChild);
                    target.dataset.id = node.id;
                    if (node.parentId) target.dataset.parent = node.parentId;
                });

                rowCells.forEach(c => newGrid.appendChild(c));
            });

            grid.replaceWith(newGrid);
            newGrid.style.gridTemplateColumns = `repeat(${maxCols}, 1fr)`;

            document.dispatchEvent(new Event("referralGridReady"));

            return newGrid;
        }

        return { rebuild: rebuildGrid };

    })();

    // =========================================================
    // 4. LINES SYSTEM — passive listeners fixed
    // =========================================================
    const LineDrawer = (() => {

        function initLines() {
            const canvas = document.querySelector('.referral__grid-lines');
            const gridCanvas = document.querySelector('.referral__grid-canvas');
            const grid = document.querySelector('.referral__grid');

            if (!canvas || !grid || !gridCanvas) return;

            const ctx = canvas.getContext('2d');

            function resize() {
                canvas.width = gridCanvas.clientWidth;
                canvas.height = gridCanvas.clientHeight;
            }

            function getLocalRect(elem) {
                const r = elem.getBoundingClientRect();
                const g = grid.getBoundingClientRect();

                return {
                    left: r.left - g.left,
                    top: r.top - g.top,
                    width: r.width,
                    height: r.height
                };
            }

            function draw() {
                resize();
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                ctx.strokeStyle = "rgba(255,255,255,0.20)";
                ctx.lineWidth = 2;
                ctx.lineCap = "round";

                const items = [...grid.querySelectorAll('.referral__grid-item[data-id]')];
                const map = new Map();
                items.forEach(i => map.set(i.dataset.id, i));

                const parentMap = new Map();
                items.forEach(item => {
                    const p = item.dataset.parent;
                    if (!p) return;
                    if (!parentMap.has(p)) parentMap.set(p, []);
                    parentMap.get(p).push(item);
                });

                parentMap.forEach((children, parentId) => {
                    const parentItem = map.get(parentId);
                    const parentCard = parentItem?.querySelector('.referral__grid-card');
                    if (!parentCard) return;

                    const p = getLocalRect(parentCard);
                    const parentX = p.left + p.width / 2;
                    const parentBottom = p.top + p.height;
                    const offset = 25;

                    if (children.length === 1) {
                        const childCard = children[0].querySelector('.referral__grid-card');
                        const c = getLocalRect(childCard);
                        const childX = c.left + c.width / 2;

                        ctx.beginPath();
                        ctx.moveTo(parentX, parentBottom);
                        ctx.lineTo(parentX, parentBottom + offset);
                        ctx.lineTo(childX, parentBottom + offset);
                        ctx.lineTo(childX, c.top);
                        ctx.stroke();
                        return;
                    }

                    const coords = children.map(ch => {
                        const r = getLocalRect(ch.querySelector('.referral__grid-card'));
                        return {
                            x: r.left + r.width / 2,
                            top: r.top
                        };
                    });

                    const minX = Math.min(...coords.map(c => c.x));
                    const maxX = Math.max(...coords.map(c => c.x));
                    const midY = parentBottom + offset;

                    ctx.beginPath();
                    ctx.moveTo(parentX, parentBottom);
                    ctx.lineTo(parentX, midY);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(minX, midY);
                    ctx.lineTo(maxX, midY);
                    ctx.stroke();

                    coords.forEach(c => {
                        ctx.beginPath();
                        ctx.moveTo(c.x, midY);
                        ctx.lineTo(c.x, c.top);
                        ctx.stroke();
                    });
                });
            }

            window.addEventListener("resize", draw, { passive: true });
            document.addEventListener("referralGridReady", draw, { passive: true });
            document.addEventListener("referralTooltipUpdated", draw, { passive: true });

            // redraw while moving mouse — safe passive
            document.addEventListener("mousemove", draw, { passive: true });

            // touchmove may scroll the page → passive MUST be false
            document.addEventListener("touchmove", draw, { passive: false });

            draw();
        }

        return { init: initLines };
    })();

    // =========================================================
    // 5. PANORAMA — passive listeners fixed
    // =========================================================
    const Panorama = (() => {

        function initPanorama() {
            const wrap = document.querySelector(".referral__grid-wrap");
            const canvas = document.querySelector(".referral__grid-canvas");
            const grid = document.querySelector(".referral__grid");

            if (!wrap || !canvas || !grid) return;

            let isDown = false;
            let isTouch = false;
            let axis = null;

            let offsetX = 0;
            let offsetY = 0;

            let startX = 0;
            let startY = 0;
            let startOffsetX = 0;
            let startOffsetY = 0;

            const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

            function bounds() {
                const wrapW = wrap.clientWidth;
                const wrapH = wrap.clientHeight;

                const contentW = grid.scrollWidth;
                let contentH = grid.scrollHeight;

                const tip = document.querySelector(".referral__grid-user-tooltip.__open");
                if (tip) {
                    const tRect = tip.getBoundingClientRect();
                    const cRect = canvas.getBoundingClientRect();
                    const bottom = tRect.bottom - cRect.top;
                    if (bottom > contentH) contentH = bottom + 40;
                }

                let minX, maxX, minY, maxY;

                if (contentW <= wrapW) {
                    minX = maxX = (wrapW - contentW) / 2;
                } else {
                    minX = wrapW - contentW;
                    maxX = 0;
                }

                if (contentH <= wrapH) {
                    minY = maxY = (wrapH - contentH) / 2;
                } else {
                    minY = wrapH - contentH;
                    maxY = 0;
                }

                return { minX, maxX, minY, maxY };
            }

            function apply() {
                const b = bounds();

                offsetX = clamp(offsetX, b.minX, b.maxX);
                offsetY = clamp(offsetY, b.minY, b.maxY);

                canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

                window.__PAN_X = () => offsetX;
                window.__PAN_Y = () => offsetY;

                document.dispatchEvent(new Event("referralPanUpdated"));
            }

            function center() {
                offsetX = (wrap.clientWidth - grid.scrollWidth) / 2;
                offsetY = 0;
                apply();
            }

            wrap.addEventListener("mousedown", e => {
                isDown = true;
                isTouch = false;

                startX = e.pageX;
                startY = e.pageY;
                startOffsetX = offsetX;
                startOffsetY = offsetY;
                axis = null;
            }, { passive: true });

            document.addEventListener("mousemove", e => {
                if (!isDown || isTouch) return;

                const dx = e.pageX - startX;
                const dy = e.pageY - startY;

                if (!axis) axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";

                if (axis === "x") offsetX = startOffsetX + dx;
                else offsetY = startOffsetY + dy;

                apply();
            }, { passive: true });

            document.addEventListener("mouseup", () => {
                isDown = false;
                axis = null;
            }, { passive: true });

            wrap.addEventListener("touchstart", e => {
                isDown = true;
                isTouch = true;

                startX = e.touches[0].pageX;
                startY = e.touches[0].pageY;
                startOffsetX = offsetX;
                startOffsetY = offsetY;
                axis = null;
            }, { passive: true });

            wrap.addEventListener("touchmove", e => {
                if (!isDown || !isTouch) return;

                // MUST BE passive:false — we stop browser scroll
                e.preventDefault();

                const t = e.touches[0];
                const dx = t.pageX - startX;
                const dy = t.pageY - startY;

                if (!axis) axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";

                if (axis === "x") offsetX = startOffsetX + dx;
                else offsetY = startOffsetY + dy;

                apply();
            }, { passive: false });

            wrap.addEventListener("touchend", () => {
                isDown = false;
                isTouch = false;
                axis = null;
            }, { passive: true });

            center();
            window.addEventListener("resize", center, { passive: true });
        }

        return { init: initPanorama };
    })();

    // =========================================================
    // 6. INIT
    // =========================================================
    function initReferralTree() {
        GridBuilder.rebuild();
        TooltipSystem.init();
        Panorama.init();
        LineDrawer.init();
    }

    initReferralTree();
});
# Referral Tree Explorer  

Interactive multi-level network visualizer with automatic hierarchical layout, canvas-rendered connectors, and full panoramic navigation.  

This component converts a flat DOM structure into a fully aligned referral tree:  
nodes are positioned algorithmically, parent–child chains resolve into clean tiers, and all connections are drawn via a high-performance canvas overlay.  
The interface supports both mouse and touch navigation, with controlled axis-locked panning and smart tooltip handling.  

There are no external dependencies — the entire engine is implemented in pure HTML, SCSS, and vanilla JavaScript.  

🔗 [**Live Demo**](https://anzhelikaspekter.github.io/Referral-Network-Visualization-System/prod/)  
🎨 [**Live Code**](https://codepen.io/anzhelikaspekter/pen/RNaywQL)  
📃 [**Details Case**](https://anzhelikaspekter.notion.site/Referral-Tree-Visualization-System-2c0d69b00e74807fbd52d89277823433?pvs=74)  

---

## Features  

### 1. **Automatic Tree Construction**  
- Parses DOM nodes annotated with data-id and data-parent  
- Builds internal graph model  
- Identifies root, levels, and child sets  

### 2. **Dynamic Layout Algorithm**  
- Distributes nodes across rows based on depth  
- Calculates optimal column placement per parent  
- Reconstructs DOM to preserve structural accuracy  
- Supports large and uneven referral chains  

### 3. **Canvas-Based Connectors**  
- Draws lines between tiers in real-time  
- Aligns connection points to card centers  
- Updates automatically on resize, panning, or tooltip changes  
- GPU-accelerated via transforms for smooth rendering  

### 4. **Advanced Tooltip System**  
- Tooltips detach from node and move to the canvas layer  
- Dynamically positioned relative to card + grid transform  
- Never clip through edges; recalculates bounds on open/close  
- Works with both mouse and touch interactions  

### 5. **Panoramic Navigation**  
- Drag to pan (mouse + touch)  
- Axis-lock detection for natural movement  
- Hard boundary clamping  
- Auto-centering on initial load  
- Smooth integration with tooltip engine & line renderer  

### 6. **Pure Vanilla Implementation**  
- No frameworks  
- No SVG renderers  
- No layout libraries  
- Works in any static environment (GitHub Pages, offline bundles, dashboards)  

---

## Technical Breakdown  

### **Tree Parsing & Mapping**  
The system scans .referral__grid-item elements, builds a node graph, resolves parent chains, then organizes them into ordered tree levels.  

### **Layout Reconstruction**  
After determining the tree’s structure, the component rebuilds the grid dynamically, creating a stable and symmetric hierarchy regardless of data irregularities.  

### **Canvas Rendering Engine**  
All connectors are drawn onto a dedicated canvas layer:  
- multi-child branching support  
- midpoint horizontal rails  
- responsive recalculation on all movement events  

### **Panorama Controller**  
Custom drag engine that:  
- handles both pointer and touch events  
- detects primary axis automatically  
- clamps panning within content limits  
- synchronizes with line rendering & tooltip placement  

---

## Installation & Usage  

Include the generated CSS and JS:  

```html
<link rel="stylesheet" href="css/style.min.css">
<script src="js/script.js" defer></script>
```  

Ensure each grid node is structured as:  

```html
<div class="referral__grid-item" data-id="3" data-parent="1">
    <article class="referral__grid-card" data-user="3">
        ...
    </article>
</div>
```  

No further configuration required. The entire system initializes automatically on page load.  

---

## Use Cases  

Suitable for:  
- Referral / affiliate dashboards  
- Partner tree analytics  
- MLM compensation structures  
- Team / org charts  
- Growth mapping  
- Hierarchical data visualization  
- Ancestry or lineage diagrams  
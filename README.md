# Referral Tree Explorer  
Dynamic hierarchical network visualizer with canvas-based relationship mapping.

This component generates an interactive multi-level referral tree from raw structured data and converts it into a clean visual hierarchy. Nodes automatically align based on parent–child depth, spacing is calculated algorithmically, and relationships are drawn dynamically on a canvas layer with responsive scaling.

The grid is fully pannable — users can drag the map horizontally or vertically, and smart bounding keeps navigation controlled even with tooltips expanded. Each node includes a hover-activated detail panel displaying structured user metadata: rank, turnover, payouts, activity status, upline, and more.

No frameworks, no external libraries — everything is pure HTML/CSS/JavaScript.



## Features

1. **Dynamic tree generation from raw data**  
   Parses DOM, maps parent relations (data-id, data-parent).

2. **Automatic layout calculation**  
   Distributes nodes across rows & columns based on branching depth.

3. **Canvas-drawn connectors**  
   Curves + lines drawn between tiers in real-time.

4. **Status-based UI styling**  
   Active/inactive modifies card state + indicator.

5. **Interactive tooltips**  
   Detached on-open, overlaid above canvas, follow grid transform.

6. **Responsive panning system**  
   Mouse + touch movement with axis-lock logic.

7. **Zero dependencies**  
   No SVG libraries, no frameworks, no UI kits.



## Technical Breakdown
This interface runs through several execution phases:

1. **Tree Parsing & Mapping**  
   Builds a graph based on `data-id` / `data-parent`, resolves child chains and root.

2. **Grid Reconstruction**  
   Calculates levels, assigns positions, then rebuilds the DOM with correct layout.

3. **Canvas Rendering**  
   Draws relational links between nodes dynamically for high-depth structures.

4. **Panoramic Navigation**  
   Custom drag controller for smooth panning across any network size.



## Where this component fits
Suitable for:  
▸ referral/affiliate dashboards  
▸ partner tree analytics  
▸ MLM visualization layers  
▸ organization charts & lineage structures  
▸ user-growth & revenue flow mapping  
▸ genealogy or data structure graphs

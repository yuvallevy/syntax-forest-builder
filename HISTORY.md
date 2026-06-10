## Alpha
### 0.8.2 (2026-06-10)
* Made live string width measurement the default, since the old method caused more problems than expected. (tnx Adi Raz for reporting)
* Replaced the old hand-holdy "demo" with an animated, step-by-step "guided tour" that teaches users how to use the app.
  - Unlike the old demo, this tour is by design _not_ interactive. This means it does not require any linguistics knowledge to complete, making it more accessible to non-linguists.
  - Instead of interactivity, this tour uses an animated mouse cursor to show users exactly where to click, bypassing the lack of a mouse on mobile devices. This is important because the app is heavily mouse-dependent and the old demo was hard to follow on mobile.
### 0.8.1 (2026-06-03)
* Slightly improved node creation trigger UX:
  - Branching node creation triggers are no longer hidden by terminal node creation triggers.
  - When three or more top-level nodes are selected in the same tree, a branching node creation trigger for all selected nodes will appear above the middle of the selection. This is useful for ditransitive verbs in some syntax models.
### 0.8 (2026-05-06)
* Added a new "Shapes" feature, allowing users to draw simple shapes on the canvas to annotate their trees. (tnx Adi Raz for requesting)
* Added an option to import and export entire forests as files, allowing users to transfer their work between different devices and share it with others.
* Added the long-awaited option to export a single tree as a PNG file.
* Improved performance when panning and zooming around the canvas when large trees are present.
* Reworked tree selection UX:
  - Removed old, buggy "Select trees" mode.
  - Added option to select a tree without Alt+clicking by clicking on its boundary.
  - Selection boxes are now smarter, selecting either nodes or trees depending on the contents of the box.
* Fixed minor graphical error where lines connecting two child nodes to their parent would be drawn with a small gap between them.
### 0.7.5 (2026-02-22)
* Added ability to fold/unfold nodes through new options in the menu and new keyboard shortcuts (Ctrl-- and Ctrl-=).
  This is useful for large trees where irrelevant parts of the tree need to be temporarily hidden.
### 0.7.4 (2025-10-11)
* Fixed bug that caused some clicks to randomly not count on certain operating systems.
### 0.7.3 (2025-02-16)
* Added simple strikethrough functionality.
  Select any part of a sentence and click the Strikethrough button on the toolbox to draw a line through it.
  (tnx Amit Benalal for requesting)
### 0.7.2 (2024-11-11)
* Added pretty rendering for bar notation and subscripts in node labels.
  On by default, can be turned off via Settings. (tnx Amit Benalal for requesting)
### 0.7.1 (2024-11-10)
* Fixed bug that caused corresponding nodes in copied and pasted trees to be linked.
### 0.7 (2024-11-03)
* New design! Different parts of the interface are now more clearly separated and docked to the sides.
* Added a "Mark" menu to mark nodes with certain relations to the selected node.
* Fixed weird bug on some browsers where the program would crash when a tree was added and immediately deleted.
### 0.6 (2024-05-05)
* Zoom in/out and pan around the view using the scroll wheel, trackpad or Shift+drag.
* Paste labelled bracket notation into the input field, or drag an expression onto an empty spot, to spawn a new tree.
* Use the new `[...]` button in the toolbox to export a tree to labelled bracket notation.
### 0.5 (2023-10-04)
* Rewrote core functionality in Kotlin to make writing this a little more fun. (Pun intended)
* Added the long-overdue save/load function.
  * Currently only works within the browser. Uploading/downloading and exporting to other formats is a planned addition.
* Added automatic reformatting of letters and numbers as subscripts (optional, on by default).
* Rewrote text width measurement in two ways, one fast and one accurate.
* Added a settings screen to toggle subscript auto-format and text width measurement method.
* Added a crash screen for when something goes wrong.
### 0.4 (2023-06-24)
* Added a way to create multiple plots, which are separate boards that can each hold multiple trees.
* Fixed bug that caused a new node to be created when pressing <kbd>&uarr;</kbd>
  from the edge of a word already associated with a node. (tnx Saar Yahalom for reporting)
### 0.3 (2022&ndash;2023)
* Complete rewrite boasting better UX, multiple trees and other goodies.
### 0.2 (2021-12-18)
* Added the long-overdue undo/redo functionality.
### 0.1 (2021-01-07)
* Fixed bug where top-level nodes were able to adopt themselves, triggering a recursion error and causing the tree to implode. (tnx Ziv Plotnik for reporting)
## Pre-Alpha
### Demo 2 (2020-11)
### Demo 1 (2020-04)

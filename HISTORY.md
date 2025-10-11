## Alpha
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

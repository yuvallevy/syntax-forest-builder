# NPBloom

_They say colorless green ideas sleep furiously. With NPBloom, you can watch them wake up and dance around._

NPBloom lets you create clean, publication-ready syntax trees in a WYSIWYG fashion, with a linguist-centered interface that translates familiar workflows directly from pen and paper to the screen.

An alpha version is currently available at [yuvalinguist.space](https://yuvalinguist.space/npbloom).

A big thank you to my primary tester, [Prof. Tal Siloni](https://english.tau.ac.il/profile/siloni), and the many students, TAs, and faculty members from Tel Aviv University who have provided feedback and suggestions along the way.

The NPBloom logo was designed by [Hadar Oren](https://hadarorenart.wixsite.com/hrodesign).

<details>
  <summary>Background</summary>

  NPBloom was conceived in 2019 while I was studying linguistics at the Open University of Israel, in an earlier form archived at [syntax-tree-builder](https://github.com/yuvallevy/syntax-tree-builder). It was a response to the difficulty students were having in creating syntax trees for their assignments, and the lack of tools that could produce high-quality output while also reflecting the workflows we were used to with pen and paper.

  I refined the tool as I was continuing my studies at Tel Aviv University, and in 2021 I first presented it to faculty there. The tool was a hit, passing by word of mouth among faculty and students who incorporated it into their workflows. As an entertaining testament to its utility, I once took a class where the final exam featured a tree made with NPBloom as part of the question. In a way, I helped write the exam I was taking 😎
</details>

## Why NPBloom?

NPBloom's standout features include:

- **Linguist-centered design**: The interface is designed to reflect the workflows and conventions familiar to linguists, making it more intuitive for those in the field. In particular, it allows the creation of trees bottom-up, starting from the words and building up to the root, mirroring how linguistics students start out when learning to draw trees.
- **Clean, publication-ready output**: The trees produced by NPBloom fit seamlessly into academic papers and presentations.
- **No installation**: NPBloom is a web app, so you can use it on any device with a modern browser. No need to install anything or worry about compatibility issues.
- **WYSIWYG interface**: You don't define the tree in one place and then see it rendered in another. Instead, you build the tree directly on the canvas, and it looks exactly as it will when you export it.
- **Infinite canvas**: Draw any tree anywhere you want, not limited even by the size of your screen. Illustrate a progression, compare different analyses side by side, or even use the canvas as a substitute for a whiteboard.
- **Infinite complexity**: NPBloom's navigation and "folding" utilities tame even the most terrifying center-embedded monstrosities into just another tree. The rat the cat the dog bit chased escaped? No problem.
- **Local saving**: You can save your trees locally on your device, without needing to create an account or worry about data privacy.

**NPBloom does not facilitate cheating and does not use AI, generative or otherwise.** As a professor or TA, you can safely distribute NPBloom to your students without worrying they may use it to generate answers to assignments or exams. It replaces the manual work of drawing trees, not the intellectual work of thinking about them.

## Current status and future plans

While NPBloom is functional and has proven itself in real-world use, it lacks a few important features that are on the roadmap for future development. These include:

* Exporting trees in various formats (e.g. PNG, SVG, LaTeX). You can save trees within the app, and you can export to and import from labelled bracket notation, but there is currently no way to directly export them as images for use in papers or presentations. This is a high priority for future development.
* Support for top-down trees, as is common in certain modern frameworks of syntax such as minimalism. Currently, NPBloom only supports the more traditional bottom-up style of tree, where the words are aligned at the bottom and the root is at the top. This is the style most commonly used in introductory syntax courses, but I plan to add support for top-down trees in the future.

## Stack

NPBloom is divided into two main components:
* `npbloom-core`: A Kotlin Multiplatform library that implements the core logic of the application, including tree data structures, algorithms for tree manipulation, and some underlying UI logic.
* `npbloom-web`: A web application built with React and TypeScript that provides the user interface for creating and editing syntax trees. It uses `npbloom-core` for the underlying logic. No external libraries are used for rendering the trees; all rendering is done using plain SVG.

Detailed technical documentation is available in [NOTES.md](https://github.com/yuvallevy/syntax-forest-builder/blob/main/NOTES.md).

## Contributing

Contributions to NPBloom are welcome, in the form of bug reports, feature requests, or pull requests. For the latter, please include tests for any new features or bug fixes, and screenshots or videos if your contribution involves changes to the user interface.

You may use AI assistants in contributions, as long as you review and understand the generated code before submitting it. Commit messages and pull request descriptions must be fully human-written.

Requests for AI features will be denied and pull requests that add them will be rejected.

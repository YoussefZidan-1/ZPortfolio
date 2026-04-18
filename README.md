# 💻 ZPortfolio — MacOS Inspired Creative Portfolio

Welcome to **ZPortfolio**, a highly interactive, MacOS-inspired personal portfolio designed and developed by **Yousef Zedan (ZED Studios)**. This project isn't just a website; it's a browser-based operating system experience built to showcase creative development skills through draggable windows, a functional file explorer, and high-end animations.

---

## ✨ Features

- 🖥️ **Desktop OS Experience:** A custom window manager handling minimize, maximize, and close actions with focus-based z-index logic.
- 🖱️ **Draggable Windows:** Fluid, interactive window movements powered by **GSAP Draggable**.
- 📁 **Finder (File Explorer):** A fully functional navigation system to browse projects, read text files, and view images.
- 🌊 **Animated Dock:** A MacOS-style app dock with proximity-based scaling and magnification effects.
- 📄 **Integrated PDF Viewer:** View and download my professional resume natively within the interface.
- 🎨 **Dynamic Typography:** Interactive variable font weight adjustments that react to mouse movements.
- ⚡ **Optimized State Management:** Powered by **Zustand** and **Immer** for seamless window and location handling.

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) & [Vite](https://vitejs.dev/)
- **Animations:** [GSAP](https://gsap.com/) & [GSAP Draggable](https://gsap.com/docs/v3/Plugins/Draggable/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (with Immer middleware)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/) & Custom SVGs
- **PDF Rendering:** [React-PDF](https://github.com/wojtekmaj/react-pdf)

---

## 🚀 Getting Started

### Prerequisites
Ensure you have **Node.js** and **npm** installed on your machine.

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/YoussefZidan-1/ZPortfolio.git
   ```

2. **Navigate to the project directory:**
   ```sh
   cd zportfolio
   ```

3. **Install dependencies:**
   ```sh
   npm install
   ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Open your browser:** Visit `http://localhost:5173` to see the magic.

---

## 🗺️ Roadmap (Open Source Goals)

This portfolio is a living project. I’m planning to implement the following features and would love for the community to contribute:

- [ ] 🌓 **Light / Dark Mode:** Implement a full theme-switching mechanism using the existing `oklch` CSS variable structure.
- [ ] 📱 **Mobile iOS Version:** Transform the desktop layout into a responsive iOS-inspired experience for mobile users.
- [x] ⌨️ **Interactive Terminal:** Upgrade the static terminal into a functional CLI that accepts commands like `ls`, `cd`, and `cat` autocomplete, open apps and more.
- [ ]  **Arch Linux Boot Sequence:** When The Website opens it shows a looding arch linux screen like GRUB & SDDM.
- [ ]  **System Sounds:** Adding subtle sound effects (a mechanical keyboard click for the terminal, a swoosh when a window opens, a crumple sound when something goes to the trash) elevates the "feel" of the OS incredibly.

---

## 📂 Project Structure

```text
src/
├── components/      # UI Components: Dock, Navbar, Welcome text, WindowControls
├── constants/       # Core Data: Apps, Projects, Tech Stack, Social links
├── hoc/             # HOCs: WindowWrapper for draggable and focus logic
├── store/           # Zustand Stores: Window manager and directory state
├── windows/         # App Windows: Finder, Safari, Photos, Terminal, etc.
└── App.jsx          # Main application registry and layout
```

---

## 📫 Contact & Credits

**Yousef Zedan (ZED Studios)**

<div align="center">

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:zedstudios.devs@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yousef-zedan-6a275a400/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YoussefZidan-1/)
[![X](https://img.shields.io/badge/X-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/YousefZeda59629)

</div>
<p align="center">
  Developed with passion by <b>Yousef Zedan (ZED Studios)</b>. <br>
  <i>"Always building, always learning."</i>
</p>

---

### 🎨 Visual Portfolio Preview
> **Note:** The icons above will take you directly to my profiles. If you want to see the MacOS experience in action, check out the [Live Demo](https://yzportfolio.vercel.app/).

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.

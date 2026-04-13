/**
 * 💻 ZPortfolio — MacOS Inspired Creative Portfolio
 * ------------------------------------------------
 * Created & Developed by: Yousef Zedan (ZEDStudios)
 * GitHub: https://github.com/YoussefZidan-1/zportfolio
 * License: MIT (Attribution required)
 * ------------------------------------------------
 * "If you're using this template, a star on GitHub would mean a lot! ⭐"
 */

const navLinks = [
  {
    id: 1,
    name: "Projects",
    type: "finder",
  },
  {
    id: 3,
    name: "Contact",
    type: "contact",
  },
  {
    id: 4,
    name: "Resume",
    type: "resume",
  },
];

const navIcons = [
  {
    id: 1,
    img: "/icons/wifi.svg",
  },
  {
    id: 2,
    img: "/icons/search.svg",
  },
  {
    id: 3,
    img: "/icons/user.svg",
  },
  {
    id: 4,
    img: "/icons/mode.svg",
  },
];

const dockApps = [
  {
    id: "finder",
    name: "Portfolio",
    icon: "finder.png",
    canOpen: true,
  },
  {
    id: "safari",
    name: "Certificates",
    icon: "safari.png",
    canOpen: true,
  },
  {
    id: "photos",
    name: "Gallery",
    icon: "photos.png",
    canOpen: true,
  },
  {
    id: "contact",
    name: "Contact",
    icon: "contact.png",
    canOpen: true,
  },
  {
    id: "terminal",
    name: "Skills",
    icon: "terminal.png",
    canOpen: true,
  },
  {
    id: "trash",
    name: "Archive",
    icon: "trash.png",
    canOpen: false,
  },
];

const blogPosts = [
  {
    id: 1,
    date: "June 27, 2025",
    title: "CS50x Certificate",
    image: "/images/blog1.png",
    link: "https://cs50.harvard.edu/certificates/4e5fe04c-408a-40f9-9da4-126af12a296f",
  },
  {
    id: 2,
    date: "Jan 11, 2026",
    title: "freeCodeCamp | Responsive Web Design Certificate",
    image: "/images/blog2.png",
    link: "https://www.freecodecamp.org/certification/youssef_zidan-1/responsive-web-design-v9",
  },
  {
    id: 3,
    date: "Feb 19, 2026",
    title: "freeCodeCamp | JavaScript Algorithms and Data Structures",
    image: "/images/blog3.png",
    link: "https://www.freecodecamp.org/certification/youssef_zidan-1/javascript-v9",
  },
];

const techStack = [
  {
    category: "Frontend:",
    items: ["HTML", "CSS", "JS", "React", "Tailwind CSS"],
  },
  {
    category: "Languages:",
    items: ["C", "Python", "Bash"],
  },
  {
    category: "Backend:",
    items: ["Appwrite"],
  },
  {
    category: "Creative:",
    items: ["GSAP", "Blender", "DaVinci Resolve", "CapCut"],
  },
  {
    category: "Env & Editor:",
    items: ["Arch Linux", "Hyprland", "Neovim", "Ghostty"],
  },
  {
    category: "(Learning):",
    items: ["TS", "Next.js", "React Native"],
  },
  {
    category: "(Planned):",
    items: ["Three.js", "WebGL", "WebGPU"],
  },
];

const socials = [
  {
    id: 1,
    text: "Github",
    icon: "/icons/github.svg",
    bg: "#1a1a3a",
    link: "https://github.com/YoussefZidan-1/",
  },
  {
    id: 2,
    text: "Whatsapp",
    icon: "/icons/atom.svg",
    bg: "#4bcb63",
    link: "https://wa.me/+201130765715",
  },
  {
    id: 3,
    text: "X",
    icon: "/icons/twitter.svg",
    bg: "#000000",
    link: "https://x.com/YousefZeda59629",
  },
  {
    id: 4,
    text: "LinkedIn",
    icon: "/icons/linkedin.svg",
    bg: "#05b6f6",
    link: "https://www.linkedin.com/in/yousef-zedan-6a275a400/",
  },
];

const photosLinks = [
  { id: 1, icon: "/icons/gicon1.svg", title: "Library" },
  { id: 2, icon: "/icons/gicon2.svg", title: "Memories" },
  { id: 3, icon: "/icons/file.svg", title: "Places" },
  { id: 4, icon: "/icons/gicon4.svg", title: "People" },
  { id: 5, icon: "/icons/gicon5.svg", title: "Favorites" },
];

const gallery = [
  { id: 1, img: "/images/gal5.png" },
  { id: 2, img: "/images/gal3.png" },
  { id: 3, img: "/images/gal1.jpg" },
  { id: 4, img: "/images/gal4.png" },
];

const WORK_LOCATION = {
  id: 1,
  type: "work",
  name: "Projects",
  icon: "/icons/work.svg",
  kind: "folder",
  children: [
    // ▶ Project 1
    {
      id: 5,
      name: "ZCinema",
      icon: "/images/folder.png",
      kind: "folder",
      position: "top-10 left-5",
      windowPosition: "top-[10vh] left-[5vw]",
      children: [
        {
          id: 51,
          name: "ZCinema.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-10 left-5",
          description: [
            "The ZCinema website is a sleek and modern platform designed for searching films and trending lists.",
            "Instead of a simple online website, it delivers an immersive experience with bold visuals, interactive movie card display, and smooth navigation.",
            "It's built with React.js and Tailwind, ensuring fast performance, responsive design, and a clean, premium look.",
          ],
        },
        {
          id: 52,
          name: "z-cinema.vercel.app",
          icon: "/images/zcinema.png",
          kind: "file",
          fileType: "url",
          href: "https://z-cinema.vercel.app",
          position: "top-10 left-40",
        },
        {
          id: 53,
          name: "ZCinema.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-10 left-72",
          imageUrl: "/images/project-1.png",
        },
      ],
    },
    // ▶ Project 2
    {
      id: 6,
      name: "ZProximity Engine",
      icon: "/images/folder.png",
      kind: "folder",
      position: "top-10 left-36", 
      windowPosition: "top-[15vh] left-[15vw]",
      children: [
        {
          id: 61,
          name: "ZProximity.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-10 left-5",
          description: [
            "The ZProximity Engine website is a sleek and modern platform designed to help programmers making high-performance organic animations.",
            "Instead of simple static animations, it delivers an immersive experience with bold visuals, interactive presets, and smooth easing types.",
            "It's built with React.js and GSAP, ensuring fast performance, responsive design, and a clean, premium look.",
          ],
        },
        {
          id: 62,
          name: "z-proximity-engine.vercel.app",
          icon: "/images/zproximity.svg",
          kind: "file",
          fileType: "url",
          href: "https://z-proximity-engine.vercel.app",
          position: "top-10 left-40",
        },
        {
          id: 63,
          name: "ZProximity.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-10 left-72",
          imageUrl: "/images/project-2.JPG",
        },
      ],
    },
  ],
};

const ABOUT_LOCATION = {
  id: 2,
  type: "about",
  name: "About me",
  icon: "/icons/info.svg",
  kind: "folder",
  children: [
    {
      id: 21,
      name: "me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-5",
      imageUrl: "/images/yousef-2.png",
    },
    {
      id: 22,
      name: "casual-me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-32",
      imageUrl: "/images/yousef-3.png",
    },
    {
      id: 23,
      name: "ME!.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-60",
      imageUrl: "/images/yousef-4.jpg",
    },
    {
      id: 24,
      name: "about-me.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-40 left-5",
      subtitle: "Meet the Developer Behind the Code",
      image: "/images/yousef.png",
      description: [
        "Hey! I’m Youssef 👋, a Creative developer who enjoys building sleek, interactive websites that actually work well.",
        "I specialize in JavaScript, React, and GSAP—and I love making things feel smooth, fast, and just a little bit delightful.",
        "I’m big on clean UI, good UX, and writing code that doesn’t need a search party to debug.",
        "Outside of dev work, you'll find me tweaking layouts at 2AM, sipping overpriced coffee, or impulse-buying gadgets I absolutely convinced myself I needed 😅",
      ],
    },
  ],
};

const RESUME_LOCATION = {
  id: 3,
  type: "resume",
  name: "Resume",
  icon: "/icons/file.svg",
  kind: "folder",
  children: [
    {
      id: 31,
      name: "Resume.pdf",
      icon: "/images/pdf.png",
      kind: "file",
      fileType: "pdf",
    },
  ],
};

const TRASH_LOCATION = {
  id: 4,
  type: "trash",
  name: "Trash",
  icon: "/icons/trash.svg",
  kind: "folder",
  children: [
    {
      id: 41,
      name: "trash1.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-10",
      imageUrl: "/images/trash-1.png",
    },
    {
      id: 42,
      name: "trash2.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-40 left-80",
      imageUrl: "/images/trash-2.png",
    },
  ],
};

export const locations = {
  work: WORK_LOCATION,
  about: ABOUT_LOCATION,
  resume: RESUME_LOCATION,
  trash: TRASH_LOCATION,
};

const INITIAL_Z_INDEX = 1000;

const WINDOW_CONFIG = {
  finder: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  contact: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  resume: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  photos: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  txtfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  imgfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  finder: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  contact: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  resume: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  photos: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  txtfile: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
  imgfile: { isOpen: false, isMaximized: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { 
  INITIAL_Z_INDEX, 
  WINDOW_CONFIG,
  navLinks,
  navIcons,
  dockApps,
  blogPosts,
  techStack,
  socials,
  photosLinks,
  gallery
};
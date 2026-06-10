import React, { useState, useEffect } from 'react';
import { 
  AetherProject, 
  AetherElement, 
  Breakpoint, 
  VisualStyle, 
  WorkflowBlock, 
  DatabaseTable, 
  DatabaseRelation, 
  AssetItem 
} from './types';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import WorkflowBuilder from './components/WorkflowBuilder';
import BackendDesigner from './components/BackendDesigner';
import CodeEditor from './components/CodeEditor';
import AssetManager from './components/AssetManager';
import CollaborationRoom from './components/CollaborationRoom';
import AIBuilder from './components/AIBuilder';
import { 
  Layout, 
  Zap, 
  Database, 
  Terminal, 
  FolderOpen, 
  Users, 
  Sparkles, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Download, 
  Undo2, 
  Redo2, 
  PlusCircle, 
  Heading, 
  Type, 
  Square, 
  Image as ImageIcon, 
  SlidersHorizontal, 
  Check, 
  Copy, 
  Play, 
  Info, 
  ChevronRight,
  Sparkle,
  Sun,
  Moon,
  Component,
  Search,
  Compass,
  Activity,
  LayoutGrid
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'workflow' | 'backend' | 'code' | 'assets' | 'collab' | 'ai' | 'components' | 'audits'>('canvas');
  const [activePageId, setActivePageId] = useState<string>('page-1');
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(1);

  // Panel toggles & Fullscreen Zen modes state
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isZenFullscreen, setIsZenFullscreen] = useState(false);

  // Reusable custom components, drag search & shortcuts state
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentDesc, setNewComponentDesc] = useState('');
  const [componentSearch, setComponentSearch] = useState('');

  // Exporter modal triggers
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html' | 'react' | 'docker'>('html');
  const [exportedFiles, setExportedFiles] = useState<Record<string, string>>({});
  const [exporting, setExporting] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aether-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aether-theme', theme);
  }, [theme]);

  // Escape key handler for Zen Fullscreen dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenFullscreen) {
        setIsZenFullscreen(false);
        setShowLeftPanel(true);
        setShowRightPanel(true);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenFullscreen]);

  // Native Fullscreen exit sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isZenFullscreen) {
        setIsZenFullscreen(false);
        setShowLeftPanel(true);
        setShowRightPanel(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isZenFullscreen]);

  const toggleZenFullscreen = () => {
    if (!isZenFullscreen) {
      setIsZenFullscreen(true);
      setShowLeftPanel(false);
      setShowRightPanel(false);
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(() => {
          console.warn("IFrame browser full-screen denied, rendering svelte local Zen simulation");
        });
      }
    } else {
      setIsZenFullscreen(false);
      setShowLeftPanel(true);
      setShowRightPanel(true);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Core Low-code State
  const [project, setProject] = useState<AetherProject>({
    id: "aether-project-1",
    name: "AetherForge Starter Template",
    rootNode: {
      id: "root-node",
      type: "container",
      name: "Viewport Container",
      styles: {
        desktop: {
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#0d0e15",
          paddingTop: "40px",
          paddingBottom: "40px",
          paddingLeft: "40px",
          paddingRight: "40px",
          fontFamily: "Inter"
        }
      },
      attributes: {
        idAttr: "hero-section"
      },
      children: [
        {
          id: "hero-card",
          type: "container",
          name: "Hero Center Showcase Card",
          styles: {
            desktop: {
              maxWidth: "800px",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#161826",
              paddingTop: "48px",
              paddingBottom: "48px",
              paddingLeft: "48px",
              paddingRight: "48px",
              borderRadius: "16px",
              borderWidth: "1px",
              borderColor: "#23263a",
              borderStyle: "solid",
              boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
              textAlign: "center"
            }
          },
          attributes: {},
          children: [
            {
              id: "hero-badge",
              type: "text",
              name: "Welcome Badge Tag",
              styles: {
                desktop: {
                  fontSize: "12px",
                  color: "#818cf8",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "16px",
                  backgroundColor: "rgba(129,140,248,0.1)",
                  paddingTop: "6px",
                  paddingBottom: "6px",
                  paddingLeft: "12px",
                  paddingRight: "12px",
                  borderRadius: "9999px",
                  display: "inline-block"
                }
              },
              attributes: {
                textContent: "✨ Now Available: AetherForge Visual Compiler v1.1"
              },
              children: []
            },
            {
              id: "main-heading",
              type: "heading",
              name: "Bold Hero Heading",
              styles: {
                desktop: {
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#ffffff",
                  marginBottom: "16px",
                  fontFamily: "Space Grotesk"
                }
              },
              attributes: {
                textContent: "Compile Infinite Frontends Visually"
              },
              children: []
            },
            {
              id: "main-subtext",
              type: "text",
              name: "Description Subtitle Text",
              styles: {
                desktop: {
                  fontSize: "14px",
                  color: "#94a3b8",
                  marginBottom: "32px",
                  lineHeight: "1.6"
                }
              },
              attributes: {
                textContent: "Drag beautifully nested visual element grids, wire live conditional trigger workflows in Scratch blocks, map postgres-prisma models visually, and compile offline-ready React or static packages safely in seconds."
              },
              children: []
            },
            {
              id: "action-button",
              type: "button",
              name: "Call to Action Trigger Button",
              styles: {
                desktop: {
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                  borderRadius: "8px",
                  borderWidth: "0px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }
              },
              attributes: {
                idAttr: "btn-cta",
                classAttr: "hover:bg-indigo-500",
                textContent: "Test Interactive Workflow"
              },
              children: []
            }
          ]
        }
      ]
    },
    customComponents: [
      {
        id: "glass-card-template",
        name: "Glassmorphism Card",
        description: "Frosted glass container with subtle light border and soft glow shadow",
        rootElement: {
          id: "glass-card-el-1",
          type: "container",
          name: "Glassmorphic Card Container",
          styles: {
            desktop: {
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(12px)",
              paddingTop: "24px",
              paddingBottom: "24px",
              paddingLeft: "24px",
              paddingRight: "24px",
              borderRadius: "16px",
              borderWidth: "1px",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderStyle: "solid",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              color: "#ffffff"
            }
          },
          attributes: {},
          children: [
            {
              id: "glass-title-1",
              type: "heading",
              name: "Glass Card Title",
              styles: {
                desktop: {
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#ffffff",
                  marginBottom: "8px"
                }
              },
              attributes: { textContent: "Glassmorphism Header" },
              children: []
            },
            {
              id: "glass-desc-1",
              type: "text",
              name: "Glass Card Description",
              styles: {
                desktop: {
                  fontSize: "13px",
                  color: "#94a3b8"
                }
              },
              attributes: { textContent: "This custom component snippet is reusable across slots." },
              children: []
            }
          ]
        }
      },
      {
        id: "neon-btn-template",
        name: "Neon Gradient Button",
        description: "Glowing neon border gradient action button",
        rootElement: {
          id: "neon-btn-el-1",
          type: "button",
          name: "Neon Action Button",
          styles: {
            desktop: {
              backgroundColor: "rgba(79, 70, 229, 0.15)",
              color: "#818cf8",
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "20px",
              paddingRight: "20px",
              borderRadius: "9999px",
              borderWidth: "1px",
              borderColor: "#4f46e5",
              borderStyle: "solid",
              boxShadow: "0 0 15px rgba(79, 70, 229, 0.4)",
              cursor: "pointer",
              fontWeight: "600"
            }
          },
          attributes: { textContent: "Launch System 🚀" },
          children: []
        }
      }
    ],
    databaseSchema: {
      tables: [
        {
          id: "table-tasks",
          name: "ProjectTasks",
          columns: [
            { id: "col-task-id", name: "id", type: "String", isId: true, isRequired: true, isUnique: true },
            { id: "col-task-title", name: "title", type: "String", isId: false, isRequired: true, isUnique: false },
            { id: "col-task-completed", name: "completed", type: "Boolean", isId: false, isRequired: true, isUnique: false, defaultValue: "false" }
          ]
        }
      ],
      relations: []
    },
    workflows: [
      {
        id: "wf-cta-workflow",
        type: "trigger",
        name: "On Click Call-To-Action BTN",
        targetElementId: "action-button",
        nextBlockId: "wf-cta-modify-style"
      },
      {
        id: "wf-cta-modify-style",
        type: "action",
        name: "Set CTA background to purple",
        actionType: "setProperty",
        parentId: "wf-cta-workflow",
        targetElementId: "action-button",
        propertyKey: "backgroundColor",
        propertyValue: "#9333ea"
      }
    ],
    assets: [
      {
        id: "splash-graphic",
        name: "Neon Cosmic Geometry Mesh.webp",
        type: "image",
        size: "148 KB",
        url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
      }
    ],
    plugins: ["Prisma SQLite Connector", "Google Font Engine", "Material Icon Core Pack"]
  });

  // Undo and Redo Memory Buffers
  const [historyStack, setHistoryStack] = useState<AetherElement[]>([project.rootNode]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Pull existing saved files from backend storage if available on startup
  useEffect(() => {
    fetch('/api/project')
      .then(res => res.json())
      .then(savedState => {
        if (savedState && savedState.rootNode) {
          if (!savedState.pages || savedState.pages.length === 0) {
            savedState.pages = [{ id: 'page-1', name: 'Home Page', rootNode: savedState.rootNode }];
          }
          setProject(savedState);
          setHistoryStack([savedState.rootNode]);
          setHistoryIndex(0);
          setActivePageId(savedState.pages[0].id);
        }
      })
      .catch(err => console.log("Starting workspace with initial starter blueprints."));
  }, []);

  // Save changes onto the server storage for full session reliability
  const persistStateOnServer = (updatedProject: AetherProject) => {
    if (updatedProject.pages) {
      const idx = updatedProject.pages.findIndex(p => p.id === activePageId);
      if (idx !== -1) {
        updatedProject.pages[idx].rootNode = JSON.parse(JSON.stringify(updatedProject.rootNode));
      }
    } else {
      updatedProject.pages = [{ id: 'page-1', name: 'Home Page', rootNode: updatedProject.rootNode }];
    }

    fetch('/api/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProject)
    }).catch(err => console.warn("Could not synchronize changes to disk: ", err));
  };

  const selectActivePage = (pageId: string) => {
    if (!project.pages) return;
    const currentPages = [...project.pages];
    const prevIdx = currentPages.findIndex(p => p.id === activePageId);
    if (prevIdx !== -1) {
      currentPages[prevIdx].rootNode = JSON.parse(JSON.stringify(project.rootNode));
    }

    const nextIdx = currentPages.findIndex(p => p.id === pageId);
    if (nextIdx !== -1) {
      const selectedPage = currentPages[nextIdx];
      setActivePageId(pageId);
      const updated = {
        ...project,
        pages: currentPages,
        rootNode: selectedPage.rootNode
      };
      setProject(updated);
      setHistoryStack([selectedPage.rootNode]);
      setHistoryIndex(0);
      
      // Persist onto express storage
      fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      }).catch(err => console.warn(err));
    }
  };

  const createNewPage = (name: string) => {
    const newPageNode: AetherElement = {
      id: `element-${Date.now()}`,
      type: "container",
      name: `${name} Canvas`,
      styles: {
        desktop: {
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#0d0e15",
          paddingTop: "40px",
          paddingBottom: "40px",
          paddingLeft: "40px",
          paddingRight: "40px",
          fontFamily: "Inter"
        }
      },
      attributes: {
        idAttr: `artboard-${Date.now().toString().slice(-4)}`
      },
      children: [
        {
          id: `heading-${Date.now()}`,
          type: "heading",
          name: `${name} Main Heading`,
          styles: {
            desktop: {
              fontSize: "32px",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "16px"
            }
          },
          attributes: {
            textContent: `New Artboard: ${name}`
          },
          children: []
        }
      ]
    };

    const newPageItem = {
      id: `page-${Date.now()}`,
      name: name,
      rootNode: newPageNode
    };

    const updatedPages = [...(project.pages || [{ id: 'page-1', name: 'Home Page', rootNode: project.rootNode }]), newPageItem];
    const updated = {
      ...project,
      pages: updatedPages
    };
    setProject(updated);
    persistStateOnServer(updated);
    setTimeout(() => {
      selectActivePage(newPageItem.id);
    }, 50);
  };

  const deletePage = (pageId: string) => {
    if (!project.pages || project.pages.length <= 1) return;
    const filtered = project.pages.filter(p => p.id !== pageId);
    const nextActiveId = filtered[0].id;

    const updated = {
      ...project,
      pages: filtered,
      rootNode: filtered[0].rootNode
    };
    setProject(updated);
    setActivePageId(nextActiveId);
    setHistoryStack([filtered[0].rootNode]);
    setHistoryIndex(0);
    persistStateOnServer(updated);
  };

  const duplicatePage = (pageId: string) => {
    if (!project.pages) return;
    const target = project.pages.find(p => p.id === pageId);
    if (!target) return;

    const duplicatedNode = JSON.parse(JSON.stringify(target.rootNode));
    duplicatedNode.id = `element-${Date.now()}`;
    
    const newPageItem = {
      id: `page-${Date.now()}`,
      name: `${target.name} Copy`,
      rootNode: duplicatedNode
    };

    const updatedPages = [...project.pages, newPageItem];
    const updated = {
      ...project,
      pages: updatedPages
    };
    setProject(updated);
    persistStateOnServer(updated);
    setTimeout(() => {
      selectActivePage(newPageItem.id);
    }, 50);
  };

  const pushToHistory = (newRoot: AetherElement) => {
    const updatedHistory = historyStack.slice(0, historyIndex + 1);
    const finalized = [...updatedHistory, JSON.parse(JSON.stringify(newRoot))];
    setHistoryStack(finalized);
    setHistoryIndex(finalized.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const revertedRoot = historyStack[prevIdx];
      const updated = { ...project, rootNode: revertedRoot };
      setProject(updated);
      persistStateOnServer(updated);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const restoredRoot = historyStack[nextIdx];
      const updated = { ...project, rootNode: restoredRoot };
      setProject(updated);
      persistStateOnServer(updated);
    }
  };

  // Mutate element custom styles
  const updateElementStyles = (id: string, styles: Partial<VisualStyle>) => {
    const mutateNode = (node: AetherElement): AetherElement => {
      if (node.id === id) {
        const desktopStyles = node.styles.desktop || {};
        const activeBreakpointStyles = node.styles[activeBreakpoint] || {};
        
        return {
          ...node,
          styles: {
            ...node.styles,
            [activeBreakpoint]: {
              ...activeBreakpointStyles,
              ...styles
            }
          }
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(mutateNode) };
      }
      return node;
    };

    const newRoot = mutateNode(project.rootNode);
    const updated = { ...project, rootNode: newRoot };
    setProject(updated);
    pushToHistory(newRoot);
    persistStateOnServer(updated);
  };

  // Mutate element values (Code Editor sync)
  const updateElementCode = (id: string, textContent: string, classAttr: string, idAttr: string) => {
    const mutateNode = (node: AetherElement): AetherElement => {
      if (node.id === id) {
        return {
          ...node,
          attributes: {
            ...node.attributes,
            textContent: textContent,
            classAttr: classAttr,
            idAttr: idAttr
          }
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(mutateNode) };
      }
      return node;
    };

    const newRoot = mutateNode(project.rootNode);
    const updated = { ...project, rootNode: newRoot };
    setProject(updated);
    pushToHistory(newRoot);
    persistStateOnServer(updated);
  };

  // Mutate elements attributes
  const updateElementAttributes = (id: string, attrs: any) => {
    const mutateNode = (node: AetherElement): AetherElement => {
      if (node.id === id) {
        return { ...node, attributes: attrs };
      }
      if (node.children) {
        return { ...node, children: node.children.map(mutateNode) };
      }
      return node;
    };

    const newRoot = mutateNode(project.rootNode);
    const updated = { ...project, rootNode: newRoot };
    setProject(updated);
    pushToHistory(newRoot);
    persistStateOnServer(updated);
  };

  // Append new Visual element node to parent element nested inside
  const addElementToParent = (parentId: string, type: string) => {
    const generateNewElement = (elType: string): AetherElement => {
      const id = `${elType}-${Date.now()}`;
      let textContent = '';
      if (elType === 'heading') textContent = 'Interactive Header Title';
      if (elType === 'text') textContent = 'Paragraph visual block. Drag or style.';
      if (elType === 'button') textContent = 'Action Trigger';

      return {
        id,
        type: elType as any,
        name: `New_${elType}_node`,
        styles: {
          desktop: {
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "16px",
            paddingRight: "16px",
            fontSize: elType === 'heading' ? "24px" : "13px",
            fontWeight: elType === 'heading' ? "600" : "400",
            color: "#ffffff"
          }
        },
        attributes: {
          textContent: textContent
        },
        children: []
      };
    };

    const appendNode = (node: AetherElement): AetherElement => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), generateNewElement(type)]
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(appendNode) };
      }
      return node;
    };

    const newRoot = appendNode(project.rootNode);
    const updated = { ...project, rootNode: newRoot };
    setProject(updated);
    pushToHistory(newRoot);
    persistStateOnServer(updated);
  };

  const deleteElement = (id: string) => {
    const removeNode = (node: AetherElement): AetherElement => {
      return {
        ...node,
        children: (node.children || []).filter(c => c.id !== id).map(removeNode)
      };
    };

    const newRoot = removeNode(project.rootNode);
    const updated = { ...project, rootNode: newRoot };
    setProject(updated);
    pushToHistory(newRoot);
    persistStateOnServer(updated);
  };

  const cloneElementWithNewIds = (element: AetherElement): AetherElement => {
    const freshId = `${element.type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    return {
      ...element,
      id: freshId,
      children: (element.children || []).map(cloneElementWithNewIds)
    };
  };

  const insertCustomComponent = (comp: any) => {
    if (selectedIds.length === 0) {
      alert("Please select a parent container element on the canvas first.");
      return;
    }
    const parentId = selectedIds[0];
    const clonedRoot = cloneElementWithNewIds(comp.rootElement);

    const appendNode = (node: AetherElement): AetherElement => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), clonedRoot]
        };
      }
      if (node.children) {
        return { ...node, children: node.children.map(appendNode) };
      }
      return node;
    };

    const newRoot = appendNode(project.rootNode);
    const updated = { ...project, rootNode: newRoot };
    setProject(updated);
    pushToHistory(newRoot);
    persistStateOnServer(updated);
  };

  const findElementById = (node: AetherElement, id: string): AetherElement | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findElementById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const saveElementAsComponent = (name: string, description: string) => {
    if (selectedIds.length === 0) {
      alert("Please select a canvas element to save first.");
      return;
    }
    const targetElement = findElementById(project.rootNode, selectedIds[0]);
    if (!targetElement) {
      alert("Selected element not found in tree.");
      return;
    }

    const newComponent = {
      id: `saved-comp-${Date.now()}`,
      name: name || `Saved_${targetElement.type}`,
      description: description || `Reusable ${targetElement.name} snippet`,
      rootElement: JSON.parse(JSON.stringify(targetElement))
    };

    const updatedComponents = [...(project.customComponents || []), newComponent];
    const updated = { ...project, customComponents: updatedComponents };
    setProject(updated);
    persistStateOnServer(updated);
  };

  // Global Application Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Ctrl+Z & Cmd+Z for UNDO
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl+Y & Cmd+Y for REDO
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Delete key and Backspace for node deletion
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          selectedIds.forEach(id => {
            if (id !== 'root-node') {
              deleteElement(id);
            }
          });
          setSelectedIds([]);
        }
      }

      // Escape key to deselect active items
      if (e.key === 'Escape') {
        setSelectedIds([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, historyIndex, historyStack, project]);

  // Exporter compilation trigger contacting backend
  const handleCompileExport = async () => {
    setExporting(true);
    setExportedFiles({});
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: exportFormat,
          project: project
        })
      });
      const data = await res.json();
      if (data.success && data.files) {
        setExportedFiles(data.files);
        setShowExportModal(true);
      } else {
        alert("Compiler returned empty. Ensure Visual elements are declared.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed compiling target repository.");
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = (fileName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  // Callback mapping for AI visual tree returned from Gemini
  const handleAILayoutReceived = (newNodeElement: AetherElement) => {
    const updatedRoot = {
      ...project.rootNode,
      children: [...project.rootNode.children, newNodeElement]
    };
    const updated = { ...project, rootNode: updatedRoot };
    setProject(updated);
    pushToHistory(updatedRoot);
    persistStateOnServer(updated);
    setActiveTab('canvas');
  };

  const activeSelectedElement = selectedIds.length > 0 
    ? (() => {
        const find = (node: AetherElement): AetherElement | null => {
          if (node.id === selectedIds[0]) return node;
          if (node.children) {
            for (let c of node.children) {
              const res = find(c);
              if (res) return res;
            }
          }
          return null;
        };
        return find(project.rootNode);
      })()
    : null;

  return (
    <div className="h-screen w-screen bg-slate-50 dark:bg-[#08090d] text-slate-800 dark:text-slate-100 flex flex-col overflow-hidden font-sans transition-colors duration-200">
      
      {/* Top Header Deck */}
      <header className="bg-white dark:bg-[#0d0e16] border-b border-slate-200/80 dark:border-white/5 py-3 px-6 flex items-center justify-between z-30 select-none transition-colors duration-200 shadow-sm shadow-slate-100/10">
        
        {/* Brand visual tags */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkle className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-950 dark:text-white tracking-widest uppercase font-sans">AetherForge</h1>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-mono">STANDALONE COMPILER PLATFORM</span>
          </div>
        </div>

        {/* Viewports & Breakpoints Selection Bar */}
        {activeTab === 'canvas' && (
          <div className="flex items-center gap-4">
            {/* Breakpoints */}
            <div className="flex items-center rounded-lg overflow-hidden bg-slate-100 dark:bg-[#121422] border border-slate-200/60 dark:border-white/5 p-1 space-x-1">
              <button 
                onClick={() => setActiveBreakpoint('desktop')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  activeBreakpoint === 'desktop' ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Desktop"
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button 
                onClick={() => setActiveBreakpoint('tablet')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  activeBreakpoint === 'tablet' ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Tablet"
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button 
                onClick={() => setActiveBreakpoint('mobile')}
                className={`px-3 py-1.5 rounded flex items-center gap-1.5 text-xs font-semibold transition-all ${
                  activeBreakpoint === 'mobile' ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>

            {/* Side-Panel Viewport Collapse & Fullscreen controls */}
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-[#121422] border border-slate-200/60 dark:border-white/5 p-1 space-x-1">
              <button 
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all select-none cursor-pointer ${
                  showLeftPanel 
                    ? 'bg-white dark:bg-[#1d1f30] text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' 
                    : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500'
                }`}
                title={showLeftPanel ? "Hide side panels" : "Show side panels"}
              >
                {showLeftPanel ? "◀ Hide Sidebar" : "▶ Sidebar"}
              </button>
              <button 
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all select-none cursor-pointer ${
                  showRightPanel 
                    ? 'bg-white dark:bg-[#1d1f30] text-indigo-600 dark:text-indigo-400 font-bold shadow-sm' 
                    : 'hover:bg-slate-200/50 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500'
                }`}
                title={showRightPanel ? "Hide properties" : "Show properties"}
              >
                {showRightPanel ? "Hide Properties ▶" : "Properties ◀"}
              </button>
              <button 
                onClick={toggleZenFullscreen}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all select-none cursor-pointer flex items-center gap-1 ${
                  isZenFullscreen 
                    ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                }`}
                title="Enter deep focus visual alignment canvas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                {isZenFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </div>
          </div>
        )}

        {/* Global Controls, Undo, Redo, Theme switch, Compile triggers */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 p-2 rounded-lg transition text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleRedo}
            disabled={historyIndex >= historyStack.length - 1}
            className="hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 p-2 rounded-lg transition text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Theme switcher */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-[#141624] dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/5 transition duration-200 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Static code compile exporter dialog trigger */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200/85 dark:border-white/10 bg-slate-50 dark:bg-[#141624] shadow-sm">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="bg-transparent border-none text-xs px-2.5 py-1.5 text-slate-600 dark:text-slate-300 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 font-sans"
            >
              <option value="html" className="bg-white dark:bg-[#141624] text-slate-800 dark:text-slate-200">Single index.html</option>
              <option value="react" className="bg-white dark:bg-[#141624] text-slate-800 dark:text-slate-200">React + Vite bundle</option>
              <option value="docker" className="bg-white dark:bg-[#141624] text-slate-800 dark:text-slate-200">Docker Backend models</option>
            </select>
            <button
              onClick={handleCompileExport}
              disabled={exporting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-1.5 flex items-center gap-1.5 transition duration-200 whitespace-nowrap shadow-sm shadow-indigo-500/20"
            >
              <Download className="w-3.5 h-3.5" /> {exporting ? "Compiling..." : "Deploy / Export"}
            </button>
          </div>
        </div>

      </header>

      {/* Primary Workspace container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LHS Sidebar Selector */}
        {showLeftPanel && (
          <nav className="w-16 bg-white dark:bg-[#0d0e16] border-r border-slate-200/80 dark:border-white/5 flex flex-col items-center py-6 justify-between select-none transition-colors duration-200">
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setActiveTab('canvas')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'canvas' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visual Canvas"
              >
                <Layout className="w-5 h-5 font-medium" />
              </button>

              <button 
                onClick={() => setActiveTab('components')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'components' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Reusable Components Inventory"
              >
                <Component className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('workflow')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'workflow' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Logic scratch workflows"
              >
                <Zap className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('backend')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'backend' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visual relations builder"
              >
                <Database className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('code')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'code' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Custom monaco code"
              >
                <Terminal className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('assets')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'assets' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Visual asset inventory"
              >
                <FolderOpen className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('collab')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'collab' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Presence and logs"
              >
                <Users className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setActiveTab('audits')}
                className={`p-3 rounded-xl flex flex-col justify-center items-center gap-1 transition-all duration-200 ${
                  activeTab === 'audits' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="SEO & Design Audit Tools"
              >
                <Compass className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`p-3 rounded-full flex justify-center items-center gap-1 transition-all hover:scale-105 border ${
                  activeTab === 'ai' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-600/20'
                }`}
                title="Gemini AI Assistance compiler"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </nav>
        )}

        {/* Central Workspace Canvas panel */}
        <main className="flex-1 overflow-hidden relative flex bg-slate-100/80 dark:bg-[#07080d] transition-colors duration-200">
          
          {/* Active Canvas Layout Sidebar Element Drawer */}
          {showLeftPanel && activeTab === 'canvas' && (
            <div className="w-60 bg-white dark:bg-[#0c0e16] border-r border-slate-200 dark:border-white/5 p-4 flex flex-col justify-between select-none transition-colors duration-200 overflow-y-auto">
              <div className="space-y-4">
                {/* Visual Artboard Art Pages list */}
                <div className="bg-slate-50 dark:bg-black/35 p-3 rounded-xl border border-slate-200/40 dark:border-white/[0.05] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Pages ({project.pages?.length || 1})</span>
                    <button 
                      onClick={() => {
                        const name = prompt("Name your new artboard page:", `Page ${Date.now().toString().slice(-3)}`);
                        if (name) createNewPage(name);
                      }}
                      className="text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded font-sans transition-all cursor-pointer font-bold"
                    >
                      + Add Page
                    </button>
                  </div>
                  
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {(project.pages || [{ id: 'page-1', name: 'Home Page', rootNode: project.rootNode }]).map((p) => {
                      const isActive = p.id === activePageId;
                      return (
                        <div 
                          key={p.id} 
                          className={`flex items-center justify-between p-2 rounded-lg text-[11px] transition cursor-pointer select-none ${
                            isActive 
                              ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                              : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                          onClick={() => selectActivePage(p.id)}
                        >
                          <span className="truncate max-w-[110px]" title={p.name}>📄 {p.name}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicatePage(p.id);
                              }} 
                              className="text-[10px] hover:scale-110 opacity-75 hover:opacity-100 px-0.5 transition"
                              title="Duplicate Page"
                            >
                              📋
                            </button>
                            {project.pages && project.pages.length > 1 && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete page "${p.name}" permanently?`)) {
                                    deletePage(p.id);
                                  }
                                }} 
                                className="text-[10px] hover:scale-110 opacity-75 hover:opacity-100 px-0.5 hover:text-rose-500 transition"
                                title="Delete Page"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block pb-1 border-b border-slate-200 dark:border-white/5">Visual Element drawer</span>
                
                {/* Modern search bar container */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={componentSearch}
                    onChange={(e) => setComponentSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-900 dark:text-white pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans placeholder:text-slate-450"
                  />
                  {componentSearch && (
                    <button onClick={() => setComponentSearch('')} className="absolute right-2 px-1 top-2 text-[10px] text-slate-400 hover:text-slate-900 dark:hover:text-white font-sans font-bold uppercase transition">✕</button>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="block text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Core Blocks</span>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium font-sans">
                    {/* Container matches: block, box, div, flex, grid, wrapper */}
                    {('container'.includes(componentSearch.toLowerCase()) || ['block', 'box', 'container', 'wrapper', 'div', 'flex', 'grid'].some(k => k.includes(componentSearch.toLowerCase()))) && (
                      <button 
                        onClick={() => {
                          if (selectedIds.length > 0) addElementToParent(selectedIds[0], 'container');
                          else alert('Select an active parent element folder first.');
                        }}
                        className="bg-slate-50 hover:bg-slate-100 dark:bg-[#161826] dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <Square className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Container
                      </button>
                    )}

                    {/* Heading matches: title, header, h1, h2 */}
                    {('heading'.includes(componentSearch.toLowerCase()) || ['heading', 'title', 'header', 'h1', 'h2', 'sub'].some(k => k.includes(componentSearch.toLowerCase()))) && (
                      <button 
                        onClick={() => {
                          if (selectedIds.length > 0) addElementToParent(selectedIds[0], 'heading');
                          else alert('Select an active parent element folder first.');
                        }}
                        className="bg-slate-50 hover:bg-slate-100 dark:bg-[#161826] dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <Heading className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Heading
                      </button>
                    )}

                    {/* Text matches: text, p, paragraph, body, span, label */}
                    {('paragraph'.includes(componentSearch.toLowerCase()) || ['paragraph', 'text', 'p', 'body', 'span', 'label'].some(k => k.includes(componentSearch.toLowerCase()))) && (
                      <button 
                        onClick={() => {
                          if (selectedIds.length > 0) addElementToParent(selectedIds[0], 'text');
                          else alert('Select an active parent element folder first.');
                        }}
                        className="bg-slate-50 hover:bg-slate-100 dark:bg-[#161826] dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <Type className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Paragraph
                      </button>
                    )}

                    {/* Trigger matches: button, trigger, cta, click, action, play */}
                    {('trigger'.includes(componentSearch.toLowerCase()) || ['button', 'trigger', 'cta', 'click', 'action', 'play'].some(k => k.includes(componentSearch.toLowerCase()))) && (
                      <button 
                        onClick={() => {
                          if (selectedIds.length > 0) addElementToParent(selectedIds[0], 'button');
                          else alert('Select an active parent element first.');
                        }}
                        className="bg-slate-50 hover:bg-slate-100 dark:bg-[#161826] dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <Play className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Trigger
                      </button>
                    )}

                    {/* Image matches: image, photo, picture, graphic, media, img */}
                    {('image'.includes(componentSearch.toLowerCase()) || ['image', 'photo', 'picture', 'graphic', 'media', 'img'].some(k => k.includes(componentSearch.toLowerCase()))) && (
                      <button 
                        onClick={() => {
                          if (selectedIds.length > 0) addElementToParent(selectedIds[0], 'image');
                          else alert('Select an active parent element first.');
                        }}
                        className="bg-slate-50 hover:bg-slate-100 dark:bg-[#161826] dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <ImageIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Image
                      </button>
                    )}

                    {/* Input matches: input, textbox, field, form, entry */}
                    {('input'.includes(componentSearch.toLowerCase()) || ['input', 'textbox', 'field', 'form', 'entry'].some(k => k.includes(componentSearch.toLowerCase()))) && (
                      <button 
                        onClick={() => {
                          if (selectedIds.length > 0) addElementToParent(selectedIds[0], 'input');
                          else alert('Select an active parent element first.');
                        }}
                        className="bg-slate-50 hover:bg-slate-100 dark:bg-[#161826] dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 p-2 rounded-lg flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer font-sans shadow-sm"
                      >
                        <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Input
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/5 rounded-lg border border-indigo-100 dark:border-indigo-500/10 space-y-1.5 text-xs text-slate-655 dark:text-slate-400 leading-normal">
                  <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                    <Info className="w-3.5 h-3.5" />
                    <span>How to proceed</span>
                  </div>
                  <span>Click an element directly on the canvas to configure margins, padding, text alignments, borders or custom actions.</span>
                </div>
              </div>

              {/* Plugin overview catalog list */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Active npm plugins (3)</span>
                {project.plugins.map(p => (
                  <div key={p} className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] p-1.5 rounded border border-slate-200/50 dark:border-transparent">
                    <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> {p}
                  </div>
                ))}
              </div>
            </div>
          )}


          {showLeftPanel && activeTab === 'components' && (
            <div className="w-60 bg-white dark:bg-[#0c0e16] border-r border-[#e2e8f0] dark:border-white/5 p-4 flex flex-col justify-between select-none transition-colors duration-200 overflow-y-auto">
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block pb-1 border-b border-[#e2e8f0] dark:border-white/5">Reusable Snippets</span>

                {/* Save Selected Element Form */}
                <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-[#e2e8f0] dark:border-white/5 space-y-3">
                  <span className="block text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Save Active Element</span>
                  {selectedIds.length === 0 ? (
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block leading-relaxed">
                      Select any element subtree on the canvas, then save it here as a reusable visual wrapper.
                    </span>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Snippet Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Hero Section, CTA Card"
                          value={newComponentName}
                          onChange={(e) => setNewComponentName(e.target.value)}
                          className="w-full bg-white dark:bg-[#121422] text-xs text-slate-900 dark:text-white px-2 py-1.5 rounded border border-[#cbd5e1] dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                        <input
                          type="text"
                          placeholder="Short usage notes..."
                          value={newComponentDesc}
                          onChange={(e) => setNewComponentDesc(e.target.value)}
                          className="w-full bg-white dark:bg-[#121422] text-xs text-slate-900 dark:text-white px-2 py-1.5 rounded border border-[#cbd5e1] dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => {
                          saveElementAsComponent(newComponentName, newComponentDesc);
                          setNewComponentName('');
                          setNewComponentDesc('');
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-650 dark:hover:bg-indigo-600 text-white font-semibold text-xs py-1.5 rounded transition duration-150 cursor-pointer text-center block shadow-sm border border-transparent dark:border-white/5"
                      >
                        Capture Subtree Snippet
                      </button>
                    </div>
                  )}
                </div>

                {/* Visual Listing */}
                <div className="space-y-2.5">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">Component Inventory ({project.customComponents?.length || 0})</span>
                  <div className="space-y-2">
                    {project.customComponents?.map((comp) => (
                      <div 
                        key={comp.id} 
                        className="p-2.5 bg-slate-50 dark:bg-[#161826] rounded-lg border border-[#e2e8f0] dark:border-white/5 space-y-1 hover:border-slate-350 dark:hover:border-indigo-500/30 transition-all group shadow-sm"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">{comp.name}</span>
                          <span className="text-[8px] font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-[#a5b4fc] px-1.5 py-0.5 rounded">
                            {comp.rootElement.type}
                          </span>
                        </div>
                        {comp.description && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">{comp.description}</span>
                        )}
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              if (selectedIds.length === 0) {
                                alert("Please select a parent container element on the canvas first.");
                                return;
                              }
                              insertCustomComponent(comp);
                            }}
                            className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2 py-1.5 rounded transition duration-150 cursor-pointer text-center"
                          >
                            Insert into Selected
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips block */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/5 rounded-lg border border-indigo-100 dark:border-indigo-500/10 text-xs text-slate-500 dark:text-slate-400 mt-5 leading-relaxed font-sans">
                <span className="block text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Quick Shortcuts
                </span>
                <span>Press <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">Delete</code> to remove selected items; <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">Ctrl+Z</code> to undo.</span>
              </div>
            </div>
          )}


          {showLeftPanel && activeTab === 'audits' && (() => {
            // Recursive visual node analyzer
            let hasH1 = false;
            let missingAltsCount = 0;
            let buttonDescriptiveFailStr = 0;
            let totalNodesCount = 0;
            const colorsList: string[] = [];

            const traverse = (node: AetherElement) => {
              totalNodesCount++;
              if (node.type === 'heading') {
                const sizeStr = node.styles?.desktop?.fontSize || '';
                const sizeNum = parseInt(sizeStr);
                if (sizeNum >= 28 || node.attributes.textContent?.toLowerCase().includes('welcome') || !hasH1) {
                  hasH1 = true;
                }
              }
              if (node.type === 'image') {
                if (!node.attributes.src || !node.attributes.textContent) {
                  missingAltsCount++;
                }
              }
              if (node.type === 'button') {
                const text = node.attributes.textContent || '';
                if (text.length < 3 || ['click', 'btn', 'submit'].includes(text.toLowerCase().trim())) {
                  buttonDescriptiveFailStr++;
                }
              }
              if (node.styles?.desktop?.color && !colorsList.includes(node.styles.desktop.color)) {
                colorsList.push(node.styles.desktop.color);
              }
              if (node.styles?.desktop?.backgroundColor && !colorsList.includes(node.styles.desktop.backgroundColor)) {
                colorsList.push(node.styles.desktop.backgroundColor);
              }
              if (node.children) {
                node.children.forEach(traverse);
              }
            };

            traverse(project.rootNode);

            // Calculate score
            let score = 100;
            if (!hasH1) score -= 30;
            score -= missingAltsCount * 15;
            score -= buttonDescriptiveFailStr * 10;
            score = Math.max(10, score);

            // Generate standard CSS Variables code block
            let cssVars = `:root {\n`;
            colorsList.filter(c => c.startsWith('#')).forEach((c, idx) => {
              cssVars += `  --color-asset-${idx + 1}: ${c};\n`;
            });
            cssVars += `  --primary-font: 'Inter', sans-serif;\n  --radius-factor: 12px;\n}`;

            return (
              <div className="w-60 bg-white dark:bg-[#0c0e16] border-r border-[#e2e8f0] dark:border-white/5 p-4 flex flex-col justify-between select-none transition-colors duration-200 overflow-y-auto font-sans">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 block pb-1 border-b border-[#e2e8f0] dark:border-white/5">SEO & UX Auditor</span>

                  {/* Circular visual Dial score */}
                  <div className="bg-slate-50 dark:bg-black/35 p-4 rounded-xl border border-slate-200/40 dark:border-white/[0.05] text-center space-y-2">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">SEO Health Index</span>
                    <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 select-none">
                      {score}%
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                      score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' 
                        : score >= 50 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-450' 
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-450'
                    }`}>
                      {score >= 80 ? 'EXCELLENT' : score >= 50 ? 'NEEDS REVIEW' : 'CRITICAL'}
                    </span>
                  </div>

                  {/* Check list visual markers */}
                  <div className="space-y-2">
                    <span className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Compliance Checklist</span>
                    
                    <div className="flex gap-2 items-start text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-[#121422] border border-slate-100 dark:border-white/[0.02]">
                      <span className="text-base">{hasH1 ? '✅' : '❌'}</span>
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white">Structured Heading</span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Requires at least one size-accented H1 tag structure.</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-[#121422] border border-slate-100 dark:border-white/[0.02]">
                      <span className="text-base">{missingAltsCount === 0 ? '✅' : '⚠️'}</span>
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white">Alt Label Tagging</span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Found {missingAltsCount} media assets missing labels.</span>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start text-xs rounded-xl p-2.5 bg-slate-50 dark:bg-[#121422] border border-slate-100 dark:border-white/[0.02]">
                      <span className="text-base">{buttonDescriptiveFailStr === 0 ? '✅' : '⚠️'}</span>
                      <div>
                        <span className="font-bold block text-slate-800 dark:text-white">Descriptive CTAs</span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Found {buttonDescriptiveFailStr} ambiguous actions.</span>
                      </div>
                    </div>
                  </div>

                  {/* CSS Extraction tool */}
                  <div className="bg-slate-50 dark:bg-black/30 p-3 rounded-xl border border-slate-200/40 dark:border-white/[0.05] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Extract CSS Tokens</span>
                      <button 
                        onClick={() => {
                          copyToClipboard("theme-variables.css", cssVars);
                          alert("Exported bundle variable tokens copied to clipboard!");
                        }}
                        className="text-[9px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-semibold transition cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-[8px] bg-slate-950 dark:bg-black/80 p-2 rounded text-[#a5b4fc] font-mono leading-tight max-h-24 overflow-y-auto">
                      {cssVars}
                    </pre>
                  </div>
                </div>

                <div className="p-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/5 border border-indigo-150 dark:border-indigo-500/10 text-[10px] text-slate-500 dark:text-slate-450 rounded-lg">
                  💡 <b>Audit Tip:</b> Extracted layout CSS tokens can be mapped directly into other tailwind setups.
                </div>
              </div>
            );
          })()}

          {/* Conditional Sub-View routing based on active tab Selection flag */}
          {(activeTab === 'canvas' || activeTab === 'components' || activeTab === 'audits') && (
            <Canvas 
              rootNode={project.rootNode}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
              updateElementStyles={updateElementStyles}
              deleteElement={deleteElement}
              activeBreakpoint={activeBreakpoint}
              setActiveBreakpoint={setActiveBreakpoint}
              canvasZoom={canvasZoom}
              setCanvasZoom={setCanvasZoom}
              addElementToParent={addElementToParent}
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowBuilder 
              workflows={project.workflows}
              setWorkflows={(w) => setProject({ ...project, workflows: w })}
              rootNode={project.rootNode}
            />
          )}

          {activeTab === 'backend' && (
            <BackendDesigner 
              tables={project.databaseSchema.tables}
              setTables={(t) => setProject({ ...project, databaseSchema: { ...project.databaseSchema, tables: t } })}
              relations={project.databaseSchema.relations}
              setRelations={(r) => setProject({ ...project, databaseSchema: { ...project.databaseSchema, relations: r } })}
            />
          )}

          {activeTab === 'code' && (
            <CodeEditor 
              selectedElement={activeSelectedElement}
              updateElementCode={updateElementCode}
            />
          )}

          {activeTab === 'assets' && (
            <AssetManager 
              assets={project.assets}
              setAssets={(a) => setProject({ ...project, assets: a })}
            />
          )}

          {activeTab === 'collab' && (
            <CollaborationRoom />
          )}

          {activeTab === 'ai' && (
            <AIBuilder 
              onAILayoutReceived={handleAILayoutReceived}
            />
          )}

          {/* Inspector Panel style selector shown solely on main Canvas tab or Code tab */}
          {showRightPanel && activeTab === 'canvas' && (
            <PropertyPanel 
              selectedElement={activeSelectedElement}
              activeBreakpoint={activeBreakpoint}
              updateElementStyles={updateElementStyles}
              updateElementAttributes={updateElementAttributes}
            />
          )}

        </main>
      </div>

      {/* Code Export Output Dialog Modal Popover overlay */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 select-none animate-fade-in font-sans">
          <div className="bg-[#121421] border border-white/5 rounded-xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-[#161828] px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AetherForge Compiler bundle results</h3>
                <span className="text-[10px] text-slate-500 block font-mono">EXPORT: {exportFormat.toUpperCase()} TARGET PACKAGE</span>
              </div>
              <button 
                onClick={() => setShowExportModal(false)}
                className="bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded text-xs transition text-white"
              >
                Close sandbox
              </button>
            </div>

            {/* Modal Body grids (Explorer column left, preview text area right) */}
            <div className="flex-1 flex overflow-hidden font-mono">
              
              {/* Files Map selector */}
              <div className="w-64 bg-black/10 border-r border-[#ffffff0d] p-4 overflow-y-auto space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-2">Compiled Package files</span>
                {Object.keys(exportedFiles).map(fileName => (
                  <div 
                    key={fileName}
                    className="p-2 rounded bg-white/[0.02] text-xs flex items-center justify-between hover:bg-white/5 text-slate-300"
                  >
                    <span className="truncate max-w-[140px] text-[11px]">{fileName}</span>
                    <button 
                      onClick={() => copyToClipboard(fileName, exportedFiles[fileName])}
                      className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedFile === fileName ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} 
                      {copiedFile === fileName ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Text rendering view */}
              <div className="flex-1 bg-slate-950 p-6 overflow-auto flex flex-col">
                {Object.keys(exportedFiles).length > 0 ? (
                  (() => {
                    const firstFile = Object.keys(exportedFiles)[0];
                    return (
                      <pre className="flex-1 text-[11px] font-mono whitespace-pre text-emerald-400 leading-normal scrollbar-thin">
                        {exportedFiles[firstFile]}
                      </pre>
                    );
                  })()
                ) : (
                  <p className="text-slate-500 text-xs italic">Empty compilation bundle list.</p>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

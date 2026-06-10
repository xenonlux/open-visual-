import React, { useState, useRef, useEffect } from 'react';
import { AetherElement, Breakpoint, VisualStyle } from '../types';
import { ZoomIn, ZoomOut, Maximize, Move, Touchpad, Copy, Trash, Plus, Eye, EyeOff, LayoutGrid } from 'lucide-react';

interface CanvasProps {
  rootNode: AetherElement;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  updateElementStyles: (id: string, styles: Partial<VisualStyle>) => void;
  deleteElement: (id: string) => void;
  activeBreakpoint: Breakpoint;
  setActiveBreakpoint: (bp: Breakpoint) => void;
  canvasZoom: number;
  setCanvasZoom: (z: number) => void;
  addElementToParent: (parentId: string, type: string) => void;
}

export default function Canvas({
  rootNode,
  selectedIds,
  setSelectedIds,
  hoveredId,
  setHoveredId,
  updateElementStyles,
  deleteElement,
  activeBreakpoint,
  setActiveBreakpoint,
  canvasZoom,
  setCanvasZoom,
  addElementToParent,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [gridOverlayEnabled, setGridOverlayEnabled] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom Canvas Width and Live Resizing State
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeSide, setResizeSide] = useState<'left' | 'right' | null>(null);

  const resizeStartXRef = useRef(0);
  const resizeStartWidthRef = useRef(1200);

  // Sync canvasWidth with manual breakpoint selection
  useEffect(() => {
    if (!isResizing) {
      if (activeBreakpoint === 'desktop') {
        setCanvasWidth(1200);
      } else if (activeBreakpoint === 'tablet') {
        setCanvasWidth(768);
      } else if (activeBreakpoint === 'mobile') {
        setCanvasWidth(375);
      }
    }
  }, [activeBreakpoint, isResizing]);

  // Handle Drag Resizing logic
  const handleResizeMouseDown = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeSide(side);
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = canvasWidth;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeSide) return;
      const deltaX = (e.clientX - resizeStartXRef.current) / canvasZoom;
      // Symmetric dragging because artboard is center-aligned
      const widthFactor = resizeSide === 'right' ? deltaX * 2 : -deltaX * 2;
      const newWidth = Math.min(1600, Math.max(320, resizeStartWidthRef.current + widthFactor));
      setCanvasWidth(Math.round(newWidth));

      // Coordinate responsive active breakpoint
      if (newWidth >= 1024) {
        if (activeBreakpoint !== 'desktop') {
          setActiveBreakpoint('desktop');
        }
      } else if (newWidth >= 768) {
        if (activeBreakpoint !== 'tablet') {
          setActiveBreakpoint('tablet');
        }
      } else {
        if (activeBreakpoint !== 'mobile') {
          setActiveBreakpoint('mobile');
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeSide(null);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeSide, canvasZoom, activeBreakpoint, setActiveBreakpoint]);

  // Get active style based on current breakpoint hierarchy (Desktop -> Tablet -> Mobile)
  const getActiveStyle = (el: AetherElement): VisualStyle => {
    const desktopStyle = el.styles.desktop || {};
    const tabletStyle = el.styles.tablet || {};
    const mobileStyle = el.styles.mobile || {};

    if (activeBreakpoint === 'mobile') {
      return { ...desktopStyle, ...tabletStyle, ...mobileStyle };
    } else if (activeBreakpoint === 'tablet') {
      return { ...desktopStyle, ...tabletStyle };
    }
    return desktopStyle;
  };

  // Canvas Panning Operations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Current coordinate calculation relative to staging wrapper
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const relativeX = Math.round((e.clientX - rect.left - panOffset.x - rect.width / 2) / canvasZoom);
      const relativeY = Math.round((e.clientY - rect.top - panOffset.y - 120) / canvasZoom);
      setMousePos({ x: relativeX, y: relativeY });
    }
    if (isPanning) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Reset Canvas Zoom and Coordinates
  const resetZoomPan = () => {
    setCanvasZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Inline styling compiler translating VisualStyle properties to React.CSSProperties
  const compileStyle = (styles: VisualStyle): React.CSSProperties => {
    const isHiddenInDesigner = styles.display === 'none';
    return {
      display: isHiddenInDesigner ? 'block' : styles.display,
      flexDirection: styles.flexDirection,
      justifyContent: styles.justifyContent,
      alignItems: styles.alignItems,
      gridTemplateColumns: styles.gridTemplateColumns,
      gap: styles.gridGap,
      position: styles.position,
      top: styles.top,
      left: styles.left,
      right: styles.right,
      bottom: styles.bottom,
      width: styles.width || '100%',
      height: styles.height,
      minWidth: styles.minWidth,
      minHeight: styles.minHeight,
      maxWidth: styles.maxWidth,
      maxHeight: styles.maxHeight,
      marginTop: styles.marginTop,
      marginRight: styles.marginRight,
      marginBottom: styles.marginBottom,
      marginLeft: styles.marginLeft,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      textAlign: styles.textAlign,
      fontFamily: styles.fontFamily,
      borderRadius: styles.borderRadius,
      borderWidth: styles.borderWidth,
      borderColor: styles.borderColor,
      borderStyle: styles.borderStyle,
      boxShadow: styles.boxShadow,
      opacity: isHiddenInDesigner ? 0.35 : styles.opacity,
      transform: styles.transform,
      transition: styles.transition,
      overflow: styles.overflow,
      order: styles.order,
      flexGrow: styles.flexGrow,
      flexShrink: styles.flexShrink,
      zIndex: styles.zIndex,
    };
  };

  // Recursive Element Renderer
  const renderElement = (el: AetherElement): React.ReactNode => {
    const activeStyle = getActiveStyle(el);
    const reactStyle = compileStyle(activeStyle);
    const attrs = el.attributes;
    const isSelected = selectedIds.includes(el.id);
    const isHovered = hoveredId === el.id;
    const isHiddenInDesigner = activeStyle.display === 'none';
    const isGridMode = activeStyle.display === 'grid' && gridOverlayEnabled;

    const elementProps = {
      id: attrs.idAttr || `canvas-el-${el.id}`,
      className: `relative transition-all ${attrs.classAttr || ''} ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : ''
      } ${isHovered && !isSelected ? 'outline-2 outline-dashed outline-sky-400 z-10' : ''} ${
        isGridMode ? 'ring-1 ring-purple-500/30 bg-purple-500/[0.02]/30 border border-dashed border-purple-500/40 text-[#ffffff]' : ''
      } ${
        isHiddenInDesigner ? 'border-2 border-dashed border-rose-500/50' : ''
      }`,
      style: reactStyle,
      onMouseDown: (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.button === 0) {
          if (e.shiftKey) {
            setSelectedIds([...selectedIds, el.id]);
          } else {
            setSelectedIds([el.id]);
          }
        }
      },
      onMouseEnter: (e: React.MouseEvent) => {
        e.stopPropagation();
        setHoveredId(el.id);
      },
      onMouseLeave: () => {
        setHoveredId(null);
      }
    };

    // Submenu Actions overlays for selected canvas items
    const ActionOverlays = () => {
      if (!isSelected) return null;
      return (
        <div 
          className="absolute -top-7 right-0 flex items-center gap-1 bg-blue-600 text-white text-[10px] px-2 py-1 rounded shadow-md z-30 font-medium"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="uppercase tracking-wide">{el.type}</span>
          <button 
            onClick={() => addElementToParent(el.id, 'container')} 
            title="Add Child Div container"
            className="hover:bg-blue-700 p-0.5 rounded ml-1 transition"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button 
            onClick={() => {
              const nextDisp = activeStyle.display === 'none' ? '' : 'none';
              updateElementStyles(el.id, { display: nextDisp as any });
            }} 
            title={activeStyle.display === 'none' ? "Unhide element" : "Hide element"}
            className="hover:bg-blue-700 p-0.5 rounded transition"
          >
            {activeStyle.display === 'none' ? <Eye className="w-3 h-3 text-amber-300" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button 
            onClick={() => {
              if (confirm("Delete this visual element?")) {
                deleteElement(el.id);
                setSelectedIds([]);
              }
            }} 
            title="Delete node"
            className="hover:bg-blue-700 p-0.5 rounded transition"
          >
            <Trash className="w-3 h-3" />
          </button>
        </div>
      );
    };

    // Resize Handles
    const SelectionHandles = () => {
      if (!isSelected) return null;
      return (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 bg-blue-600 rounded-full border border-white -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer pointer-events-auto" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full border border-white translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer pointer-events-auto" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-blue-600 rounded-full border border-white -translate-x-1/2 translate-y-1/2 z-30 cursor-pointer pointer-events-auto" />
          <div 
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-600 hover:bg-blue-500 active:scale-125 rounded-full border-2 border-white translate-x-1/2 translate-y-1/2 z-40 cursor-se-resize shadow-md transition-transform pointer-events-auto flex items-center justify-center"
            title="Drag bottom-right corner to resize Width & Height"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              const startX = e.clientX;
              const startY = e.clientY;
              const targetEl = document.getElementById(attrs.idAttr || `canvas-el-${el.id}`);
              if (!targetEl) return;
              const rect = targetEl.getBoundingClientRect();
              const startWidth = rect.width;
              const startHeight = rect.height;

              const onMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;
                const scaledDeltaX = deltaX / canvasZoom;
                const scaledDeltaY = deltaY / canvasZoom;
                
                updateElementStyles(el.id, {
                  width: `${Math.round(Math.max(40, startWidth + scaledDeltaX))}px`,
                  height: `${Math.round(Math.max(20, startHeight + scaledDeltaY))}px`
                });
              };

              const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
              };

              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);
            }}
          />
          {/* Top rep-handle banner */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-650 text-white p-0.5 rounded shadow cursor-grab active:cursor-grabbing z-30 flex items-center">
            <Move className="w-2.5 h-2.5" />
          </div>
        </>
      );
    };

    // Interactive on-element grid track and gap settings overlay
    const GridControlsOverlay = () => {
      if (activeStyle.display !== 'grid' || !isSelected) return null;
      const colsText = activeStyle.gridTemplateColumns || 'repeat(3, 1fr)';
      const match = colsText.match(/repeat\((\d+),\s*1fr\)/);
      const colCount = match ? parseInt(match[1]) : colsText.split(/\s+/).length || 3;
      const gapText = activeStyle.gridGap || '16px';
      const gapVal = parseInt(gapText) || 0;

      const handleUpdateCols = (delta: number) => {
        const nextCols = Math.max(1, colCount + delta);
        updateElementStyles(el.id, { gridTemplateColumns: `repeat(${nextCols}, 1fr)` });
      };

      const handleUpdateGap = (delta: number) => {
        const nextGap = Math.max(0, gapVal + delta);
        updateElementStyles(el.id, { gridGap: `${nextGap}px` });
      };

      return (
        <div 
          className="absolute bottom-2 left-2 flex items-center gap-2 bg-slate-900/95 text-white text-[10px] px-2 py-1.5 rounded-lg border border-indigo-505 shadow-xl z-40 font-mono select-none pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <LayoutGrid className="w-3 h-3 text-indigo-400" />
          <span className="text-indigo-400 font-bold uppercase tracking-wider text-[8px] mr-1">Grid Controller:</span>
          <div className="flex items-center gap-1">
            <span>Cols:</span>
            <button onClick={() => handleUpdateCols(-1)} className="hover:bg-slate-700 bg-slate-800 w-4 h-4 rounded flex items-center justify-center font-bold font-sans">-</button>
            <span className="text-amber-300 font-bold px-0.5">{colCount}</span>
            <button onClick={() => handleUpdateCols(1)} className="hover:bg-slate-700 bg-slate-800 w-4 h-4 rounded flex items-center justify-center font-bold font-sans">+</button>
          </div>
          <div className="h-3 w-px bg-white/20 mx-1" />
          <div className="flex items-center gap-1">
            <span>Gap:</span>
            <button onClick={() => handleUpdateGap(-4)} className="hover:bg-slate-700 bg-slate-800 w-4 h-4 rounded flex items-center justify-center font-bold font-sans">-</button>
            <span className="text-amber-300 font-bold px-0.5">{gapVal}px</span>
            <button onClick={() => handleUpdateGap(4)} className="hover:bg-slate-700 bg-slate-800 w-4 h-4 rounded flex items-center justify-center font-bold font-sans">+</button>
          </div>
        </div>
      );
    };

    let innerContent = attrs.textContent || '';

    // Handle container children rendering
    if (el.children && el.children.length > 0) {
      return React.createElement(
        el.type === 'form' ? 'form' : 'div',
        { key: el.id, ...elementProps },
        <>
          <ActionOverlays />
          <SelectionHandles />
          <GridControlsOverlay />
          {isHiddenInDesigner && (
            <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
              Hidden Node
            </span>
          )}
          {el.children.map(child => renderElement(child))}
        </>
      );
    }

    // Switch case rendering specific types of nodes
    switch (el.type) {
      case 'heading':
        return (
          <h2 key={el.id} {...elementProps}>
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            {innerContent || 'Interactive Header Title'}
          </h2>
        );
      case 'text':
        return (
          <p key={el.id} {...elementProps}>
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            {innerContent || 'Paragraph visual block. Drag or style.'}
          </p>
        );
      case 'button':
        return (
          <button key={el.id} {...elementProps} type="button">
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            {innerContent || 'Action Trigger'}
          </button>
        );
      case 'image':
        return (
          <div key={el.id} {...elementProps}>
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            <img 
              referrerPolicy="no-referrer"
              src={attrs.src || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"} 
              alt={attrs.alt || "Placeholder asset"} 
              className="w-full h-full object-cover rounded-inheritPointer"
            />
          </div>
        );
      case 'input':
        return (
          <div key={el.id} {...elementProps}>
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            <input 
              type="text" 
              placeholder={attrs.placeholder || 'Type text here...'} 
              className="w-full h-full px-3 py-2 bg-transparent border-none outline-none text-inherit font-inherit"
              disabled
            />
          </div>
        );
      case 'icon':
        return (
          <span key={el.id} {...elementProps} className={`${elementProps.className} flex items-center justify-center font-mono text-[14px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 p-2 rounded-md`}>
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            🌟 {attrs.iconName || 'Star Icon'}
          </span>
        );
      default:
        return (
          <div key={el.id} {...elementProps}>
            <ActionOverlays />
            <SelectionHandles />
            <GridControlsOverlay />
            {isHiddenInDesigner && (
              <span className="absolute top-1 left-1 bg-rose-500 text-white text-[8px] font-bold px-1 rounded uppercase tracking-wider z-20 shadow-sm">
                Hidden Node
              </span>
            )}
            {innerContent || <span className="text-[10px] opacity-40 italic">{el.name} (container)</span>}
          </div>
        );
    }
  };

  // Get active canvas sizing rules based on breakpoints
  const getCanvasWidthClass = () => {
    switch (activeBreakpoint) {
      case 'mobile':
        return 'w-[375px] min-h-[667px] shadow-2xl border-x-4 border-slate-700';
      case 'tablet':
        return 'w-[768px] min-h-[1024px] shadow-xl border-x-2 border-slate-600';
      default:
        return 'w-full max-w-[1200px] min-h-[120vh] shadow-lg';
    }
  };

  // Recursive minimap node view
  const renderMinimapNode = (node: AetherElement): React.ReactNode => {
    const isSelected = selectedIds.includes(node.id);
    return (
      <div 
        key={node.id} 
        className={`rounded-sm inline-block transition-colors ${
          isSelected 
            ? 'bg-blue-500 border border-blue-400 shadow-sm' 
            : 'bg-indigo-500/20 border border-indigo-500/10'
        }`}
        style={{
          width: node.type === 'container' || node.type === 'grid-container' ? '12px' : '6px',
          height: '6px',
          margin: '1px'
        }}
        title={`${node.name} (${node.type})`}
      >
        {node.children && node.children.map(c => renderMinimapNode(c))}
      </div>
    );
  };

  return (
    <div 
      className="flex-1 bg-slate-100 dark:bg-[#07080d] overflow-hidden relative select-none flex flex-col transition-colors duration-200"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      ref={canvasRef}
    >
      {/* Top Toolbar controls */}
      <div className="bg-white/95 dark:bg-[#0d0e16]/95 backdrop-blur-md px-4 py-2 border-b border-slate-200 dark:border-white/5 flex items-center justify-between z-20 text-xs text-slate-600 dark:text-slate-350 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-950 dark:text-white tracking-wide">VISUAL BUILDER BLOCK</span>
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-medium">{activeBreakpoint} View</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))}
            className="hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 rounded transition text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-800 dark:text-slate-300">{Math.round(canvasZoom * 100)}%</span>
          <button 
            onClick={() => setCanvasZoom(Math.min(1.5, canvasZoom + 0.1))}
            className="hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 rounded transition text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={resetZoomPan}
            className="hover:bg-slate-100 dark:hover:bg-white/10 p-1.5 rounded transition text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-medium"
            title="Reset Coordinates"
          >
            <Maximize className="w-4 h-4" /> Reset
          </button>

          {/* Grid Overlay Toggle */}
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 dark:border-white/10">
            <label className="flex items-center gap-1 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={gridOverlayEnabled} 
                onChange={(e) => setGridOverlayEnabled(e.target.checked)} 
                className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/10 text-indigo-650 focus:ring-indigo-500 dark:bg-slate-900"
              />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grid Guides</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          <Move className="w-3.5 h-3.5 mr-1" />
          <span>Shift + drag to PAN</span>
        </div>
      </div>

      {/* Synchronized Design Rulers */}
      <div className="absolute top-10 left-0 right-0 h-5 bg-white/80 dark:bg-[#0a0b12]/80 backdrop-blur-sm border-b border-slate-200 dark:border-white/5 overflow-hidden font-mono text-[8px] text-slate-400 dark:text-slate-500 z-10 pointer-events-none select-none">
        {Array.from({ length: 41 }).map((_, i) => {
          const coord = i * 100 - 2000;
          const leftOffset = coord * canvasZoom + panOffset.x + (canvasRef.current ? canvasRef.current.offsetWidth / 2 : 500);
          if (leftOffset < 0 || leftOffset > 3000) return null;
          return (
            <div key={i} className="absolute h-full border-l border-slate-300 dark:border-white/10 pt-0.5 pl-0.5" style={{ left: `${leftOffset}px` }}>
              <span>{coord}</span>
            </div>
          );
        })}
      </div>

      <div className="absolute top-15 left-0 bottom-0 w-5 bg-white/80 dark:bg-[#0a0b12]/80 backdrop-blur-sm border-r border-slate-200 dark:border-white/5 overflow-hidden font-mono text-[8px] text-slate-400 dark:text-slate-500 z-10 pointer-events-none select-none">
        {Array.from({ length: 31 }).map((_, i) => {
          const coord = i * 100 - 500;
          const topOffset = coord * canvasZoom + panOffset.y + 120;
          if (topOffset < 0 || topOffset > 2000) return null;
          return (
            <div key={i} className="absolute w-full border-t border-slate-300 dark:border-white/10 pl-0.5 pt-0.5" style={{ top: `${topOffset}px` }}>
              <span className="block origin-top-left rotate-90 translate-x-1">{coord}</span>
            </div>
          );
        })}
      </div>

      {/* Rulers and Live Stage */}
      <div className="flex-1 relative overflow-auto p-12 flex items-start justify-center">
        {/* Dynamic Snapping Guidelines Grid Background */}
        <div 
          className="absolute inset-0 text-slate-950/15 dark:text-white/5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${canvasZoom})`,
            transformOrigin: 'top left'
          }}
        />

        {/* Scalable and Pannable Canvas Shell with Live Drag-Resize Responsive Handles */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${canvasZoom})`,
            transformOrigin: 'top center',
            transition: (isPanning || isResizing) ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            width: `${canvasWidth}px`,
          }}
          className="bg-white transition-all rounded-xl shadow-2xl relative border border-slate-200 dark:border-white/5 flex flex-col group/canvas"
        >
          {/* Left Resize touch area and handle */}
          <div 
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            className="absolute -left-2 top-0 bottom-0 w-4 cursor-ew-resize z-50 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            title="Drag left to resize responsive width"
          >
            <div className="w-1.5 h-16 rounded-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-300 shadow-md border border-white/25" />
          </div>

          {/* Right Resize touch area and handle */}
          <div 
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            className="absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize z-50 flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            title="Drag right to resize responsive width"
          >
            <div className="w-1.5 h-16 rounded-full bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-400 dark:hover:bg-indigo-300 shadow-md border border-white/25" />
          </div>

          {/* Responsive HUD Bar Indicator */}
          <div className="bg-slate-50 dark:bg-[#12131f] border-b border-slate-200/50 dark:border-white/5 px-4 py-1.5 flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-wider select-none">
            <span className="font-bold">📐 PREVIEW MODE: {canvasWidth >= 1024 ? 'DESKTOP' : canvasWidth >= 768 ? 'TABLET' : 'MOBILE'}</span>
            <span className="text-indigo-650 dark:text-indigo-400 font-bold bg-[#818cf8]/10 px-1.5 py-0.5 rounded-sm">{canvasWidth}PX WIDE</span>
          </div>

          {/* Visual Canvas Elements */}
          <div className="overflow-hidden bg-transparent rounded-b-xl flex-1">
            {renderElement(rootNode)}
          </div>
        </div>
      </div>

      {/* Floating Minimap and Workspace Stats Navigator */}
      <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-[#0e101f]/95 border border-slate-200 dark:border-white/10 p-3 rounded-xl shadow-xl z-20 w-52 text-[10px] space-y-2.5 font-sans backdrop-blur-md select-none">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-1.5">
          <span className="font-bold text-slate-800 dark:text-indigo-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
            🗺️ Minimap Navigator
          </span>
          <span className="bg-slate-150 dark:bg-slate-800 text-[9px] text-slate-500 dark:text-slate-400 font-mono px-1.5 py-0.5 rounded">
            L: {selectedIds.length} Nodes
          </span>
        </div>

        {/* Tree structural thumbnail overview */}
        <div className="text-center p-2 bg-slate-50/50 dark:bg-black/30 rounded-lg border border-slate-200/50 dark:border-white/5 max-h-20 overflow-y-auto overflow-x-hidden flex flex-wrap justify-center items-center content-start gap-0.5">
          {renderMinimapNode(rootNode)}
        </div>

        {/* Controls action deck */}
        <div className="grid grid-cols-2 gap-1.5 text-center">
          <button 
            onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.15))} 
            className="p-1 cursor-pointer bg-slate-50 dark:bg-[#161826] hover:bg-slate-100 dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 rounded text-[9px] transition font-bold text-slate-700 dark:text-slate-300"
          >
            🔍 Zoom Out
          </button>
          <button 
            onClick={() => setCanvasZoom(Math.min(1.5, canvasZoom + 0.15))} 
            className="p-1 cursor-pointer bg-slate-50 dark:bg-[#161826] hover:bg-slate-100 dark:hover:bg-[#1f2235] border border-slate-200 dark:border-white/5 rounded text-[9px] transition font-bold text-slate-700 dark:text-slate-300"
          >
            🔍 Zoom In
          </button>
          <button 
            onClick={resetZoomPan} 
            className="col-span-2 p-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-500/20 rounded text-[9px] transition font-semibold"
          >
            ☀️ Re-Center Artboard
          </button>
        </div>

        {/* Coordinate outputs */}
        <div className="bg-slate-50 dark:bg-black/20 p-1.5 rounded font-mono text-[8px] text-slate-500 dark:text-slate-400 flex items-center justify-between border border-transparent dark:border-white/5">
          <span>COORDS:</span>
          <span>X: {mousePos.x}px | Y: {mousePos.y}px</span>
        </div>
      </div>

    </div>
  );
}

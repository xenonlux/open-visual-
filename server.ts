import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Shared Gemini Client following server-side instructions
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const DEFAULT_PROJECT_FILE = path.join(process.cwd(), "aetherforge_project.json");

// Start Express + Vite Server
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // In-Memory fallback if file writing fails
  let currentProjectState: any = null;

  // Load existing project or fall back to a starting template
  try {
    if (fs.existsSync(DEFAULT_PROJECT_FILE)) {
      currentProjectState = JSON.parse(fs.readFileSync(DEFAULT_PROJECT_FILE, "utf-8"));
    }
  } catch (err) {
    console.warn("Could not read project file, starting blank.", err);
  }

  // --- API Endpoints ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Load AetherForge project state
  app.get("/api/project", (req, res) => {
    if (currentProjectState) {
      return res.json(currentProjectState);
    }
    // Return standard initial empty project setup
    const initialProject = {
      id: "aether-project-1",
      name: "AetherForge Standard Project",
      rootNode: {
        id: "root-node",
        type: "container",
        name: "Main Page Canvas",
        styles: {
          desktop: {
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#ffffff",
            paddingTop: "24px",
            paddingBottom: "24px",
            paddingLeft: "24px",
            paddingRight: "24px",
            fontFamily: "Inter"
          },
          tablet: {
            paddingLeft: "16px",
            paddingRight: "16px"
          },
          mobile: {
            paddingLeft: "12px",
            paddingRight: "12px"
          }
        },
        attributes: {
          idAttr: "hero-main",
          classAttr: "max-w-7xl mx-auto shadow-sm rounded-lg"
        },
        children: []
      },
      customComponents: [],
      databaseSchema: {
        tables: [
          {
            id: "table-users",
            name: "User",
            columns: [
              { id: "col-id", name: "id", type: "String", isId: true, isRequired: true, isUnique: true },
              { id: "col-email", name: "email", type: "String", isId: false, isRequired: true, isUnique: true },
              { id: "col-role", name: "role", type: "String", isId: false, isRequired: false, isUnique: false, defaultValue: "USER" }
            ]
          }
        ],
        relations: []
      },
      workflows: [],
      assets: [
        {
          id: "logo-asset",
          name: "AetherForge Branding Mark",
          type: "image",
          size: "45 KB",
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
        }
      ],
      plugins: ["Visual Flow", "Material Core Icons"]
    };
    res.json(initialProject);
  });

  // Save current low-code platform state
  app.post("/api/project", (req, res) => {
    try {
      currentProjectState = req.body;
      fs.writeFileSync(DEFAULT_PROJECT_FILE, JSON.stringify(currentProjectState, null, 2), "utf-8");
      res.json({ success: true, message: "Project state saved successfully." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Layout Generator using Gemini-3.5-flash
  app.post("/api/generate-layout", async (req, res) => {
    const { prompt, currentContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Context description or layout prompt is required." });
    }

    try {
      // Craft structural parameters for AI-to-Layout generation
      const systemInstruction = 
        `You are the structural AI Layout Generator engine of folder "AetherForge". ` +
        `Your task is to convert plain text user requests into nested visual elements matching the following TypeScript interface of Element nodes:\n\n` +
        `interface AetherElement {\n` +
        `  id: string; // unique random text\n` +
        `  type: 'container' | 'text' | 'button' | 'image' | 'input' | 'form' | 'card' | 'icon' | 'heading' | 'grid-container';\n` +
        `  name: string; // clear developer name\n` +
        `  styles: { // styling details in hex format, valid css properties\n` +
        `    desktop?: any; // object representing default styles e.g. paddingTop, backgroundColor\n` +
        `    tablet?: any;\n` +
        `    mobile?: any;\n` +
        `  };\n` +
        `  attributes: { placeholder?: string; src?: string; textContent?: string; href?: string; idAttr?: string; classAttr?: string; iconName?: string; };\n` +
        `  children: AetherElement[];\n` +
        `}\n\n` +
        `Always return a valid JSON object representing a root 'container' or 'grid-container' element containing beautifully styled submenus, hero sections, forms or components request details. Use high contrast, elegant colors, rounded boundaries, spacing utilities, Tailwind-equivalent hex codes or colors. Your output MUST be ONLY valid parsed JSON. Do not wrap in markdown quotes. Just return the JSON structure directly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate a visual layout matching user request: "${prompt}". Context user needs: ${currentContext || 'Brand Web App UI'}. Ensure beautiful card elements, standard forms, call to action inputs and icons.`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2
        },
      });

      const rawText = response.text || "{}";
      const cleaned = rawText.trim().replace(/^```json/, "").replace(/```$/, "");
      const finalJSON = JSON.parse(cleaned);
      res.json({ success: true, layout: finalJSON });
    } catch (err: any) {
      console.error("AI Generation Error: ", err);
      res.status(500).json({ success: false, error: err.message || "Failed to parse layout from AI engine." });
    }
  });

  // Real-Time Asset Mock Upload
  app.post("/api/assets/upload", (req, res) => {
    const { name, base64, mimeType } = req.body;
    if (!name) return res.status(400).json({ error: "Missing file name" });

    // Mock an active public link for simulation
    const simulatedUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80`;
    res.json({
      success: true,
      asset: {
        id: `asset-${Date.now()}`,
        name: name,
        type: mimeType?.includes("video") ? "video" : "image",
        size: `${Math.round((base64?.length || 0) * 0.75 / 1024)} KB`,
        url: simulatedUrl
      }
    });
  });

  // Code Export Code Generator
  app.post("/api/export", (req, res) => {
    const { format, project } = req.body;
    if (!project) return res.status(400).json({ error: "Project data is required" });

    const root = project.rootNode;
    const workflows = project.workflows || [];
    const tables = project.databaseSchema?.tables || [];

    // Helper functions to generate code recursively
    const renderElementHTML = (el: any): string => {
      if (!el) return "";
      const styles = el.styles?.desktop || {};
      const attrs = el.attributes || {};

      let styleStr = Object.entries(styles)
        .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}: ${v}`)
        .join("; ");
      if (styleStr) styleStr = ` style="${styleStr}"`;

      const idTag = attrs.idAttr ? ` id="${attrs.idAttr}"` : ` id="el-${el.id}"`;
      const classTag = attrs.classAttr ? ` class="${attrs.classAttr}"` : "";
      
      let contents = attrs.textContent || "";
      if (el.children && el.children.length > 0) {
        contents += el.children.map((child: any) => renderElementHTML(child)).join("\n");
      }

      switch (el.type) {
        case "text":
          return `<p${idTag}${classTag}${styleStr}>${contents}</p>`;
        case "heading":
          return `<h2${idTag}${classTag}${styleStr}>${contents}</h2>`;
        case "button":
          return `<button${idTag}${classTag}${styleStr}>${contents}</button>`;
        case "image":
          return `<img src="${attrs.src || ''}" alt="${attrs.alt || ''}"${idTag}${classTag}${styleStr} />`;
        case "input":
          return `<input type="text" placeholder="${attrs.placeholder || ''}"${idTag}${classTag}${styleStr} />`;
        case "form":
          return `<form${idTag}${classTag}${styleStr}>${contents}</form>`;
        default:
          return `<div${idTag}${classTag}${styleStr}>${contents}</div>`;
      }
    };

    // Compile low-code logic flows into static JS bundle code
    let compiledJS = `\n// Compiled Workflows for static execution\ndocument.addEventListener("DOMContentLoaded", () => {\n`;
    workflows.forEach((wf: any) => {
      const targetQuery = `#${wf.targetElementId || wf.parentId}`;
      if (wf.type === 'trigger') {
        compiledJS += `  const triggerObj = document.getElementById("${wf.targetElementId || ''}");\n`;
        compiledJS += `  if (triggerObj) {\n`;
        compiledJS += `    triggerObj.addEventListener("click", () => {\n`;
        
        let currentBlock = wf;
        while (currentBlock && currentBlock.nextBlockId) {
          const nextBlock = workflows.find((b: any) => b.id === currentBlock.nextBlockId);
          if (nextBlock) {
            if (nextBlock.actionType === 'setProperty') {
              compiledJS += `      const node = document.getElementById("${nextBlock.targetElementId || ''}");\n`;
              compiledJS += `      if (node) { node.style.${nextBlock.propertyKey} = "${nextBlock.propertyValue}"; }\n`;
            } else if (nextBlock.actionType === 'customCode') {
              compiledJS += `      try { ${nextBlock.jsCode || ''} } catch(e){ console.error(e); }\n`;
            } else if (nextBlock.actionType === 'fetchApi') {
              compiledJS += `      fetch("${nextBlock.fetchUrl || ''}", { method: "${nextBlock.fetchMethod || 'GET'}" })\n`;
              compiledJS += `        .then(res => res.json())\n`;
              compiledJS += `        .then(data => { console.log("Workflow GET data:", data); })\n`;
              compiledJS += `        .catch(err => { console.error(err); });\n`;
            }
            currentBlock = nextBlock;
          } else {
            break;
          }
        }
        compiledJS += `    });\n`;
        compiledJS += `  }\n`;
      }
    });
    compiledJS += `});\n`;

    // 1. Pure HTML/CSS/JS export format
    if (format === "html") {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name || "AetherForge Export"}</title>
  <!-- Tailwindcss Standard CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  ${renderElementHTML(root)}
  <script>
    ${compiledJS}
  </script>
</body>
</html>`;
      return res.json({
        success: true,
        files: {
          "index.html": htmlContent,
          "README.md": `# Static Export for ${project.name}\nServe this index.html on any web platform.`
        }
      });
    }

    // 2. React + Vite setup export format
    if (format === "react") {
      const renderReactJSX = (el: any, indent = "    "): string => {
        if (!el) return "";
        const styles = el.styles?.desktop || {};
        const attrs = el.attributes || {};

        // Convert styles keys to react styled inline properties
        const reactStyles = Object.keys(styles).length > 0 
          ? ` style={${JSON.stringify(styles)}}` 
          : "";

        const classTag = attrs.classAttr ? ` className="${attrs.classAttr}"` : "";
        const idTag = attrs.idAttr ? ` id="${attrs.idAttr}"` : ` id="el-${el.id}"`;

        let contents = attrs.textContent || "";
        if (el.children && el.children.length > 0) {
          contents += "\n" + el.children.map((child: any) => renderReactJSX(child, indent + "  ")).join("\n") + "\n" + indent;
        }

        switch (el.type) {
          case "text":
            return `${indent}<p${idTag}${classTag}${reactStyles}>${contents}</p>`;
          case "heading":
            return `${indent}<h2${idTag}${classTag}${reactStyles}>${contents}</h2>`;
          case "button":
            return `${indent}<button${idTag}${classTag}${reactStyles}>${contents}</button>`;
          case "image":
            return `${indent}<img src="${attrs.src || ''}" alt="${attrs.alt || ''}"${idTag}${classTag}${reactStyles} />`;
          case "input":
            return `${indent}<input type="text" placeholder="${attrs.placeholder || ''}"${idTag}${classTag}${reactStyles} />`;
          case "form":
            return `${indent}<form${idTag}${classTag}${reactStyles}>${contents}</form>`;
          default:
            return `${indent}<div${idTag}${classTag}${reactStyles}>${contents}</div>`;
        }
      };

      const reactAppCode = `import React, { useEffect } from 'react';

export default function ExportedApp() {
  useEffect(() => {
    // Compiled logic workflow hooks
    ${compiledJS.replace("// Compiled Workflows for static execution", "").replace('document.addEventListener("DOMContentLoaded", () => {', "").slice(0,-3)}
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800">
${renderReactJSX(root, "      ")}
    </div>
  );
}`;

      return res.json({
        success: true,
        files: {
          "package.json": JSON.stringify({
            name: "aetherforge-react-vite",
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: {
              "dev": "vite",
              "build": "vite build"
            },
            dependencies: {
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            },
            devDependencies: {
              "vite": "^4.4.5"
            }
          }, null, 2),
          "src/App.jsx": reactAppCode,
          "src/main.jsx": `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App.jsx';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);`,
          "src/index.css": `@import "tailwindcss";`,
          "index.html": `<!DOCTYPE html>\n<html>\n<head>\n<script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n<div id="root"></div>\n<script type="module" src="/src/main.jsx"></script>\n</body>\n</html>`
        }
      });
    }

    // 3. Complete Docker + Backend Package format (REST Schema, Express, PostgreSQL / SQLite)
    if (format === "docker") {
      let prismaModels = `datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\n`;
      tables.forEach((tbl: any) => {
        prismaModels += `model ${tbl.name} {\n`;
        tbl.columns.forEach((col: any) => {
          let typeStr = col.type;
          if (col.type === "Relation") typeStr = "String"; // Simple relation representation
          let fieldStr = `  ${col.name} ${typeStr}`;
          if (col.isId) fieldStr += " @id @default(uuid())";
          if (col.isUnique) fieldStr += " @unique";
          if (!col.isRequired && !col.isId) fieldStr += "?";
          prismaModels += fieldStr + "\n";
        });
        prismaModels += `}\n\n`;
      });

      const backendExpress = `import express from 'express';\nimport { PrismaClient } from '@prisma/client';\n\nconst app = express();\nconst prisma = new PrismaClient();\napp.use(express.json());\n\napp.get('/api/status', (req, res) => res.json({ status: 'AetherForge Microservices Active' }));\n\n${tables.map((t: any) => {
        const lower = t.name.toLowerCase();
        return `// CRUD routes for ${t.name}
app.get('/api/${lower}s', async (req, res) => {
  const items = await prisma.${lower}.findMany();
  res.json(items);
});

app.post('/api/${lower}s', async (req, res) => {
  const newItem = await prisma.${lower}.create({ data: req.body });
  res.json(newItem);
});\n`;
      }).join('\n')}

app.listen(8080, '0.0.0.0', () => {
  console.log('Backend Microservice running on port 8080');
});`;

      const dockerFileContent = `FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npx prisma generate\nEXPOSE 8080\nCMD ["node", "index.js"]`;
      const composeContent = `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "8080:8080"\n    environment:\n      - DATABASE_URL=file:./dev.db`;

      return res.json({
        success: true,
        files: {
          "prisma/schema.prisma": prismaModels,
          "index.js": backendExpress,
          "Dockerfile": dockerFileContent,
          "docker-compose.yml": composeContent,
          "package.json": JSON.stringify({
            name: "aetherforge-backend-microservice",
            version: "1.0.0",
            main: "index.js",
            dependencies: {
              "express": "^4.18.2",
              "@prisma/client": "^5.1.0"
            },
            devDependencies: {
              "prisma": "^5.1.0"
            }
          }, null, 2)
        }
      });
    }

    res.status(400).json({ error: "Unsupported project build target" });
  });

  // Serve static files in production / hook up development server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AetherForge Compiler Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

# FormCraft — Drag-and-Drop Form Builder

FormCraft is a React single-page application that lets you visually build forms by dragging and dropping elements onto a canvas. Forms can be saved to and loaded from a REST API, previewed in a modal, and exported as JSX/TSX code or launched directly in CodeSandbox.

## Features

- **Drag-and-drop canvas** — powered by [@dnd-kit](https://dndkit.com/); drag elements from the sidebar onto the canvas and reorder them freely.
- **Rich element library** — Text Field, Long Answer, Number Input, Email, Phone, Checkbox, Radio Button, Dropdown Select, Date Picker, Toggle Switch, Rating, Slider, File Upload, Divider, Button.
- **Multi-column layouts** — Two-, three-, and four-column row containers for side-by-side fields.
- **Properties panel** — click any element to edit its label, placeholder, options, layout, and other settings in a dedicated sidebar.
- **Live preview** — render the form in a modal to see exactly how it will look and behave.
- **JSON import / export** — share form definitions as compressed Base64 JSON strings.
- **Code export** — generate JSX or TSX source code for the form and open it instantly in CodeSandbox.
- **Form management** — save, load, update, and delete named forms via the Forms API.

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | [React 18](https://react.dev/) |
| Component library | [MUI v6](https://mui.com/) |
| Drag-and-drop | [@dnd-kit/core](https://docs.dndkit.com/) + @dnd-kit/sortable |
| Routing | [React Router v6](https://reactrouter.com/) |
| Date picker | [@mui/x-date-pickers](https://mui.com/x/react-date-pickers/) + date-fns |
| Compression | [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html) |
| Build tool | [Create React App](https://create-react-app.dev/) |

## Prerequisites

- **Node.js** 24.x
- **npm** 10.x

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the API base URL (optional — defaults to the hosted backend)
#    Create or edit .env in the project root:
echo "REACT_APP_API_BASE_URL=http://localhost:4000" > .env

# 3. Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page hot-reloads on every save.

## Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start the development server at `http://localhost:3000` |
| `npm test` | Run the test suite in interactive watch mode |
| `npm run build` | Create an optimised production build in the `build/` folder |
| `npm run eject` | Eject from Create React App (irreversible) |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `https://code-generator-backend-vo4m.onrender.com` | Base URL for the Forms REST API |

## Project Structure

```
src/
├── api/
│   ├── client.js          # Base HTTP client (fetch wrapper)
│   └── forms.js           # CRUD helpers: listForms, getForm, createForm, updateForm, deleteForm
├── components/
│   ├── Sidebar.js         # Draggable element library panel
│   ├── DraggableItem.js   # Individual draggable element in the sidebar
│   ├── DroppableArea.js   # Canvas drop zone (renders elements & column rows)
│   ├── ColumnRow.js       # Multi-column row container
│   ├── EditSidebar.js     # Properties panel for the selected element
│   ├── FormCanvas.js      # Canvas wrapper
│   └── FormPreview.js     # Modal live preview of the built form
├── pages/
│   └── FormsPage.js       # Saved forms list page (load / delete)
├── App.js                 # Root component: routing, state, drag-and-drop context
├── App.css                # Application styles
└── index.js               # React entry point
docs/
└── c4.md                  # C4 architecture diagrams (Context → Code)
```

## Architecture Overview

```
[Form Designer] --(browser)--> [FormCraft SPA] --(REST)--> [Forms API]
```

The SPA is composed of three main areas:

1. **Sidebar** — lists all available form elements; each item is a @dnd-kit draggable.
2. **Canvas (DroppableArea)** — accepts dropped elements and renders them in order; supports nested column-row layouts.
3. **Edit Sidebar** — context-sensitive properties panel that updates the selected element's configuration in real time.

State is managed in `App.js` and flows downward through props. The Forms API is called via thin wrappers in `src/api/forms.js`.

For a detailed architecture breakdown see [docs/c4.md](docs/c4.md).

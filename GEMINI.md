# GEMINI.md - Project Overview: Octava AVLAN Controller

This document provides a comprehensive overview of the Octava AVLAN Controller project, intended as a technical reference for developers and future AI interactions.

## 1. Project Overview

This project is a web-based control system for an Audio/Video over LAN setup. It provides a user interface to manage and route signals between multiple sources (inputs) and displays (outputs).

The system has a distributed architecture composed of three main parts:

1.  **Frontend:** A Single-Page Application (SPA) built with **Vue 3**.
    *   **UI Framework:** [Vuetify](https://vuetifyjs.com/) for Material Design components.
    *   **State Management:** [Pinia](https://pinia.vuejs.org/) is used to manage application-wide state. All core frontend logic and API interactions are centralized in `src/stores/stateStores.js`.
    *   **Routing:** [Vue Router](https://router.vuejs.org/) handles navigation between different pages/views.
    *   **Build Tool:** [Vite](https://vitejs.dev/) is used for development and building the production assets.

2.  **Persistence Backend:** A lightweight **Node.js/Express** server running on **port 3000** (`app.js`).
    *   Its primary role is to serve the built Vue application and provide a simple REST-like API.
    *   This API handles reading and writing user configurations (such as device names, IP settings, and presets) by persisting them to `.txt` files in the `public/` directory.

3.  **Control Backend:** A **Node-RED** instance running on **port 1880**.
    *   This is the core control layer that communicates with the AV hardware.
    *   It exposes a simple HTTP API that the Vue frontend calls for real-time actions (e.g., switching an input, turning PoE on/off).
    *   The Node-RED flows (defined in `node_red_flows/flows.json`) translate these high-level HTTP requests into low-level **SNMP (Simple Network Management Protocol)** commands to directly query and control the Cisco network switch that manages the AV traffic. It also interfaces with iTach devices for IR control.

## 2. Building and Running

### Frontend (Vite)

The following commands manage the Vue.js frontend application.

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Run Development Server:** Starts the Vite dev server with hot-reloading.
    ```bash
    npm run dev
    ```

*   **Build for Production:** Compiles and minifies the Vue app into the `dist/` directory.
    ```bash
    npm run build
    ```
    *Note: The `README.md` mentions the build output should be compressed to `dist.tar` before being loaded into the Octava Controller.*

### Backend (Express)

The persistence backend requires Node.js.

*   **Run Server:**
    ```bash
    node app.js
    ```
    The server will run on `http://localhost:3000`.

### Backend (Node-RED)

The control backend requires a running Node-RED instance.

*   **Setup:** The flows are defined in `node_red_flows/flows.json`. This file needs to be imported into your Node-RED editor.
*   **Running:** Start your Node-RED instance as you normally would. The flows are configured to listen for HTTP requests on `http://localhost:1880`.

## 3. Development Conventions

*   **State Management:** All shared application state is managed in the Pinia store defined in `src/stores/stateStores.js`. This is the single source of truth for the frontend.
*   **API Interaction:** The frontend communicates with two different backends:
    *   Port **3000** (`app.js`) for saving and loading configuration data.
    *   Port **1880** (Node-RED) for executing real-time hardware control commands.
*   **Component Structure:** The project follows a standard Vue component structure:
    *   `src/pages/`: Contains top-level components, each corresponding to a page/route.
    *   `src/components/`: Contains smaller, reusable UI components used across different pages.
*   **Authentication:** A simple authentication guard is implemented in `src/router/index.js`. It checks an `isAuthenticated` flag in the Pinia store before allowing access to admin-level routes.
*   **Styling:** Global styles are in `src/styles.css`, with component-specific styles likely co-located within the `.vue` files. The project uses the [MDI font library](https://pictogrammers.com/library/mdi/) for icons.

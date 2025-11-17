# Jocelyne’s typing-test logging prototype

This folder contains a standalone HTML/JS prototype for our pain typing study.

## What it does

- Signs participants in anonymously using Firebase Authentication.
- Creates a session document per test under `users/{uid}/sessions`.
- Logs:
  - `start-button-pressed`
  - typing focus / blur
  - `typing-keydown` (including key, code, modifiers)
  - `typing-input` (text length only, not full content)
- Saves all events to:
  - Local Storage (for export)
  - Firestore under `users/{uid}/events`
- Can export the full local event history as a `.json` file.

## How to run locally

1. Open this folder in a simple HTTP server, for example:

   ```bash
   cd prototypes/jocelyne-typing-logger
   npx http-server .

2.	Visit the shown URL (e.g. http://127.0.0.1:8080).
3.	Enter a participant name, press Start typing, type in the textarea.	
4.	Use “Export events as JSON” to download the keystroke log.

This prototype is intended as a reference for integrating logging into the main React-based typing test.
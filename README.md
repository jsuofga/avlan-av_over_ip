# Octava AVLAN Controller — Vue 3 + Vuetify + Pinia

Quick start (PowerShell):

```powershell
npm install
npm run dev
npm run build
```

Notes:
- Complete update of the old Octava HDLAN which was using props and emits. Now using Pinia for state management. 
- build should be compressed to 'dist.tar' before loading into the Octava Controller.
- Backend requires:app.js (Express server), and NodeRed flows 
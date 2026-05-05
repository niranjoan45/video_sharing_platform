# Video Sharing Platform Setup & Run TODO

## Steps to Complete:
1. [x] Fix `start-servers.bat` with correct project paths (Desktop/OneDrive)
2. [x] Create/update `videosharing/backend/.env` with MONGODB_URI (local MongoDB required)
3. [x] Install backend dependencies: `cd videosharing/backend && npm install` (up to date, audit fix run)
4. [x] Install frontend dependencies: `cd videosharing/frontend && npm install`
5. [ ] Ensure MongoDB is running (port 27017, db 'video')
6. [ ] Run servers: Use fixed `start-servers.bat` or `npm run dev` (backend) + `npm start` (frontend)
7. [ ] Verify: localhost:3000 (register/login/upload), API at localhost:5000

**Status:** Deps installed (ignore Windows npm warnings). Awaiting MongoDB confirmation. Run `start-servers.bat` once Mongo ready. Backend: http://localhost:5000, Frontend: http://localhost:3000

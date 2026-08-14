npm install -g pnpm

pnpm install


frotend

cd artifacts\ai-study-companion
pnpm run dev

backend

cd artifacts\api-server
$env:MONGODB_URI="mongodb://127.0.0.1:27017/study_pal"
pnpm dev
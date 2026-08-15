npm install -g pnpm

pnpm install


frotend

cd artifacts\ai-study-companion
pnpm run dev

backend

cd artifacts\api-server
$env:MONGODB_URI="mongodb://127.0.0.1:27017/study_pal"
pnpm dev











frontend env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here

EXPO_PUBLIC_API_URL=http://localhost:5000/api

EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c291Z2h0LWJlbmdhbC03My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_NZNsnkgwaCE9wmTV4eStN0KnDpMCOaHUxarbkUOdxz



backend env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Configuration

MONGODB_URI=mongodb://127.0.0.1:27017/study_pal



CLERK_PUBLISHABLE_KEY=pk_test_c291Z2h0LWJlbmdhbC03My5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_NZNsnkgwaCE9wmTV4eStN0KnDpMCOaHUxarbkUOdxz
# Frontend URL for CORS
APP_URL=http://localhost:19000
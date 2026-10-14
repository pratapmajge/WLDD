# Meme'd Campaign Payout Tracker

A web application for brands to create campaigns and creators to submit content and track earnings based on view milestones.

## Features

### For Brands
- Create campaigns with milestone-based payouts (e.g., 10K views → ₹500, 50K views → ₹2,000)
- Set total budget for each campaign
- Track budget spent vs. remaining in real-time
- Support for Instagram and YouTube platforms

### For Creators
- Browse and view active campaigns
- Submit post links to campaigns
- Track total earnings across all submissions
- Simulate view updates to see payout changes

### Technical Features
- JWT-based authentication with role-based access (brand/creator)
- Budget cap enforcement - campaigns never exceed their allocated budget
- Payout calculation based on highest milestone crossed
- RESTful API with proper error handling
- Unit tests for payout calculation and budget cap logic

## Tech Stack

### Backend
- Node.js with TypeScript
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Jest for testing

### Frontend
- Next.js with TypeScript
- TailwindCSS for styling
- Axios for API calls

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas account)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/memed
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env.local` if your backend is running on a different port:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Running Tests

Run the backend tests:
```bash
cd backend
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user (brand or creator)
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info (requires auth)

### Campaigns (Brand)
- `POST /api/campaigns` - Create a new campaign (brand only)
- `GET /api/campaigns/my-campaigns` - Get brand's campaigns (brand only)
- `GET /api/campaigns/active` - Get all active campaigns (creator only)
- `GET /api/campaigns/:id` - Get single campaign details

### Submissions (Creator)
- `POST /api/submissions` - Submit a post to a campaign (creator only)
- `GET /api/submissions/my-submissions` - Get creator's submissions (creator only)
- `GET /api/submissions/my-earnings` - Get creator's total earnings (creator only)
- `PATCH /api/submissions/:id/views` - Update view count (simulates platform data, no auth required)

## Assumptions & Design Decisions

1. **Budget Cap Enforcement**: When a campaign's remaining budget is insufficient to pay the full milestone payout, the system caps the payout to the remaining budget. The creator receives the maximum possible amount without exceeding the campaign's budget.

2. **Multiple Milestone Crossings**: If a post crosses multiple milestones in a single view update, the payout is calculated based on the highest milestone crossed (not cumulative of all milestones).

3. **View Update Simulation**: The `PATCH /api/submissions/:id/views` endpoint simulates platform data updates. In production, this would be replaced by webhooks or API integrations with Instagram/YouTube.

4. **One Submission Per Campaign**: A creator can only submit one post per campaign. This is enforced to prevent duplicate submissions.

5. **Milestone Sorting**: Milestones are automatically sorted by view count (ascending) when a campaign is created to ensure consistent payout calculations.

6. **Budget Tracking**: The `spent` field on campaigns tracks total payouts made. This is updated atomically with payout calculations to prevent overspending.

7. **No Concurrent Update Protection**: The current implementation does not use database transactions or locking for concurrent view updates. For the stretch goal of preventing race conditions, MongoDB transactions or optimistic locking would be needed.

8. **No Redis Caching**: The bonus feature of caching campaign lists with Redis is not implemented but can be added for improved performance at scale.

## Deployment

### Backend Deployment (Render)
1. Deploy MongoDB Atlas for the database
2. Set environment variables in Render
3. Connect GitHub repository and deploy

### Frontend Deployment (Vercel)
1. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL
2. Connect GitHub repository and deploy

## Future Improvements

1. Add Redis caching for campaign lists
2. Implement database transactions for concurrent view updates
3. Add webhook integration with Instagram/YouTube APIs
4. Implement view spike detection for fraud prevention
5. Add Docker support for containerized deployment
6. Add more comprehensive test coverage
7. Implement pagination for campaign and submission lists
8. Add email notifications for creators when they cross milestones

## License

ISC

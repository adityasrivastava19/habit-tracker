# Habit Tracker - Deployment Ready

A premium habit tracking application with user authentication, analytics, and a beautiful glassmorphism UI.

## Features

- 🔐 **Secure Authentication**: JWT-based login and registration
- 📊 **Analytics Dashboard**: Visual charts showing weekly habit completion
- 🔥 **Streak Tracking**: Monitor your consistency with day streaks
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Premium UI**: Glassmorphism design with smooth animations

## Tech Stack

### Frontend
- React (Vite)
- Framer Motion (animations)
- Recharts (analytics)
- Axios (API calls)
- React Router DOM

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT (authentication)
- BCrypt (password hashing)

## Local Development

### Prerequisites
- Node.js installed
- MongoDB running on `localhost:27017`

### Setup

1. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd client
   npm install
   ```

3. **Run Development Servers**:

   **Backend** (Terminal 1):
   ```bash
   cd server
   node server.js
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd client
   npm run dev
   ```

4. **Access the App**:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

## Production Deployment

The application is configured for single-command deployment. The backend serves the built React frontend.

### Build Steps

1. **Build Frontend**:
   ```bash
   cd client
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   cd server
   node server.js
   ```

3. **Access the App**:
   - Open `http://localhost:5000`
   - The server hosts both the API and the frontend

### Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

### Deploy to Cloud (Render/Railway/Heroku)

1. Push your code to GitHub
2. Connect your repository to Render/Railway/Heroku
3. Set build command: `cd client && npm install && npm run build && cd ../server && npm install`
4. Set start command: `cd server && node server.js`
5. Add environment variables in the platform dashboard
6. Deploy!

## Usage

1. **Register**: Create a new account
2. **Login**: Access your dashboard
3. **Add Habits**: Type a habit name and click the + button
4. **Track Daily**: Click the circles to mark habits as complete
5. **View Analytics**: Click the "Analytics" button to see your progress chart
6. **Monitor Streaks**: Each habit shows your current streak

## Project Structure

```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # AuthPage, Dashboard
│   │   ├── context/       # AuthContext
│   │   ├── index.css      # Global styles
│   │   └── App.jsx        # Main app component
│   └── dist/              # Build output (after npm run build)
│
└── server/                # Node.js Backend
    ├── models/            # Mongoose schemas
    ├── routes/            # API routes
    ├── .env               # Environment variables
    └── server.js          # Express server
```

## License

MIT

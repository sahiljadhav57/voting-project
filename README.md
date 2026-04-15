# ChainVote - Decentralized Voting System

A full-stack blockchain-based voting application with secure authentication, real-time vote tracking, and immutable blockchain ledger.

## 🚀 Features

- **Aadhaar-based Authentication**: Secure OTP-based voter authentication
- **Admin Panel**: Complete election management system
- **Real-time Voting**: Live vote counting with blockchain verification
- **Blockchain Ledger**: Immutable record of all voting transactions
- **Region-based Voting**: State, District, and Constituency selection
- **Responsive Design**: Modern UI with Tailwind CSS
- **Smart Contract Display**: View Solidity voting contract

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Crypto** for blockchain hashing

### Frontend
- **React 18** with Hooks
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd "c:/Users/Suraj/OneDrive/Desktop/mini project Voting"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env file with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/chainvote
# or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chainvote

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. Use connection string: `mongodb://localhost:27017/chainvote`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `.env` file
4. Whitelist your IP address in Atlas dashboard

## 👥 Default Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `123`

### Voter Login
- **Aadhaar**: Any 12-digit number (e.g., `123456789012`)
- **OTP**: Check console logs or response (in development mode)

## 📁 Project Structure

```
mini project Voting/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Election.js           # Election schema
│   │   ├── Vote.js               # Vote schema
│   │   └── Block.js              # Blockchain block schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── elections.js          # Election management routes
│   │   ├── votes.js              # Voting routes
│   │   └── blockchain.js         # Blockchain routes
│   ├── utils/
│   │   ├── blockchain.js         # Blockchain utilities
│   │   └── otp.js                # OTP generation/verification
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Main server file
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx         # Login component
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── ElectionCard.jsx  # Election card component
│   │   │   └── BlockchainViewer.jsx # Blockchain visualizer
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── index.html                    # Original single-file app (reference)
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for Aadhaar
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user

### Elections
- `GET /api/elections` - Get all elections
- `GET /api/elections/:id` - Get single election
- `POST /api/elections` - Create election (admin only)
- `PATCH /api/elections/:id/status` - Update election status (admin only)
- `DELETE /api/elections/:id` - Delete election (admin only)

### Votes
- `POST /api/votes` - Cast a vote
- `GET /api/votes/my-votes` - Get user's voting history
- `GET /api/votes/election/:electionId` - Get election votes (admin only)

### Blockchain
- `GET /api/blockchain` - Get blockchain ledger
- `GET /api/blockchain/verify` - Verify blockchain integrity (admin only)

## 🎯 Usage Guide

### For Voters

1. **Login**
   - Enter your 12-digit Aadhaar number
   - Request OTP
   - Enter the OTP received
   - Select your State, District, and Constituency
   - Complete registration

2. **Vote**
   - Connect your wallet (simulated)
   - View active elections
   - Click "Vote" on your preferred candidate
   - Confirm the transaction
   - View your vote recorded on the blockchain

### For Admins

1. **Login**
   - Click "Login as Admin"
   - Enter username: `admin` and password: `123`

2. **Create Election**
   - Click "Create New" tab
   - Fill in election details (title, description, dates)
   - Add candidates with their party affiliations
   - Click "Deploy Election Contract"

3. **Manage Elections**
   - Start pending elections (Play button)
   - End active elections (Stop button)
   - View blockchain ledger
   - View smart contract code

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- OTP verification for voters
- One vote per user per election (enforced at database level)
- Blockchain immutability
- Admin-only routes protection

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Manual Testing
1. Start both backend and frontend servers
2. Test admin login and election creation
3. Test voter registration and voting
4. Verify blockchain ledger updates
5. Test election status changes

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Set a strong `JWT_SECRET`
4. Deploy to services like Heroku, Railway, or DigitalOcean

### Frontend
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `dist` folder to Vercel, Netlify, or any static hosting

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created as a mini project for demonstrating full-stack development with blockchain concepts.

## 🐛 Known Issues

- OTP is currently stored in-memory (use Redis for production)
- Wallet connection is simulated (integrate with MetaMask for real blockchain)
- Email/SMS notifications not implemented

## 🔮 Future Enhancements

- [ ] Real blockchain integration (Ethereum/Polygon)
- [ ] Email/SMS OTP delivery
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Facial recognition for voter verification
- [ ] Real-time results visualization

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.

---

**Happy Voting! 🗳️**

# MongoDB Atlas Setup Guide

## Step-by-Step Instructions to Access Your Database from Anywhere

### 1. Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with email or Google account
3. Complete the registration

### 2. Create a Free Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select cloud provider: **AWS, Google Cloud, or Azure**
4. Choose region closest to you (e.g., Mumbai for India)
5. Cluster Name: `ChainVote` (or keep default)
6. Click **"Create Cluster"** (takes 3-5 minutes)

### 3. Create Database User

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `chainvote_admin`
5. Password: Generate a secure password (save it!)
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### 4. Whitelist IP Addresses

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Options:
   - **For development**: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **For production**: Add specific IP addresses
4. Click **"Confirm"**

### 5. Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**
5. Version: **5.5 or later**
6. Copy the connection string:
   ```
   mongodb+srv://chainvote_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your Backend

1. Open `backend/.env` file
2. Replace the MONGODB_URI with your Atlas connection string
3. Replace `<password>` with your actual database user password
4. Add database name at the end:

```env
# Before (Local)
MONGODB_URI=mongodb://localhost:27017/chainvote

# After (Atlas - Cloud)
MONGODB_URI=mongodb+srv://chainvote_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/chainvote?retryWrites=true&w=majority
```

### 7. Restart Your Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

### 8. Access Your Data from Anywhere

#### Option A: MongoDB Atlas Web Interface
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click on your cluster
3. Click **"Browse Collections"**
4. View your data: `users`, `elections`, `votes`, `blocks`

#### Option B: MongoDB Compass
1. Open MongoDB Compass
2. Paste your connection string
3. Click "Connect"
4. Browse collections

#### Option C: From Any Device
- Your backend API can now be accessed from anywhere
- Deploy frontend to Vercel/Netlify
- Deploy backend to Render/Railway
- Both connect to the same Atlas database

## Benefits of MongoDB Atlas

✅ **Access from Anywhere**: Cloud-based, always available  
✅ **Free Tier**: 512MB storage, perfect for development  
✅ **Automatic Backups**: Daily backups included  
✅ **Monitoring**: Built-in performance monitoring  
✅ **Security**: Encryption, authentication, IP whitelisting  
✅ **Scalability**: Easy to upgrade as you grow  

## Troubleshooting

### Connection Error: "Authentication failed"
- Check username and password in connection string
- Ensure database user has correct privileges

### Connection Error: "IP not whitelisted"
- Add your IP address in Network Access
- Or allow access from anywhere (0.0.0.0/0)

### Connection Error: "Timeout"
- Check your internet connection
- Verify firewall isn't blocking MongoDB ports

## Next Steps

Once connected to Atlas:
1. Your data persists in the cloud
2. You can access it from any device
3. Share the API with others
4. Deploy your app to production

## Cost

- **Free Tier (M0)**: 512MB storage, shared RAM
- **Paid Tiers**: Start at $9/month for dedicated resources
- For this voting app, free tier is sufficient!

---

**Need Help?** Check [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)

# 🚀 ConnectFund - Crowdfunding Platform

**CrowdFund** is a modern crowdfunding platform connecting creators with donors to fund innovative projects efficiently and securely.  

---

## ✨ Key Features

- **🎯 Campaign Management** – Create,delete, and post updates on fundraising campaigns effortlessly  
- **💳 Secure Donations** – Safe payment processing   
- **👥 User Roles** – Dedicated interfaces for **Creators** and **Donors**  
- **📊 Real-time Analytics** – Visualize campaign performance with dashboards  
- **💬 Social Features** – Follow campaigns and post comments on them  
- **🔍 Search & Discovery** – Advanced filtering and campaign categorization  

---

## 🛠️ Tech Stack

| Layer         | Technology                                                    |
|---------------|---------------------------------------------------------------|
| **Frontend**  | React JS, Tailwind CSS, ShadCN UI, lucide-react, React Router |
| **Backend**   | Flask, SQLAlchemy, JWT Authentication, bcrypt, flask-restx    |
| **Database**  | PostgreSQL                                                    |

---

## 🏗️ Database Design

**Core Tables (7):**  
`Users`, `Campaigns`, `Donations`, `Categories`, `Campaign_Updates`, `Comments`, `User_Follows`, `Payments`

**Advanced SQL Features:**  
- ✅ Complex joins and triggers  
- ✅ Database views and functions
- ✅ Transaction handling  

---

## 🎉 Why ConnectFund?

ConnectFund bridges the gap between creators and backers by providing a secure, transparent, and engaging platform. Whether you’re funding your first project or supporting the next big innovation, ConnectFund makes it simple and rewarding.  

---

## 📂 Getting Started

1. **Clone the repo:**  
```bash
git clone https://github.com/waliuddin1105/ConnectFund-Crowd-funding-platform
```
2. **Install the dependencies:**  
```bash
cd backend && pip install -r requirements.txt
cd frontend && npm install
```
3. **Configure environment variables**  
```bash
//frontend
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_CLOUDINARY_CLOUD_NAME
VITE_BACKEND_URL

//backend
SQLALCHEMY_DATABASE_URI
SECRET_KEY
```
4. **Run backend**
```bash
flask run
```
5. **Run frontend**
```bash
npm run dev
```


## Guidelines to Run the Program Locally

### 1. Backend Setup
Open your terminal and navigate to the backend folder:
```bash
cd knoxite-backend
```

Install the required backend dependencies:
```bash
npm install
```

Create a `.env` file inside the `knoxite-backend` folder (if it doesn't exist) and add your local database credentials:
```env
PORT=5000
DATABASE_URL="mysql://root:@localhost:3306/knoxite"
```
*(Note: If your local MySQL has a password, put it after `root:`)*

Sync the database and generate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```

Start the backend server:
```bash
npm run dev
```

---

### 2. Frontend Setup
Leave the backend running and open a **new terminal window**. Navigate to your frontend folder:
```bash
# Assuming you are in the root directory
cd YOUR_FRONTEND_FOLDER_NAME
```

Install the frontend dependencies:
```bash
npm install
```

Update your API Configuration:
* Open `config.ts`
* Change the API URL to your machine's current local IP address (e.g., `[http://192.168.1.](http://192.168.1.)x:5000/api`). 
* *⚠️ Please do not commit/push your local IP address changes to GitHub!*

Start the Frontend Application:
```bash
npm run dev -- --host
```
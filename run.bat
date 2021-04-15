@ECHO OFF
cd backend
call npm install
cd ../frontend
call npm install
call npm start
# Online Shopping and Order Management System

A beginner-friendly e-commerce application for a DevOps practical. It demonstrates product browsing, search, customer registration/login, cart management, order placement, order history, Git/GitHub, Jenkins, Docker, and Selenium.

## Requirements
- Node.js and npm
- Git
- Docker Desktop (for containerization)
- Jenkins (for CI pipeline)
- Google Chrome (for Selenium)

## Run locally (Windows PowerShell)
```powershell
npm.cmd install
npm.cmd start
```
Open http://localhost:3000

## Selenium test
Keep the application running in one terminal. In a second terminal:
```powershell
node tests/selenium-test.js
```
The test checks the home page, product search, and add-to-cart action.

## Docker
```powershell
docker build -t online-shopping-app .
docker run -d --name online-shopping-container -p 3001:3000 online-shopping-app
docker ps
```
Open http://localhost:3001

To stop and remove the container:
```powershell
docker stop online-shopping-container
docker rm online-shopping-container
```

## GitHub
Create an empty GitHub repository named `Online-Shopping-Order-Management-System`, then run:
```powershell
git init
git add .
git commit -m "Initial Online Shopping project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/Online-Shopping-Order-Management-System.git
git push -u origin main
```
Replace YOUR-USERNAME with your GitHub username.

## Jenkins
Create a Pipeline job and configure:
- Definition: Pipeline script from SCM
- SCM: Git
- Repository URL: your GitHub repository URL
- Branch: `*/main`
- Script path: `Jenkinsfile`

Save and click Build Now. This Jenkinsfile uses Windows `bat` steps.

## Notes
- Products are inserted automatically into SQLite the first time the app starts.
- Register a customer account before placing an order.
- This is an educational demonstration, not a production e-commerce system. It does not process real payments.
- Admin orders endpoint is a demonstration and requires a logged-in account whose email is `admin@shop.com`; no admin registration UI is included.

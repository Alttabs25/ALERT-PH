🚨 ALERT PH: Developer Setup & Git Guide 🚨
PART 1: Getting the Code (Do this ONLY the first time)
To get the exact same code that is currently on GitHub onto your laptop:

Step 1: Open VS Code and open a new Terminal (Ctrl + `).
Step 2: Download the code by running:

Bash
git clone https://github.com/Alttabs25/ALERT-PH.git
Step 3: Open the actual project folder! In VS Code, go to File > Open Folder and select the new ALERT-PH folder you just downloaded.
Step 4: Open a new terminal inside this folder and download the required libraries:

Bash
npm install
Step 5: Start the app to make sure it works!

Bash
npx expo start
PART 2: Starting Your Work (Do this EVERY time you sit down to code)
Before you type a single line of code, you need to make sure you have everyone else's latest updates so you don't break the app.

Step 1: Pull the newest code from GitHub:

Bash
git pull origin main
Step 2: If it says "Already up to date", you are safe to start coding! If it downloads new files, run npm install again just in case someone added a new library.

PART 3: Saving & Uploading (Do this when you finish a feature)
When you are done building your screen and want to share it with the group, you need to "push" it to the cloud.

Step 1: Stage all your changes (Prepares everything to be saved)

Bash
git add .
(Yes, that is a space and then a period!)

Step 2: Commit your changes (Saves it locally to your computer)

Bash
git commit -m "Briefly explain what you did here"
(Example: git commit -m "Finished the hotlines screen UI" )

Step 3: Push to GitHub (Uploads it to the cloud for the rest of us)

Bash
git push origin main
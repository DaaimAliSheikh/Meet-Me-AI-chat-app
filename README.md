# Meet-Me AI chat app

### Set up:

1. Build the frontend files, make sure to set the baseURL in baseURL.ts to ""

   ```bash
   cd react-frontend
   npm run build
   ```

2. Build the socket server files

   ```bash
   cd ../socket-server
   npm run build
   ```

3. Copy the frontend build files/folders from react-frontend/dist to socket-server/dist/public (create the public folder if doesn't exist)

4. Set up the environment variables in a .env file inside /socket-server using the .env.example file

5. Run the application
   ```bash
   npm run start
   ```

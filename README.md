# Meet-Me AI chat app

### Set up:

1. Build the frontend files, make sure to set the baseURL in baseURL.ts to "" and then copy the the frontend build files to socket-server/dist/public (create if doesn't exist)

   ```bash
   cd react-frontend
   echo "export const baseURL = "";" > ./src/baseURL.ts
   npm run build
   ```

2. Build the socket server files

   ```bash
   cd ../socket-server
   npm run build
   ```

3. Set up the environment variables in a .env file inside /socket-server using the .env.example file
4. Run the application
   ```bash
   npm run start
   ```

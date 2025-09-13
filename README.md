
  # Task Manager Application

  This is a code bundle for Task Manager Application. The original project is available at https://www.figma.com/design/R5JluKXNZLsZUJA6GTFe7a/Task-Manager-Application.

## Running the code

1. Install dependencies:
  ```sh
  npm install
  ```

2. Start the Vite dev server with host mode enabled:
  ```sh
  npm run dev -- --host
  ```

3. (Optional) Expose your app to the internet using ngrok:
  - In a separate terminal, run:
    ```sh
    ngrok http 3000
    ```
  - Copy the public ngrok URL (e.g., https://xxxx.ngrok-free.app) and open it in your browser.

4. If you see a "Blocked request. This host is not allowed" error, add your ngrok domain to `server.allowedHosts` in `vite.config.ts`:
  ```js
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
     'your-ngrok-domain.ngrok-free.app'
    ],
  },
  ```

5. Reload your dev server and try the ngrok URL again.

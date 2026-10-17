# Serverless Hello World (instructor reference)

SprintBoard is a **long-running Express + MongoDB** application. It is **not** deployed as a serverless function.

This topic is covered as a **separate instructor demonstration** using a cloud provider's serverless runtime (for example AWS Lambda, Azure Functions, or Vercel serverless functions).

## Teaching goal

Students should understand that serverless functions:

- Start on demand in response to an event or HTTP request.
- Often have short lifetimes and no persistent local database connection by default.
- Use environment configuration for external services (such as MongoDB Atlas) when persistence is required.

## Suggested 10-minute demo outline

1. Create a minimal handler that returns `{ message: "Hello from serverless" }`.
2. Deploy to the provider's free tier or run locally with the vendor's CLI.
3. Compare with SprintBoard's always-on Express server in `server/src/server.js`.
4. Discuss when serverless fits versus a traditional MERN backend.

Do not claim SprintBoard itself is serverless because this document exists.

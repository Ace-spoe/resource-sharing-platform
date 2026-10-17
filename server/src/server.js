const { app } = require("./app");
const { port } = require("./config/env");
const { prisma } = require("./db/prisma");

async function start() {
  await prisma.$connect();

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  let shutdownPromise;

  const shutdown = (signal) => {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    console.log(`Received ${signal}; shutting down.`);
    shutdownPromise = new Promise((resolve) => {
      server.close(async (error) => {
        if (error) {
          console.error("Failed to close the HTTP server:", error);
          process.exitCode = 1;
        }

        try {
          await prisma.$disconnect();
        } catch (disconnectError) {
          console.error("Failed to disconnect from the database:", disconnectError);
          process.exitCode = 1;
        }

        resolve();
      });
    });

    return shutdownPromise;
  };

  process.once("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
      console.error("Failed to shut down the server:", error);
      process.exitCode = 1;
    });
  });
  process.once("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
      console.error("Failed to shut down the server:", error);
      process.exitCode = 1;
    });
  });
}

start().catch(async (error) => {
  console.error("Failed to start the server:", error);

  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error("Failed to disconnect from the database:", disconnectError);
  }

  process.exitCode = 1;
});

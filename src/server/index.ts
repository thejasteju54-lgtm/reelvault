import { createApp } from './app.js';
import { initDatabase, closeDatabase } from './db/database.js';

const PORT = Number(process.env.PORT) || 4000;

// Initialize Database connection and schema
initDatabase();

const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`🚀 ReelVault Server running at http://localhost:${PORT}`);
});

// Graceful shutdown handling
function handleShutdown(signal: string) {
  console.log(`Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    closeDatabase();
    console.log('Database connection closed. Process exited.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

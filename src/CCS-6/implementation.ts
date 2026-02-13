// file: package.json
{
  "name": "chatbot-frontend-interface",
  "version": "1.0.0",
  "description": "A basic Node.js server to host a responsive frontend for a chatbot.",
  "main": "dist/server.js",
  "scripts": {
    "build:server": "tsc --project tsconfig.json",
    "build:client": "tsc --project tsconfig.client.json",
    "build": "npm run build:server && npm run build:client",
    "start": "node dist/server.js",
    "dev": "concurrently \"npm run build:client -- --watch\" \"ts-node src/server.ts\"",
    "clean": "rm -rf dist public/*.js public/*.js.map"
  },
  "keywords": [
    "chatbot",
    "frontend",
    "typescript",
    "nodejs",
    "express",
    "responsive"
  ],
  "author": "Your Name",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.16",
    "concurrently": "^8.2.2",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}

// file: tsconfig.json
// TypeScript configuration for the Node.js server
{
  "compilerOptions": {
    "target": "ES2016",                        /* Specify ECMAScript target version: 'ES3' (default), 'ES5', 'ES2015', etc. */
    "module": "CommonJS",                     /* Specify module code generation: 'None', 'CommonJS', 'AMD', 'System', 'UMD', 'ES6', 'ES2015', 'ESNext'. */
    "outDir": "./dist",                       /* Redirect output structure to the directory. */
    "rootDir": "./src",                       /* Specify the root directory of input files. Use to control the output directory structure with --outDir. */
    "strict": true,                           /* Enable all strict type-checking options. */
    "esModuleInterop": true,                  /* Enables emit interoperability between CommonJS and ES Modules via creation of namespace objects for all imports. Implies 'allowSyntheticDefaultImports'. */
    "skipLibCheck": true,                     /* Skip type checking of declaration files. */
    "forceConsistentCasingInFileNames": true, /* Disallow inconsistently-cased references to the same file. */
    "resolveJsonModule": true                 /* Allow importing .json files */
  },
  "include": ["src/**/*.ts"],                 /* Specify files to include in the compilation. */
  "exclude": ["node_modules", "src/client/**/*.ts"] /* Exclude client-side TypeScript from server compilation. */
}

// file: tsconfig.client.json
// TypeScript configuration for the client-side JavaScript
{
  "compilerOptions": {
    "target": "ES2018",                       /* Specify ECMAScript target version for browser compatibility. */
    "module": "ESNext",                       /* Use ES Modules for client-side JavaScript. */
    "outDir": "./public",                     /* Output client-side JS to the public directory. */
    "rootDir": "./src/client",                /* Root directory for client-side TS files. */
    "strict": true,                           /* Enable all strict type-checking options. */
    "esModuleInterop": true,                  /* Enables emit interoperability between CommonJS and ES Modules. */
    "skipLibCheck": true,                     /* Skip type checking of declaration files. */
    "forceConsistentCasingInFileNames": true, /* Disallow inconsistently-cased references to the same file. */
    "lib": ["DOM", "DOM.Iterable", "ESNext"], /* Specify library files to be included in the compilation. */
    "declaration": false,                     /* Do not generate .d.ts files for client-side code. */
    "sourceMap": true                         /* Generate source maps for debugging. */
  },
  "include": ["src/client/**/*.ts"]           /* Include all TypeScript files within the client directory. */
}

// file: src/server.ts
/**
 * @file server.ts
 * @description Node.js server to host the static frontend for the chatbot.
 * Uses Express to serve static files from the 'public' directory and provides
 * a catch-all route for single-page application (SPA) client-side routing.
 */

import express from 'express';
import path from 'path';

/**
 * Interface for environment variables used by the server.
 */
interface ProcessEnv {
  PORT?: string;
}

// Extend global ProcessEnv for better type safety when accessing process.env
declare const process: {
  env: ProcessEnv;
};

const app = express();
// Determine the port from environment variables or default to 3000.
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

/**
 * Middleware to serve static files.
 * All files in the 'public' directory (e.g., index.html, style.css, script.js)
 * will be accessible directly from the root path.
 * The `path.join(__dirname, '..', 'public')` resolves to the `public` directory
 * relative to the compiled `dist/server.js` file.
 */
app.use(express.static(path.join(__dirname, '..', 'public')));

/**
 * Catch-all route to serve the `index.html` file.
 * This is crucial for single-page applications (SPAs) where client-side routing
 * handles different URL paths. If a requested path doesn't match a static file,
 * the server will send `index.html`, allowing the client-side router to take over.
 */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/**
 * Start the Express server and listen for incoming requests on the specified port.
 * Logs a message to the console indicating the server's operational status and address.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, '..', 'public')}`);
});

/**
 * Basic error handling for the server's listen operation.
 * Provides user-friendly messages for common server startup errors like
 * port in use or insufficient permissions.
 */
app.on('error', (error: NodeJS.ErrnoException) => {
  // Only handle errors specifically related to the `listen` syscall
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  // Check error codes and provide appropriate feedback
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1); // Exit with a failure code
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1); // Exit with a failure code
      break;
    default:
      throw error; // Re-throw unhandled errors
  }
});

// file: src/client/script.ts
/**
 * @file script.ts
 * @description Client-side TypeScript for the chatbot interface.
 * Handles user input, displays messages, simulates chatbot responses,
 * and includes basic responsiveness logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input') as HTMLInputElement;
  const sendButton = document.getElementById('send-button');

  // Validate that all required elements are present
  if (!chatMessages || !chatInput || !sendButton) {
    console.error('Error: Missing one or more required chat UI elements. ' +
                  'Please ensure "chat-messages", "chat-input", and "send-button" IDs exist in index.html.');
    return; // Stop execution if critical elements are missing
  }

  /**
   * Adds a new message bubble to the chat display area.
   * Scrolls to the bottom of the chat to show the latest message.
   * @param message The text content of the message to display.
   * @param sender Specifies who sent the message: 'user' or 'chatbot'.
   */
  function addMessage(message: string, sender: 'user' | 'chatbot'): void {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender); // Apply CSS classes for styling
    messageElement.textContent = message;

    chatMessages?.appendChild(messageElement); // Add the message to the chat container
    chatMessages?.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the newest message
  }

  /**
   * Simulates a chatbot's response based on the user's input.
   * In a production environment, this function would typically make an API call
   * to a backend service that handles natural language processing and generates responses.
   * @param userMessage The message typed by the user.
   * @returns A promise that resolves with the chatbot's response string.
   */
  async function getChatbotResponse(userMessage: string): Promise<string> {
    // Simulate a network delay to mimic real-world API latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // 0.5 to 1.5 seconds

    const lowerCaseMessage = userMessage.toLowerCase();

    // Simple keyword-based responses
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return 'Hello there! How can I help you today?';
    } else if (lowerCaseMessage.includes('how are you')) {
      return 'I am a chatbot, so I do not have feelings, but I am ready to assist you!';
    } else if (lowerCaseMessage.includes('help')) {
      return 'I can provide information, answer questions, or just chat. What do you need help with?';
    } else if (lowerCaseMessage.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    } else if (lowerCaseMessage.includes('date')) {
      return `Today's date is ${new Date().toLocaleDateString()}.`;
    } else if (lowerCaseMessage.includes('name')) {
      return 'I am a sample chatbot, you can call me Botty!';
    } else if (lowerCaseMessage.includes('goodbye') || lowerCaseMessage.includes('bye')) {
      return 'Goodbye! Have a great day!';
    } else {
      return "I'm not sure how to respond to that. Could you please rephrase or ask something else?";
    }
  }

  /**
   * Handles the action of sending a message.
   * This function is triggered when the send button is clicked or the Enter key is pressed.
   * It takes the user's input, displays it, clears the input field, and then
   * gets and displays a simulated chatbot response.
   */
  async function sendMessage(): Promise<void> {
    const messageText = chatInput.value.trim(); // Get and trim the input text
    if (messageText) { // Only send if the message is not empty
      addMessage(messageText, 'user'); // Display user's message
      chatInput.value = ''; // Clear the input field

      // Get and display chatbot's response
      const botResponse = await getChatbotResponse(messageText);
      addMessage(botResponse, 'chatbot');
    }
  }

  // --- Event Listeners ---
  sendButton.addEventListener('click', sendMessage); // Send message on button click

  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') { // Send message on Enter key press
      sendMessage();
    }
  });

  // --- Initial Setup ---
  // Display a welcome message from the chatbot when the page loads
  addMessage('Hello! How can I assist you today?', 'chatbot');

  /**
   * Applies basic responsiveness adjustments based on screen width.
   * While most responsiveness is handled by CSS media queries, this demonstrates
   * how TypeScript can be used for dynamic UI adjustments if needed.
   */
  function applyResponsiveness(): void {
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.classList.add('mobile-layout');
    } else {
      document.body.classList.remove('mobile-layout');
    }
  }

  // Apply responsiveness on page load and window resize events
  applyResponsiveness();
  window.addEventListener('resize', applyResponsiveness);
});

// file: public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot Frontend Interface</title>
    <!-- Link to the stylesheet for styling the chat interface -->
    <link rel="stylesheet" href="/style.css">
    <!-- Defer loading of JavaScript to ensure HTML content is parsed and rendered first -->
    <script defer src="/script.js"></script>
</head>
<body>
    <div class="chat-container">
        <!-- Header section of the chat interface -->
        <header class="chat-header">
            <h1>Sample Chatbot</h1>
        </header>

        <!-- Main section for displaying chat messages -->
        <main class="chat-main" id="chat-messages">
            <!-- Chat messages will be dynamically added here by script.js -->
        </main>

        <!-- Footer section with input field and send button -->
        <footer class="chat-footer">
            <input type="text" id="chat-input" placeholder="Type your message..." autocomplete="off">
            <button id="send-button">Send</button>
        </footer>
    </div>
</body>
</html>

// file: public/style.css
/* General Styling */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f2f5; /* Light grey background */
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh; /* Full viewport height */
    color: #333;
    -webkit-font-smoothing: antialiased; /* Smoother fonts on WebKit browsers */
    -moz-osx-font-smoothing: grayscale; /* Smoother fonts on Firefox */
}

/* Chat Container */
.chat-container {
    background-color: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
    width: 90%;
    max-width: 700px;
    height: 80vh; /* Occupy 80% of viewport height */
    max-height: 900px;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Hide overflow content */
    margin: 20px; /* Margin for spacing on smaller screens */
}

/* Chat Header */
.chat-header {
    background-color: #4a90e2; /* Vibrant blue header */
    color: #ffffff;
    padding: 18px 25px;
    text-align: center;
    font-size: 1.2em;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Subtle shadow */
}

.chat-header h1 {
    margin: 0;
    font-size: 1.5em;
    font-weight: 600;
}

/* Chat Main (Messages Display Area) */
.chat-main {
    flex-grow: 1; /* Allows it to take available vertical space */
    padding: 20px;
    overflow-y: auto; /* Enable vertical scrolling for messages */
    background-color: #f9fbfd; /* Very light blue background for chat area */
    display: flex;
    flex-direction: column;
    gap: 12px; /* Space between messages */
}

/* Individual Chat Message Bubble */
.chat-message {
    max-width: 80%; /* Messages take up to 80% of chat width */
    padding: 12px 18px;
    border-radius: 20px; /* Rounded corners for bubbles */
    line-height: 1.4;
    word-wrap: break-word; /* Ensure long words wrap within the bubble */
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08); /* Subtle shadow for message bubbles */
}

.chat-message.user {
    align-self: flex-end; /* Align user messages to the right */
    background-color: #e3f2fd; /* Light blue for user messages */
    color: #3f51b5; /* Darker blue text */
    border-bottom-right-radius: 4px; /* Slight adjustment for visual balance */
}

.chat-message.chatbot {
    align-self: flex-start; /* Align chatbot messages to the left */
    background-color: #e8f5e9; /* Light green for chatbot messages */
    color: #2e7d32; /* Darker green text */
    border-bottom-left-radius: 4px; /* Slight adjustment for visual balance */
}

/* Chat Footer (Input Area) */
.chat-footer {
    display: flex;
    padding: 15px 20px;
    border-top: 1px solid #e0e0e0; /* Separator line */
    background-color: #ffffff;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

.chat-footer #chat-input {
    flex-grow: 1; /* Allows input field to take available space */
    border: 1px solid #ccc;
    border-radius: 25px; /* Pill-shaped input field */
    padding: 12px 18px;
    font-size: 1em;
    outline: none; /* Remove default focus outline */
    transition: border-color 0.3s ease; /* Smooth transition for border color */
}

.chat-footer #chat-input:focus {
    border-color: #4a90e2; /* Blue border on focus */
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2); /* Soft blue glow on focus */
}

.chat-footer #send-button {
    background-color: #4a90e2; /* Blue send button */
    color: #ffffff;
    border: none;
    border-radius: 25px; /* Pill-shaped button */
    padding: 12px 25px;
    margin-left: 10px;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease; /* Smooth transitions for hover/active */
    min-width: 80px; /* Ensure button doesn't get too small */
}

.chat-footer #send-button:hover {
    background-color: #357ABD; /* Slightly darker blue on hover */
    transform: translateY(-1px); /* Slight lift effect */
}

.chat-footer #send-button:active {
    background-color: #286090; /* Even darker blue on click */
    transform: translateY(0); /* Return to original position */
}

/* --- Responsiveness --- */

/* For screens up to 768px wide (typical tablets in portrait) */
@media (max-width: 768px) {
    .chat-container {
        width: 100%;
        height: 100vh; /* Full viewport height */
        margin: 0; /* Remove margin */
        border-radius: 0; /* No rounded corners */
        box-shadow: none; /* No shadow */
    }

    .chat-header, .chat-footer {
        border-radius: 0; /* No rounded corners */
    }

    .chat-message {
        max-width: 90%; /* Messages can take more width on smaller screens */
    }

    /* Additional adjustment via JS-added class if needed */
    body.mobile-layout .chat-header h1 {
        font-size: 1.3em;
    }
}

/* For screens up to 480px wide (typical smartphones) */
@media (max-width: 480px) {
    .chat-footer {
        flex-direction: column; /* Stack input and button vertically */
        gap: 10px;
        padding: 10px;
    }

    .chat-footer #chat-input {
        margin-right: 0;
        width: calc(100% - 24px); /* Full width minus padding */
    }

    .chat-footer #send-button {
        margin-left: 0;
        width: 100%; /* Full width */
    }
}
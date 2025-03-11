// User name storage
let userName = "";

// Function to submit user's name
function submitName() {
    const nameInput = document.getElementById('name-input');
    userName = nameInput.value.trim();
    
    if (userName) {
        // Hide name input section
        document.getElementById('name-input-section').style.display = 'none';
        document.getElementById('header').style.display = 'none';
        
        // Show typing indicator briefly
        const typingIndicator = document.getElementById('typing-indicator');
        document.getElementById('chat-container').style.display = 'flex';
        typingIndicator.style.display = 'flex';
        
        // After a short delay, show welcome message
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            addBotMessage(`Hi ${userName}! It's nice to meet you. How can I help you today?`);
        }, 1500);
    }
}

// Function to send user message
function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message) {
        // Add user message to chat
        addUserMessage(message);
        userInput.value = '';
        
        // Show typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.style.display = 'flex';
        
        // Send message to Rasa server
        fetchRasaResponse(message);
    }
}

// Function to fetch response from Rasa server
function fetchRasaResponse(userMessage) {
    const rasaEndpoint = "https://ec2-54-215-250-133.us-west-1.compute.amazonaws.com:5005/webhooks/rest/webhook";
    const typingIndicator = document.getElementById('typing-indicator');

    fetch(rasaEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sender: userName || "user",
            message: userMessage,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Hide typing indicator
        typingIndicator.style.display = 'none';
        
        if (data && data.length > 0) {
            addBotMessage(data[0].text); // Use our existing function to add the message
        } else {
            addBotMessage("I didn't get a response. Can you try again?");
        }
    })
    .catch(error => {
        console.error("Error fetching Rasa response:", error);
        typingIndicator.style.display = 'none';
        
        // Use fallback response if Rasa fails
        fallbackBotResponse(userMessage);
    });
}

// Fallback response function if Rasa is unavailable
function fallbackBotResponse(userMessage) {
    const lowercaseMessage = userMessage.toLowerCase();
    let response;
    
    // Simple response logic
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
        response = `Hello again, ${userName}! How can I assist you?`;
    } else if (lowercaseMessage.includes('how are you')) {
        response = "I'm doing great, thanks for asking! How about you?";
    } else if (lowercaseMessage.includes('help')) {
        response = "I'm here to help! You can ask me questions or just chat with me.";
    } else if (lowercaseMessage.includes('bye') || lowercaseMessage.includes('goodbye')) {
        response = `Goodbye, ${userName}! Have a great day!`;
    } else {
        // Default responses
        const defaultResponses = [
            `That's interesting, ${userName}. Tell me more about it.`,
            `I understand. Is there anything specific you'd like to discuss?`,
            `Sorry, I'm currently having trouble connecting to my brain. Can you try again in a moment?`,
            `I'm learning more about you, ${userName}. Please continue.`,
            `That's good to know. What else would you like to talk about?`
        ];
        response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    addBotMessage(response);
}

// Function to add user message to chat
function addUserMessage(message) {
    const chatDisplay = document.getElementById('chat-display');
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    
    const messageText = document.createElement('div');
    messageText.textContent = message;
    
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = getCurrentTime();
    
    messageElement.appendChild(messageText);
    messageElement.appendChild(timeElement);
    
    chatDisplay.appendChild(messageElement);
    scrollToBottom();
}

// Function to add bot message to chat
function addBotMessage(message) {
    const chatDisplay = document.getElementById('chat-display');
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot-message';
    
    const messageText = document.createElement('div');
    messageText.textContent = message;
    
    const timeElement = document.createElement('div');
    timeElement.className = 'message-time';
    timeElement.textContent = getCurrentTime();
    
    messageElement.appendChild(messageText);
    messageElement.appendChild(timeElement);
    
    chatDisplay.appendChild(messageElement);
    scrollToBottom();
}

// Function to get current time in HH:MM format
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // If hour is 0, make it 12
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${minutes} ${ampm}`;
}

// Function to scroll chat to bottom
function scrollToBottom() {
    const chatDisplay = document.getElementById('chat-display');
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Event listener for page load
document.addEventListener('DOMContentLoaded', function() {
    // Make sure the chat container is properly styled
    const chatContainer = document.getElementById('chat-container');
    chatContainer.style.display = 'none';  // Ensure it's hidden initially
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.flex = '1';
});

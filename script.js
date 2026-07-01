document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // Bot responses
    const botResponses = {
        greeting: [
            "Hello there! How are you doing today?",
            "Hi! It's nice to meet you! How are you feeling?",
            "Hey! How are things going with you?"
        ],
        mood: [
            "That sounds interesting! Tell me more about it.",
            "I'm glad to hear that! What made you feel this way?",
            "I understand. What can I do to help you feel better?",
            "That's great to hear! What are you most excited about?"
        ],
        loneliness: [
            "I understand how lonely you might feel sometimes. It's okay to feel that way.",
            "Being lonely is hard, but remember that you're not alone in feeling this way.",
            "It's normal to feel lonely sometimes. Would you like to talk about what's bothering you?",
            "I'm here for you. Sometimes talking helps, and I'm happy to listen."
        ],
        friendship: [
            "Friendship is one of life's greatest gifts!",
            "True friends are rare and special. What makes a good friend in your opinion?",
            "Having a friend who truly understands you is wonderful.",
            "Would you like to share what friendship means to you?"
        ],
        encouragement: [
            "You're doing great! Remember that every day brings new opportunities.",
            "Believe in yourself! You have so much potential.",
            "It's okay to have tough days. Tomorrow is a new beginning.",
            "You matter, and your feelings are valid."
        ],
        default: [
            "That's interesting! Tell me more about it.",
            "I see. How does that make you feel?",
            "Thanks for sharing that with me!",
            "I'm here to listen whenever you want to chat."
        ]
    };

    // Function to add a message to the chat
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to get a random response
    function getRandomResponse(key) {
        const responses = botResponses[key];
        if (responses && responses.length > 0) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
        return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
    }

    // Function to process user input and generate bot response
    function processUserInput(input) {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            return getRandomResponse('greeting');
        } else if (lowerInput.includes('sad') || lowerInput.includes('depressed') || 
                   lowerInput.includes('lonely') || lowerInput.includes('alone')) {
            return getRandomResponse('loneliness');
        } else if (lowerInput.includes('friend') || lowerInput.includes('friendship')) {
            return getRandomResponse('friendship');
        } else if (lowerInput.includes('good') || lowerInput.includes('great') || 
                   lowerInput.includes('happy') || lowerInput.includes('excited')) {
            return getRandomResponse('mood');
        } else if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
            return "You're welcome! Is there anything else I can help with?";
        } else if (lowerInput.includes('help')) {
            return "I'm here to chat and listen. What would you like to talk about?";
        } else {
            return getRandomResponse('default');
        }
    }

    // Function to handle sending a message
    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            
            // Simulate bot thinking
            setTimeout(() => {
                const response = processUserInput(message);
                addMessage(response);
            }, 500);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial bot message
    setTimeout(() => {
        addMessage("I'm here to be your friend and chat whenever you need someone to talk to!");
    }, 1000);
});

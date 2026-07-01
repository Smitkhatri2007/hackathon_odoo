document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const autoChatButton = document.getElementById('autoChatButton');
    const summaryButton = document.getElementById('summaryButton');
    const resetButton = document.getElementById('resetButton');

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

    // Conversation history
    let conversationHistory = [];
    let autoChatInterval = null;
    
    // Auto chat topics
    const autoChatTopics = [
        "How was your day?",
        "What are you up to today?",
        "Do you have any plans for the weekend?",
        "What's something you're looking forward to?",
        "How do you usually spend your free time?",
        "What's the best part of being a friend?",
        "What makes you feel happy?",
        "How can I help you today?"
    ];

    // Function to add a message to the chat
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to conversation history
        conversationHistory.push({
            text: text,
            isUser: isUser,
            timestamp: new Date()
        });
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

    // Function to start auto chat
    function startAutoChat() {
        if (autoChatInterval) return;
        
        autoChatButton.textContent = "Stop Auto Chat";
        autoChatInterval = setInterval(() => {
            const randomTopic = autoChatTopics[Math.floor(Math.random() * autoChatTopics.length)];
            addMessage(randomTopic, false);
            
            // Simulate user response after a delay
            setTimeout(() => {
                const responses = [
                    "That's interesting!",
                    "I see what you mean.",
                    "Thanks for sharing that with me.",
                    "I'm glad to hear that!",
                    "That sounds fun!"
                ];
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                addMessage(randomResponse, true);
            }, 1000 + Math.random() * 2000);
        }, 5000); // Send a message every 5 seconds
    }

    // Function to stop auto chat
    function stopAutoChat() {
        if (autoChatInterval) {
            clearInterval(autoChatInterval);
            autoChatInterval = null;
            autoChatButton.textContent = "Start Auto Chat";
        }
    }

    // Function to generate summary
    function generateSummary() {
        if (conversationHistory.length === 0) {
            alert("No conversation to summarize yet!");
            return;
        }

        // Create a summary container
        let summaryContainer = document.querySelector('.summary-container');
        if (!summaryContainer) {
            summaryContainer = document.createElement('div');
            summaryContainer.className = 'summary-container';
            summaryContainer.id = 'summaryContainer';
            document.querySelector('.chat-container').appendChild(summaryContainer);
        }

        // Simple summary logic based on conversation
        let summaryText = "Conversation Summary:\n\n";
        
        // Count user vs bot messages
        const userMessages = conversationHistory.filter(msg => msg.isUser);
        const botMessages = conversationHistory.filter(msg => !msg.isUser);
        
        summaryText += `Total messages: ${conversationHistory.length}\n`;
        summaryText += `Your messages: ${userMessages.length}\n`;
        summaryText += `Bot messages: ${botMessages.length}\n\n`;
        
        // Analyze sentiment
        const positiveKeywords = ['happy', 'good', 'great', 'excited', 'love', 'like'];
        const negativeKeywords = ['sad', 'depressed', 'lonely', 'alone', 'bad', 'angry'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        conversationHistory.forEach(msg => {
            const lowerMsg = msg.text.toLowerCase();
            positiveKeywords.forEach(word => {
                if (lowerMsg.includes(word)) positiveCount++;
            });
            negativeKeywords.forEach(word => {
                if (lowerMsg.includes(word)) negativeCount++;
            });
        });
        
        summaryText += `Sentiment Analysis:\n`;
        if (positiveCount > negativeCount) {
            summaryText += "Overall: Positive\n";
        } else if (negativeCount > positiveCount) {
            summaryText += "Overall: Negative\n";
        } else {
            summaryText += "Overall: Neutral\n";
        }
        
        summaryText += `Positive mentions: ${positiveCount}\n`;
        summaryText += `Negative mentions: ${negativeCount}\n\n`;
        
        // Key topics
        const topics = [];
        conversationHistory.forEach(msg => {
            const lowerMsg = msg.text.toLowerCase();
            if (lowerMsg.includes('friend')) topics.push('friendship');
            if (lowerMsg.includes('day')) topics.push('daily life');
            if (lowerMsg.includes('weekend')) topics.push('weekend plans');
            if (lowerMsg.includes('happy') || lowerMsg.includes('excited')) topics.push('positive feelings');
        });
        
        if (topics.length > 0) {
            summaryText += `Key topics discussed: ${Array.from(new Set(topics)).join(', ')}\n`;
        }
        
        summaryContainer.textContent = summaryText;
        summaryContainer.style.display = 'block';
    }

    // Function to reset conversation
    function resetConversation() {
        stopAutoChat();
        conversationHistory = [];
        chatMessages.innerHTML = '<div class="message bot-message">Hello! I\'m your friendly chatbot. How are you feeling today?</div>';
        const summaryContainer = document.getElementById('summaryContainer');
        if (summaryContainer) {
            summaryContainer.style.display = 'none';
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    autoChatButton.addEventListener('click', function() {
        if (autoChatInterval) {
            stopAutoChat();
        } else {
            startAutoChat();
        }
    });

    summaryButton.addEventListener('click', generateSummary);
    resetButton.addEventListener('click', resetConversation);

    // Initial bot message
    setTimeout(() => {
        addMessage("I'm here to be your friend and chat whenever you need someone to talk to!");
    }, 1000);
});

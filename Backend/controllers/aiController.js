const { generateAIResponse } = require('../utils/aiUtils');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * @desc    Natural language property search
 * @route   POST /api/ai/search
 * @access  Private
 */
exports.search = async (req, res, next) => {
  try {
    const { query } = req.body;
    const response = await generateAIResponse(query, req.user.id);

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI search error:', error);
    next(error);
  }
};

/**
 * @desc    Chat with AI assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, req.user.id);
    
    // Find or create AI conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation || conversation.type !== 'ai_chat') {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
    } else {
      conversation = await Conversation.create({
        participants: [req.user.id],
        type: 'ai_chat',
        lastMessage: message,
        lastMessageAt: new Date()
      });
    }

    // Save user message
    const userMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      content: message,
      messageType: 'text',
      isAI: false
    });

    // Save AI response
    const aiMessage = await Message.create({
      conversation: conversation._id,
      sender: req.user.id, // AI messages are associated with user
      content: aiResponse.message,
      messageType: aiResponse.type === 'property_search' ? 'property_suggestion' : 'ai_response',
      isAI: true,
      metadata: {
        responseType: aiResponse.type,
        properties: aiResponse.properties || []
      }
    });

    // Update conversation
    conversation.lastMessage = aiResponse.message;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      data: {
        conversation: conversation,
        userMessage: userMessage,
        aiMessage: aiMessage,
        response: aiResponse
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    next(error);
  }
};


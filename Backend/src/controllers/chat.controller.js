const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');

let _geminiVisionClient = null;

function getGeminiVisionClient() {
    if (_geminiVisionClient) return _geminiVisionClient;

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) return null;

    _geminiVisionClient = new GoogleGenAI({ apiKey });
    return _geminiVisionClient;
}

async function extractImageTextWithGemini(file) {
    const client = getGeminiVisionClient();
    if (!client || !file?.buffer) return '';

    try {
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: 'Extract all visible readable text from this image. If text is not clear, provide a concise description of important visual content for AI context.',
                        },
                        {
                            inlineData: {
                                mimeType: file.mimetype || 'image/png',
                                data: file.buffer.toString('base64'),
                            },
                        },
                    ],
                },
            ],
        });

        return String(response?.text || '').trim();
    } catch (error) {
        console.warn(`Image parse failed for ${file?.originalname}:`, error.message);
        return '';
    }
}

function safeDecodeBuffer(buffer) {
    if (!buffer) return '';
    const text = buffer.toString('utf8');
    return text.replace(/\u0000/g, '').trim();
}

async function extractFileText(file) {
    const ext = (file?.originalname || '').toLowerCase();
    const mime = file?.mimetype || '';

    if (mime === 'application/pdf' || ext.endsWith('.pdf')) {
        try {
            const parsed = await pdfParse(file.buffer);
            return String(parsed?.text || '').trim();
        } catch (err) {
            console.warn(`PDF parse failed for ${file?.originalname}:`, err.message);
            return '';
        }
    }

    if (mime.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].some((x) => ext.endsWith(x))) {
        return extractImageTextWithGemini(file);
    }

    return safeDecodeBuffer(file?.buffer);
}

async function summarizeFile(file) {
    const raw = await extractFileText(file);
    const fileName = file?.originalname || 'unknown';
    const ext = (fileName || '').toLowerCase();
    const mime = file?.mimetype || '';
    const isImage = mime.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].some((x) => ext.endsWith(x));

    if (!raw) {
        if (isImage) {
            const fallback = `[IMAGE UPLOADED: ${fileName}]\nNo clear text could be extracted from this image. If needed, ask the user to upload a clearer screenshot or paste the text manually.`;
            return {
                fileName,
                content: fallback,
                chars: fallback.length,
                skipped: false,
                reason: 'Image OCR returned empty text',
            };
        }

        return {
            fileName,
            content: '',
            chars: 0,
            skipped: true,
            reason: 'File is empty or unreadable as UTF-8 text',
        };
    }

    const clipped = raw.slice(0, 6000);
    return {
        fileName,
        content: clipped,
        chars: clipped.length,
        skipped: false,
    };
}

async function createChat(req, res) {
    const { title } = req.body;

    const user = req.user;
    const chat = await chatModel.create({
        user: user._id,
        title: title
    })
    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            user: chat.user,
            lastActivity: chat.lastActivity
        }
    })
}

async function getUserChats(req, res) {
    try {
        const chats = await chatModel.find({ user: req.user._id }).sort({ updatedAt: -1 }).lean();
        res.status(200).json({ chats });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch chats" });
    }
}

async function getChatMessages(req, res) {
    try {
        const messages = await messageModel.find({ chat: req.params.chatId, user: req.user._id })
            .sort({ createdAt: 1 }).lean();
        res.status(200).json({ messages });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
}

async function updateChatTitle(req, res) {
    try {
        const { title } = req.body;
        const chat = await chatModel.findOneAndUpdate(
            { _id: req.params.chatId, user: req.user._id },
            { title },
            { new: true }
        ).lean();
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        res.status(200).json({ chat });
    } catch (err) {
        res.status(500).json({ message: "Failed to update chat title" });
    }
}

async function uploadContextFiles(req, res) {
    try {
        const files = Array.isArray(req.files) ? req.files : [];
        if (!files.length) {
            return res.status(400).json({ message: 'No files were uploaded' });
        }

        const parsed = await Promise.all(files.map(summarizeFile));
        const usable = parsed.filter((f) => !f.skipped && f.content);

        if (!usable.length) {
            return res.status(400).json({
                message: 'No readable text found in uploaded files',
                files: parsed,
            });
        }

        return res.status(200).json({
            message: 'Files processed successfully',
            files: parsed,
            combinedContext: usable
                .map((f) => `FILE: ${f.fileName}\n${f.content}`)
                .join('\n\n-----\n\n')
                .slice(0, 14000),
        });
    } catch (error) {
        console.error('uploadContextFiles error:', error.message);
        return res.status(500).json({ message: 'Failed to process uploaded files' });
    }
}

module.exports = { createChat, getUserChats, getChatMessages, updateChatTitle, uploadContextFiles };
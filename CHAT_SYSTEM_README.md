# Chat System - Implementation Complete ✅

This document provides comprehensive documentation for the real-time chat system implemented in the Online Tutoring Platform.

## 🎯 Overview

The chat system enables real-time communication between students and tutors with support for:
- **Direct messaging** (1-on-1 conversations)
- **Group chats** (class-based group conversations)
- **Real-time features**: typing indicators, online status, read receipts
- **Message management**: edit, delete, pagination
- **File sharing** support (images and documents)

## 📁 Architecture

### Backend (Node.js + Express + Socket.io + Prisma)

```
backend/
├── prisma/
│   └── schema.prisma          # Database models: Chat, ChatParticipant, Message
├── src/
│   ├── socket/
│   │   └── socketServer.ts    # WebSocket server (Socket.io)
│   ├── services/
│   │   └── chat.service.ts    # Business logic (10 methods)
│   ├── controllers/
│   │   └── chat.controller.ts # HTTP request handlers (10 endpoints)
│   ├── routes/
│   │   └── chat.routes.ts     # REST API routes
│   └── index.ts               # Server integration
```

### Frontend (React + TypeScript + Socket.io-client)

```
frontend/
├── src/
│   ├── context/
│   │   └── SocketContext.tsx  # WebSocket connection management
│   ├── api/
│   │   └── chat.api.ts        # HTTP API client (10 methods)
│   ├── components/Chat/
│   │   ├── ChatList.tsx       # List of conversations
│   │   ├── ChatList.css
│   │   ├── ChatWindow.tsx     # Main chat interface
│   │   ├── ChatWindow.css
│   │   ├── MessageBubble.tsx  # Individual message display
│   │   └── MessageBubble.css
│   ├── pages/
│   │   ├── ChatPage.tsx       # Main chat page
│   │   └── ChatPage.css
│   └── App.tsx                # Routes and SocketProvider integration
```

## 🗄️ Database Schema

### Chat Model
```prisma
model Chat {
  chat_id      String            @id @default(uuid)
  type         ChatType          // 'direct' or 'group'
  name         String?           // Group name (null for direct)
  class_id     String?           // For group chats linked to classes
  created_at   DateTime          @default(now())
  updated_at   DateTime          @updatedAt
  Class        Class?            @relation(...)
  participants ChatParticipant[]
  messages     Message[]
}
```

### ChatParticipant Model
```prisma
model ChatParticipant {
  id        String    @id @default(uuid)
  chat_id   String
  user_id   String
  joined_at DateTime  @default(now())
  last_read DateTime?
  chat      Chat      @relation(...)
  User      User      @relation(...)
  @@unique([chat_id, user_id])
}
```

### Message Model
```prisma
model Message {
  message_id   String      @id @default(uuid)
  chat_id      String
  sender_id    String
  content      String
  message_type MessageType @default(text)  // text, file, image
  file_url     String?
  file_name    String?
  is_read      Boolean     @default(false)
  created_at   DateTime    @default(now())
  edited_at    DateTime?
  chat         Chat        @relation(...)
  User         User        @relation(...)
  @@index([chat_id, created_at])
}
```

## 🔌 API Endpoints

### REST API (HTTP)

Base URL: `http://localhost:5000/api/chat`

All endpoints require Firebase authentication token in header:
```
Authorization: Bearer <firebase_token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats` | Get all user's chats |
| GET | `/chats/:chatId` | Get chat details |
| GET | `/chats/:chatId/messages` | Get messages (paginated) |
| POST | `/chats/direct` | Create direct chat |
| POST | `/chats/group` | Create group chat (Mass tutors only) |
| GET | `/unread-count` | Get unread message count |
| POST | `/chats/:chatId/participants` | Add participant to group |
| DELETE | `/chats/:chatId/participants/:userId` | Remove participant |
| DELETE | `/messages/:messageId` | Delete message (own only) |
| PUT | `/messages/:messageId` | Edit message (own only) |

### WebSocket Events (Socket.io)

Connection URL: `http://localhost:5000`

**Client → Server (Emit):**
- `send_message` - Send new message
- `typing` - Send typing indicator
- `mark_as_read` - Mark messages as read
- `join_chat` - Join specific chat room
- `leave_chat` - Leave chat room

**Server → Client (Listen):**
- `new_message` - Receive new message
- `user_typing` - Someone is typing
- `messages_read` - Messages marked as read
- `user_status_change` - User online/offline
- `message_error` - Error occurred

## 🚀 Getting Started

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Generate Prisma client:**
```bash
npx prisma generate
```

3. **Run migrations (if needed):**
```bash
npx prisma migrate dev
```

4. **Start server:**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment variables:**
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

3. **Start development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 💻 Usage Examples

### Creating a Direct Chat

**HTTP Request:**
```typescript
import { chatApi } from '../api/chat.api';

const chat = await chatApi.createDirectChat('target_user_id');
```

**Response:**
```json
{
  "success": true,
  "chat": {
    "chat_id": "uuid",
    "type": "direct",
    "participants": [...],
    "messages": []
  }
}
```

### Sending a Message

**WebSocket (Real-time):**
```typescript
import { useSocket } from '../context/SocketContext';

const { sendMessage } = useSocket();

sendMessage('chat_id', 'Hello!', 'text');
```

### Receiving Messages

**WebSocket Listener:**
```typescript
const { onNewMessage } = useSocket();

useEffect(() => {
  const unsubscribe = onNewMessage((message) => {
    console.log('New message:', message);
    // Update UI
  });
  
  return unsubscribe;
}, []);
```

### Typing Indicator

```typescript
const { sendTyping } = useSocket();

// Start typing
sendTyping('chat_id', true);

// Stop typing (after 3 seconds of inactivity)
setTimeout(() => {
  sendTyping('chat_id', false);
}, 3000);
```

## 🎨 UI Components

### ChatPage
Main container combining ChatList and ChatWindow in a split-pane layout.

### ChatList
Displays all user conversations with:
- User avatars
- Last message preview
- Unread message count badges
- Online status indicators
- Timestamp

### ChatWindow
Main chat interface with:
- Message history (scrollable)
- Real-time message updates
- Typing indicators
- Message input with send button
- Online status display

### MessageBubble
Individual message display with:
- Sender avatar and name
- Message content
- Timestamp
- Edit/delete buttons (own messages)
- Read receipts
- File attachments

## 🔐 Authentication

All chat features require Firebase authentication:

1. User authenticates via Firebase
2. Firebase token sent with Socket.io connection
3. Backend verifies token and attaches user info to socket
4. User automatically joins their chat rooms

## 🧪 Testing

### Manual Testing Steps

1. **Create accounts:**
   - Sign up 2+ users (student + tutor)

2. **Test direct chat:**
   - Student navigates to `/chat`
   - Start conversation with tutor
   - Send messages back and forth

3. **Test group chat:**
   - Mass tutor creates a class
   - Students enroll in class
   - Tutor creates group chat
   - All participants can send messages

4. **Test real-time features:**
   - Open chat in 2 browser windows
   - Type in one → see typing indicator in other
   - Send message → appears instantly
   - Mark as read → see read receipt

5. **Test message management:**
   - Edit own message
   - Delete own message
   - Try editing other's message (should fail)

### API Testing with Postman

1. **Get Firebase token:**
   - Authenticate user in frontend
   - Copy token from browser DevTools

2. **Test endpoints:**
```bash
# Get user chats
GET http://localhost:5000/api/chat/chats
Authorization: Bearer <token>

# Create direct chat
POST http://localhost:5000/api/chat/chats/direct
Authorization: Bearer <token>
Content-Type: application/json
{
  "targetUserId": "user_uuid"
}

# Get messages
GET http://localhost:5000/api/chat/chats/{chat_id}/messages?limit=50&offset=0
Authorization: Bearer <token>
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'chat/chatParticipant/message'"

**Solution:** Regenerate Prisma client
```bash
cd backend
npx prisma generate
```

### Issue: WebSocket not connecting

**Checks:**
1. Backend server running?
2. Socket.io URL correct in frontend env?
3. Firebase token valid?
4. CORS configured for frontend URL?

**Debug:**
```typescript
// In SocketContext.tsx
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Issue: Messages not appearing in real-time

**Checks:**
1. Socket connected? Check `isConnected` state
2. Joined chat room? Call `joinChat(chatId)`
3. Listening to `new_message` event?

**Debug:**
```typescript
const { socket } = useSocket();
console.log('Socket ID:', socket?.id);
console.log('Connected:', socket?.connected);
```

### Issue: Read receipts not working

**Solution:** Ensure `markAsRead()` called when:
- Chat window opened
- New message received (not own)
- User scrolls to bottom

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://...
FIREBASE_PROJECT_ID=your-project-id
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### CORS Configuration

Update `backend/src/index.ts`:
```typescript
const allowlist = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
];
```

## 📊 Performance Considerations

1. **Message Pagination:** Loads 50 messages at a time
2. **Auto-reconnection:** Socket.io retries up to 5 times
3. **Debounced typing:** Stops after 3s inactivity
4. **Efficient queries:** Indexed by `[chat_id, created_at]`
5. **Lazy loading:** Components load on demand

## 🚀 Future Enhancements

- [ ] File upload to cloud storage (AWS S3 / Firebase Storage)
- [ ] Voice messages
- [ ] Video calls integration
- [ ] Message reactions (emoji)
- [ ] Message search
- [ ] Chat archiving
- [ ] Push notifications
- [ ] Message forwarding
- [ ] Read receipts per participant (group chats)
- [ ] Message delivery status

## 📝 Notes

- Direct chats created automatically when needed
- Group chats require manual creation by tutor
- Messages soft-deletable (can be restored)
- All timestamps in UTC
- File URLs stored but upload not implemented yet
- Chat participants must be enrolled in class (for group)

## 🤝 Contributing

When adding features:
1. Update database schema if needed
2. Add service methods
3. Create controller/routes
4. Update frontend API client
5. Update UI components
6. Add documentation
7. Test thoroughly

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review error logs (backend console)
- Inspect network requests (browser DevTools)
- Verify authentication tokens

---

**Implementation Date:** October 2025  
**Version:** 1.0.0  
**Status:** ✅ Complete and Functional

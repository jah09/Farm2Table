# Farm2Table MVP

A modern farm-to-table marketplace connecting local producers with consumers, featuring AI-powered recommendations and intelligent conversation management.

## Features

- 🌱 Producer dashboard for managing produce listings
- 🛒 Consumer marketplace with AI-powered recommendations
- 🤖 OpenAI integration for intelligent produce suggestions
- 💬 AI conversation storage and analytics
- 📚 Knowledge base management with embeddings
- 🔍 Semantic search with vector embeddings
- 📱 Mobile-friendly responsive design
- 🔐 Secure authentication with JWT
- 💾 MongoDB database with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **AI**: OpenAI GPT-3.5-turbo, text-embedding-3-small
- **UI Components**: shadcn/ui, Radix UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- OpenAI API key

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd farm2table-mvp
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your environment variables:
- `DATABASE_URL`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `OPENAI_API_KEY`: Your OpenAI API key

4. Set up the database
\`\`\`bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# Seed knowledge base
npm run db:seed-knowledge
\`\`\`

5. Start the development server
\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Sample Accounts

After seeding, you can use these accounts:

**Producers:**
- Email: `juan@farm.com` / Password: `password123`
- Email: `maria@farm.com` / Password: `password123`

**Consumer:**
- Email: `customer@example.com` / Password: `password123`

## Database Schema

The application uses the following main models:

- **User**: Stores user accounts (producers and consumers)
- **Produce**: Product listings from producers with AI-generated descriptions and embeddings
- **Order**: Customer orders
- **OrderItem**: Individual items within orders
- **AIConversation**: Enhanced conversation logs with context and metadata
- **KnowledgeBase**: Structured knowledge entries with embeddings for AI responses

## AI Features

### Conversation Management
- **Session-based conversations**: Track user interactions across sessions
- **Context awareness**: AI considers user preferences, location, and conversation history
- **Metadata tracking**: Store response times, recommended categories, and user interactions
- **Analytics**: View conversation insights, popular questions, and user engagement

### Knowledge Base
- **Semantic search**: Find relevant knowledge using vector embeddings
- **Category organization**: Organize knowledge by farming, nutrition, recipes, storage, etc.
- **Tag system**: Flexible tagging for better categorization
- **Producer management**: Producers can add and manage knowledge entries

### Enhanced Recommendations
- **Semantic similarity**: Find produce using natural language queries
- **Context-aware suggestions**: Consider user location, season, and preferences
- **Knowledge integration**: AI responses include relevant farming and nutrition information
- **Real-time learning**: System improves recommendations based on conversation patterns

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Produce
- `GET /api/produce` - Get all active produce
- `POST /api/produce` - Create new produce (producers only)

### AI Assistant
- `POST /api/ai/recommend` - Get AI recommendations with context
- `GET /api/conversations` - Get conversation history
- `GET /api/knowledge` - Search knowledge base
- `POST /api/knowledge` - Create knowledge entry

## Development

### Database Management

\`\`\`bash
# View database in Prisma Studio
npm run db:studio

# Reset database and reseed
npm run db:push --force-reset
npm run db:seed
npm run db:seed-knowledge
\`\`\`

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── ai/           # AI recommendation endpoints
│   │   ├── conversations/ # Conversation history
│   │   └── knowledge/    # Knowledge base management
│   ├── consumer/          # Consumer pages
│   ├── producer/          # Producer pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── consumer/         # Consumer-specific components
│   ├── producer/         # Producer-specific components
│   │   ├── knowledge-base-manager.tsx    # Knowledge base management
│   │   └── conversation-analytics.tsx    # Conversation insights
│   ├── shared/           # Shared components
│   └── ui/               # UI components (shadcn)
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── openai.ts         # OpenAI integration with conversation management
│   ├── embeddings.ts     # Vector embedding utilities
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
│   ├── seed.ts           # Sample produce data
│   └── seed-knowledge.ts # Knowledge base seeding
└── public/               # Static assets
\`\`\`

## AI Conversation Features

### For Consumers
- **Natural language queries**: Ask questions like "What's good for juicing?"
- **Contextual responses**: AI remembers your preferences and previous questions
- **Semantic search**: Find produce using natural descriptions
- **Personalized recommendations**: Based on location, season, and dietary preferences

### For Producers
- **Knowledge management**: Add farming tips, nutrition info, and recipes
- **Conversation analytics**: See what customers are asking about
- **Market insights**: Understand customer preferences and trends
- **AI-enhanced listings**: Automatically generate rich product descriptions

## Deployment

1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Deploy to Vercel or your preferred platform
3. Set environment variables in your deployment platform
4. Run database migrations: `npm run db:push`
5. Seed with sample data: `npm run db:seed && npm run db:seed-knowledge`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

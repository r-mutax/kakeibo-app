# GitHub Copilot Instructions for Kakeibo App

## Project Overview

This is a **Kakeibo** (家計簿) application - a Japanese-style household budget and expense tracking web application. The project helps users manage their personal finances by tracking income, expenses, and categorizing transactions.

## Technology Stack

### Core Technologies
- **Next.js** (v15.4.6) - React framework for web application
- **React** (v19.1.1) - Frontend UI library
- **TypeScript** (v5.9.2) - Type-safe JavaScript
- **Prisma** (v6.13.0) - Database ORM and query builder
- **SQLite** - Database for development

### Development Environment
- **Node.js** - Runtime environment
- **npm** - Package manager
- **Dev Container** support available

## Database Schema

The application uses Prisma with SQLite and has three main models:

### User Model
- `id`: Primary key (auto-increment)
- `passcodeHash`: Encrypted passcode for authentication
- `entries`: One-to-many relationship with Entry records

### Category Model
- `id`: Primary key (auto-increment)
- `name`: Category name (e.g., "Food", "Transportation")
- `color`: Optional color for UI display
- `order`: Optional display order
- `entries`: One-to-many relationship with Entry records

### Entry Model
- `id`: Primary key (auto-increment)
- `date`: Transaction date
- `type`: "income" or "expense"
- `amount`: Transaction amount (integer, likely in smallest currency unit)
- `note`: Optional transaction description
- `categoryId`: Foreign key to Category (optional)
- `userId`: Foreign key to User (required)
- `createdAt`: Auto-generated creation timestamp
- `updatedAt`: Auto-updated modification timestamp

## Project Structure

```
.
├── .devcontainer/          # Development container configuration
├── .github/               # GitHub workflows and templates
│   ├── ISSUE_TEMPLATE/    # Issue templates
│   └── workflows/         # CI/CD and Copilot integration
├── prisma/               # Database schema and migrations
│   ├── migrations/       # Database migration files
│   ├── schema.prisma     # Prisma schema definition
│   └── dev.db           # SQLite development database
├── package.json          # Project dependencies and scripts
└── README.md            # Project documentation
```

## Development Guidelines

### Code Style
- Use **TypeScript** for all new code
- Follow React functional component patterns with hooks
- Use Prisma Client for all database operations
- Implement proper error handling and validation

### Database Operations
- Always use Prisma Client for database interactions
- Handle database errors gracefully
- Use transactions for operations affecting multiple tables
- Follow Prisma best practices for relations

### Component Development
- Create reusable components for common UI elements
- Implement proper TypeScript interfaces for props
- Use React hooks for state management
- Follow Next.js conventions for routing and API routes

### Business Logic Patterns
- **Entry Management**: Create, read, update, delete expense/income entries
- **Category Management**: Organize entries by categories with colors and ordering
- **User Authentication**: Simple passcode-based authentication system
- **Financial Calculations**: Sum entries by type, category, date ranges

### API Design
- Use Next.js API routes for backend functionality
- Implement proper HTTP status codes
- Validate input data using TypeScript interfaces
- Handle authentication for protected routes

### Testing Strategy
- Write unit tests for utility functions
- Test database operations with Prisma
- Implement integration tests for API routes
- Test React components with appropriate testing libraries

## GitHub Copilot Integration

This project has automated GitHub Copilot workflows:
- **Auto-commit workflow**: Triggered by "auto-commit" label on issues
- **PR comment workflow**: Triggered by "/copilot-fix" in PR comments

### Issue Templates
- Feature request template available in Japanese
- Includes background, content, acceptance criteria, and testing points

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset
```

## Key Features to Implement

1. **Transaction Entry**: Add/edit income and expense entries
2. **Category Management**: Create and organize expense categories
3. **Financial Reports**: View summaries by date, category, type
4. **Data Visualization**: Charts and graphs for spending patterns
5. **User Authentication**: Secure passcode-based login
6. **Data Export**: Export financial data in various formats

## Common Patterns

### Prisma Queries
```typescript
// Get user entries with categories
const entries = await prisma.entry.findMany({
  where: { userId },
  include: { category: true },
  orderBy: { date: 'desc' }
});

// Create new entry
const entry = await prisma.entry.create({
  data: {
    date: new Date(),
    type: 'expense',
    amount: 1000,
    note: 'Grocery shopping',
    userId,
    categoryId
  }
});
```

### TypeScript Interfaces
```typescript
interface EntryData {
  id: number;
  date: Date;
  type: 'income' | 'expense';
  amount: number;
  note?: string;
  category?: CategoryData;
}

interface CategoryData {
  id: number;
  name: string;
  color?: string;
  order?: number;
}
```

## Notes for Copilot

- This is a financial application, so accuracy and data integrity are critical
- Always validate monetary amounts and dates
- Consider localization for Japanese users (currency, date formats)
- Implement proper error boundaries and user feedback
- Focus on clean, maintainable code with proper TypeScript typing
- Security is important for financial data - implement proper authentication and authorization
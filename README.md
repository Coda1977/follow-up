# Follow Up - AI-Powered Feedback Interview

An AI-powered interview system that gathers honest, detailed feedback from clients about working with you.

## Features

- AI interviewer using Claude that probes for specific examples
- Real-time chat interface
- Automatic transcript saving to Convex database
- Admin dashboard to review completed interviews
- Mobile-responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Vercel AI SDK + Claude (Anthropic)
- **Database**: Convex
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Convex

First, create a Convex account at [convex.dev](https://convex.dev)

Then initialize Convex:

```bash
npx convex dev
```

This will:
- Open a browser to log you in
- Create a new Convex project
- Generate your deployment URL

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Then fill in your values in `.env.local`:

```env
# Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=your_anthropic_api_key

# Get from running `npx convex dev`
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Run Development Server

In one terminal, run Convex:

```bash
npx convex dev
```

In another terminal, run Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository to Vercel:
   ```bash
   npx vercel
   ```

3. Add environment variables in Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOYMENT`

4. Deploy Convex to production:
   ```bash
   npx convex deploy
   ```

5. Update your Vercel environment variables with the production Convex URL

## Usage

### For Clients

1. Share the main URL with clients
2. They click "Begin Interview"
3. AI conducts the interview (5-10 minutes)
4. Responses are automatically saved

### For You (Admin)

1. Visit `/admin` to see all completed interviews
2. Click on any interview to read the full transcript
3. Review feedback and look for patterns

## Project Structure

```
follow-up/
├── src/
│   ├── app/
│   │   ├── api/chat/        # Claude API endpoint
│   │   ├── interview/[id]/  # Chat UI
│   │   ├── admin/           # Admin dashboard
│   │   └── page.tsx         # Landing page
│   └── lib/
│       └── prompt.ts        # AI system prompt
├── convex/
│   ├── schema.ts            # Database schema
│   └── interviews.ts        # Database functions
└── .env.local               # Environment variables
```

## Customization

### Modify the Interview Questions

Edit `src/lib/prompt.ts` to change:
- The questions asked
- The probing behavior
- The conversation length
- The AI's tone

### Modify the UI

All pages use Tailwind CSS. Key files:
- Landing page: `src/app/page.tsx`
- Chat UI: `src/app/interview/[id]/page.tsx`
- Admin: `src/app/admin/page.tsx`

## Tips

1. **Test with yourself first** - Run through the interview to ensure the AI probes well
2. **Share strategically** - Send to 3-5 clients to start
3. **Review patterns** - Look for common themes in the feedback
4. **Iterate the prompt** - Adjust probing triggers based on responses you get

## Support

For issues or questions, check:
- [Convex Docs](https://docs.convex.dev)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Next.js Docs](https://nextjs.org/docs)

## License

MIT

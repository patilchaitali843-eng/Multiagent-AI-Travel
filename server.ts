/**
 * Multi-Agent AI Travel Planner - Backend Server Entry Point
 * Implements REST APIs, agent orchestration routes, and mounts Vite middlewares.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db } from './server/db.ts';
import { OrchestratorAgent } from './server/agents/orchestrator.ts';
import { TripRequest } from './shared/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK if API Key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && !geminiApiKey.includes('MY_GEMINI_API_KEY')) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[SYSTEM] Google GenAI SDK initialized with server-side API Key.');
  } catch (err) {
    console.warn('[SYSTEM] Gemini client init warning:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Log requests for observability
  app.use((req, _res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      mode: process.env.USE_DEMO_DATA === 'false' ? 'live' : 'demo',
      geminiConnected: Boolean(aiClient),
      timestamp: new Date().toISOString(),
    });
  });

  // List all saved trips
  app.get('/api/trips', (_req: Request, res: Response) => {
    const trips = db.listTrips();
    res.json(trips);
  });

  // Get specific trip by ID
  app.get('/api/trips/:id', (req: Request, res: Response) => {
    const trip = db.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  });

  // Get itinerary for trip
  app.get('/api/trips/:id/itinerary', (req: Request, res: Response) => {
    const trip = db.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip.itinerary);
  });

  // Get budget breakdown for trip
  app.get('/api/trips/:id/budget', (req: Request, res: Response) => {
    const trip = db.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip.budget);
  });

  // Create new trip request
  app.post('/api/trips', (req: Request, res: Response) => {
    const body = req.body as TripRequest;
    
    // Validation
    if (!body.destination || !body.destination.trim()) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    if (!body.origin || !body.origin.trim()) {
      return res.status(400).json({ error: 'Starting location is required' });
    }
    if (!body.budget || body.budget <= 0) {
      return res.status(400).json({ error: 'Budget must be greater than zero' });
    }
    if (!body.startDate || !body.endDate) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }
    if (new Date(body.endDate) < new Date(body.startDate)) {
      return res.status(400).json({ error: 'End date cannot be earlier than start date' });
    }

    const tripId = `trip-${Date.now()}`;
    const newRequest: TripRequest = {
      ...body,
      id: tripId,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json(newRequest);
  });

  // Run multi-agent orchestrator to generate plan
  app.post('/api/trips/:id/generate', async (req: Request, res: Response) => {
    try {
      const tripId = req.params.id;
      const requestData = req.body as TripRequest;
      const isDemoMode = process.env.USE_DEMO_DATA !== 'false';

      console.log(`[ORCHESTRATOR] Starting trip generation for ${tripId}...`);
      
      const plan = await OrchestratorAgent.planTrip({
        ...requestData,
        id: tripId,
      }, isDemoMode);

      db.saveTrip(plan);
      res.json(plan);
    } catch (err: any) {
      console.error('[ORCHESTRATOR ERROR]', err);
      res.status(500).json({
        error: 'Multi-agent orchestration failed',
        details: err?.message || String(err),
      });
    }
  });

  // Regenerate a specific section
  app.post('/api/trips/:id/regenerate', async (req: Request, res: Response) => {
    try {
      const tripId = req.params.id;
      const currentPlan = db.getTrip(tripId);
      if (!currentPlan) {
        return res.status(404).json({ error: 'Trip plan not found to regenerate' });
      }

      const { section, targetDay, promptModifier } = req.body;
      const updatedPlan = await OrchestratorAgent.regenerateSection(
        currentPlan,
        section,
        { targetDay, promptModifier }
      );

      db.saveTrip(updatedPlan);
      res.json(updatedPlan);
    } catch (err: any) {
      console.error('[REGENERATE ERROR]', err);
      res.status(500).json({
        error: 'Section regeneration failed',
        details: err?.message || String(err),
      });
    }
  });

  // Optimize budget
  app.post('/api/trips/:id/optimize-budget', async (req: Request, res: Response) => {
    try {
      const tripId = req.params.id;
      const currentPlan = db.getTrip(tripId);
      if (!currentPlan) {
        return res.status(404).json({ error: 'Trip plan not found' });
      }

      const updatedPlan = await OrchestratorAgent.regenerateSection(
        currentPlan,
        'budget_optimize'
      );

      db.saveTrip(updatedPlan);
      res.json(updatedPlan);
    } catch (err: any) {
      console.error('[OPTIMIZE ERROR]', err);
      res.status(500).json({
        error: 'Budget optimization failed',
        details: err?.message || String(err),
      });
    }
  });

  // User travel preferences memory
  app.get('/api/user/preferences', (_req: Request, res: Response) => {
    const prefs = db.getUserPreferences();
    res.json(prefs);
  });

  app.post('/api/user/preferences', (req: Request, res: Response) => {
    const updated = db.updateUserPreferences(req.body);
    res.json(updated);
  });

  // Mount Vite or serve static
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Multi-Agent AI Travel Planner running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FATAL SERVER ERROR]', err);
});

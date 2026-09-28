# ✈️ Multi-Agent AI Travel Planner

> An AI-powered travel planning application that uses a multi-agent architecture to generate personalized trips based on destination, budget, travel preferences, interests, and transportation requirements.

## 🌐 Live Demo

🚀 **Live Application:**  
https://multiagent-ai-travel.onrender.com

📦 **GitHub Repository:**  
https://github.com/patilchaitali843-eng/Multiagent-AI-Travel

---

## 📌 Project Overview

The **Multi-Agent AI Travel Planner** is a full-stack AI application designed to automate the travel planning process.

Instead of manually searching for transportation, accommodation, activities, food options, and creating a day-by-day itinerary, the application coordinates multiple specialized AI agents through a central **Orchestrator Agent**.

The system collects the user's travel requirements and generates a personalized travel plan while considering:

- Destination
- Starting location
- Travel dates
- Number of travelers
- Budget
- Travel style
- Accommodation preference
- Food preferences
- Activities and interests
- Transportation preference
- Crowd preferences

The final output includes transportation options, accommodation suggestions, activities, budget allocation, and a structured itinerary.

---

## 🎯 Key Features

### 🤖 Multi-Agent AI Architecture

The application uses specialized agents for different travel-planning tasks.

### 🧠 Orchestrator Agent

Acts as the central coordinator and manages the overall trip-generation workflow.

### 🚆 Transport Agent

Researches and evaluates transportation options such as:

- Flights
- Trains
- Other available transit options

### 🏨 Hotel Agent

Evaluates accommodation options based on:

- Accommodation type
- Distance
- Ratings
- Travel preferences

### 🌴 Activity Agent

Recommends activities based on user interests such as:

- Beaches
- Adventure
- Local food
- Nature
- Hidden gems
- Nightlife

### 💰 Budget Validator

Validates the generated trip against the user's budget using deterministic calculations rather than relying on the AI model for arithmetic.

### 🗓️ Itinerary Generator

Combines transportation, accommodation, activities, and meals into a structured day-by-day travel schedule.

### 🔄 Section Regeneration

Users can regenerate specific sections of the generated travel plan without rebuilding the entire trip.

### 💾 Saved Trips

Generated travel plans can be saved and accessed through the application.

### ⚙️ Travel Preferences

The application supports persistent user travel preferences such as:

- Accommodation preference
- Travel style
- Food preferences
- Transportation preferences
- Crowd preference
- Currency

### 🏗️ Architecture View

The application includes an architecture section that visually explains the multi-agent workflow.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │        User          │
                    │  Travel Preferences  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │ React + TypeScript   │
                    │       + Vite         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend   │
                    │      server.ts       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Orchestrator Agent  │
                    │  Central Coordinator  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │ Transport  │   │   Hotel    │   │  Activity  │
       │   Agent    │   │   Agent    │   │   Agent    │
       └──────┬─────┘   └──────┬─────┘   └──────┬─────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Budget Validator    │
                    │ Deterministic Math   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Itinerary Generator  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Personalized Trip   │
                    │       Plan           │
                    └──────────────────────┘
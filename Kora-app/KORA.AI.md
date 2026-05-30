# Kora AI Architecture

## Vision

Kora AI is an intelligent real estate and property booking platform focused on Abuja and eventually other major cities in Nigeria.

The goal is to build an AI-powered property discovery ecosystem where users can:

* Search properties naturally using conversational AI
* Receive personalized property recommendations
* Discover high-value listings
* Book apartments, shortlets, offices, and spaces
* Interact with an intelligent real estate assistant
* Explore properties through smart semantic search

---

# Core Product Goals

## AI Features

### 1. Semantic Property Search

Users should be able to search naturally:

Examples:

* “Luxury apartment in Wuse under ₦5m”
* “Affordable shortlet near Maitama with parking”
* “Modern 2-bedroom apartment with good security”

The AI interprets intent instead of relying only on traditional keyword matching.

---

### 2. AI Recommendations

The system recommends:

* Similar properties
* Best value properties
* Trending areas
* Nearby alternatives
* Personalized suggestions
* Popular shortlets

---

### 3. Conversational AI Assistant

Kora AI should behave like a real estate concierge.

Examples:

* “Find me apartments in Asokoro.”
* “Show me the finest shortlets in Abuja.”
* “Which areas are best for expatriates?”

---

### 4. AI Ranking Engine

Properties are scored using:

* Location quality
* Price value
* Amenities
* Popularity
* Reviews
* Booking frequency
* User preferences

---

# Recommended Technology Stack

| Layer           | Technology               |
| --------------- | ------------------------ |
| Mobile App      | React Native             |
| Backend API     | Laravel                  |
| Authentication  | Laravel Sanctum          |
| AI Provider     | OpenAI API               |
| Database        | MySQL                    |
| Vector Database | pgvector                 |
| Storage         | Cloudinary or AWS S3     |
| Payments        | Paystack                 |
| Maps            | Google Maps API          |
| Notifications   | Firebase Cloud Messaging |

---

# System Architecture

## Frontend Layer

### React Native App

Responsibilities:

* Property browsing
* AI chat interface
* Authentication
* Booking management
* Notifications
* Saved properties
* Map exploration
* Search experience

---

## Backend Layer

### Laravel API

Responsibilities:

* Authentication
* Property CRUD
* Booking management
* Payment processing
* AI orchestration
* Search APIs
* Recommendation APIs
* Admin dashboard APIs

---

## AI Layer

### OpenAI Integration

Used for:

* Conversational AI
* Query understanding
* Embeddings generation
* Search interpretation
* Recommendation enhancement

Recommended models:

| Purpose        | Model                  |
| -------------- | ---------------------- |
| Chat Assistant | gpt-4.1-mini           |
| Embeddings     | text-embedding-3-small |

---

# Database Design

## Spaces Table Structure

Recommended columns:

```php
id
name
type
description
capacity
price_per_hour
price_per_night
price_per_year
area
address
latitude
longitude
owner
contact_info
beds
bathrooms
square_feet
parking
wifi
security
furnished
rating
review_count
reviews
amenities
images
available
embedding
created_at
updated_at
```

---

# AI Embeddings System

## What Are Embeddings?

Embeddings convert property descriptions into vectors that AI can understand.

Example:

Input:

```text
Luxury 3-bedroom apartment in Maitama with pool and security.
```

Converted into:

```text
[0.1921, -0.8812, 0.1239 ...]
```

This allows:

* Semantic search
* AI recommendations
* Similar property discovery
* Natural language search

---

# Embedding Workflow

## Step 1 — User Creates Listing

When a property is added:

* Combine title, description, amenities, and location
* Send to OpenAI embeddings API
* Store embedding vector in database

---

## Step 2 — User Searches

Example query:

```text
Luxury apartment in Wuse with parking.
```

System:

1. Generates embedding for query
2. Compares with property embeddings
3. Returns most similar results

---

# Laravel AI Integration

## Install OpenAI Client

```bash
composer require openai-php/client
```

---

## Example Embedding Service

```php
use OpenAI\Laravel\Facades\OpenAI;

$response = OpenAI::embeddings()->create([
    'model' => 'text-embedding-3-small',
    'input' => $spaceDescription,
]);

$embedding = $response->embeddings[0]->embedding;
```

---

# AI Search Endpoint

## API Endpoint

```text
/api/ai/search
```

Request:

```json
{
  "query": "Luxury apartment in Wuse under 5 million"
}
```

Response:

```json
{
  "success": true,
  "results": []
}
```

---

# AI Chat Assistant Endpoint

## API Endpoint

```text
/api/ai/chat
```

Example Request:

```json
{
  "message": "Find me a shortlet near Maitama"
}
```

---

## OpenAI Chat Example

```php
$response = OpenAI::chat()->create([
    'model' => 'gpt-4.1-mini',
    'messages' => [
        [
            'role' => 'system',
            'content' => 'You are Kora AI, a real estate assistant in Abuja.'
        ],
        [
            'role' => 'user',
            'content' => $query
        ]
    ]
]);
```

---

# React Native Integration

## Install Axios

```bash
npm install axios
```

---

## API Service

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://your-api.com/api',
  timeout: 10000,
});
```

---

## AI Search Function

```typescript
const searchAI = async (query: string) => {
  const response = await api.post('/ai/search', {
    query,
  });

  return response.data;
};
```

---

# Abuja Listing Intelligence

## Important Nigerian Real Estate Factors

Kora AI should include:

* Estate security
* Water supply reliability
* Power supply stability
* Road accessibility
* Distance to CBD
* Traffic density
* Furnished or unfurnished
* Internet availability
* Parking availability
* Security presence
* Neighborhood quality

These factors significantly influence property desirability in Nigeria.

---

# Recommendation Engine

## Data Sources

The AI should learn from:

* Property views
* Saved listings
* Booking history
* User searches
* Click behavior
* Session duration
* Popular locations

---

# AI Scoring Formula

Example scoring logic:

```text
Score = 0.35(Location) + 0.25(PriceValue) + 0.20(Amenities) + 0.10(Rating) + 0.10(Popularity)
```

---

# Data Collection Strategy

## Listing Sources

Kora should gather listings from:

* Real estate agents
* Property managers
* Landlords
* User-generated uploads
* Partnerships
* Manual onboarding

---

# Security and Production Features

## Backend Security

Implement:

* Rate limiting
* API authentication
* Request validation
* CORS protection
* Secure payment verification
* Role-based permissions admin, user and agents

---

# Scaling Strategy

## Phase 1 — MVP

Focus on:

* Listings
* Authentication
* AI search
* AI recommendations
* Booking system
* Payments

---

## Phase 2 — Smart Intelligence

Add:

* Personalized feeds
* Recommendation engine
* Search optimization
* Behavioral learning
* Saved searches

---

## Phase 3 — Advanced AI

Future roadmap:

* Vision AI for property images
* Fraud detection
* Price prediction
* Voice search
* AI-generated listing summaries
* Neighborhood intelligence

---

# Deployment Architecture

## Recommended Infrastructure

| Service        | Recommendation               |
| -------------- | ---------------------------- |
| API Hosting    | Laravel Forge / DigitalOcean |
| Database       | MySQL                   |
| Image Storage | AWS S3                       |
| CDN            | Cloudflare                   |
| Monitoring     | Sentry                       |
| CI/CD          | GitHub Actions               |

---

# Business Strategy

## Monetization Options

Potential revenue streams:

* Premium listings
* Featured properties
* Booking commissions
* Subscription plans
* AI-powered lead generation
* Agent subscriptions
* Property management tools

---

Kora AI realistically becomes one of the strongest AI-powered proptech platforms in Nigeria with this architecture.

# Kora AI Is the new way of finding luxury and affordable properties in abuja just as AI is the new way of finding things on the internet!
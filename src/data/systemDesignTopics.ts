import { Topic } from "@/types";

export const systemDesignTopics: Topic[] = [
  {
    id: "scalable-web-architecture",
    title: "Scalable Web Architecture",
    difficulty: "medium",
    description: "Design a scalable web application architecture that can handle millions of users.",
    content: `# Scalable Web Architecture

## Overview
Designing a scalable web application requires careful consideration of various components and their interactions.

## Key Components
1. **Load Balancers**: Distribute incoming requests across multiple servers
2. **Application Servers**: Handle business logic and API requests
3. **Database Layer**: Store and retrieve data efficiently
4. **Caching Layer**: Reduce database load and improve response times
5. **CDN**: Serve static content from locations close to users

## Architecture Patterns
- **Microservices**: Break down monolith into smaller, independent services
- **Event-Driven Architecture**: Use events to communicate between services
- **API Gateway**: Single entry point for all client requests

## Scaling Strategies
- **Horizontal Scaling**: Add more servers to handle increased load
- **Vertical Scaling**: Increase resources of existing servers
- **Database Sharding**: Distribute data across multiple databases
- **Caching**: Redis, Memcached for fast data access

## Example Architecture
\`\`\`
[Client] → [CDN] → [Load Balancer] → [API Gateway] → [Microservices]
                                                    ↓
                                            [Message Queue]
                                                    ↓
                                            [Database Cluster]
\`\`\``
  },
  {
    id: "design-twitter",
    title: "Design Twitter",
    difficulty: "hard",
    description: "Design a Twitter-like social media platform that can handle millions of tweets per day.",
    content: `# Design Twitter

## Requirements
### Functional Requirements
- Post tweets (140 characters)
- Follow/unfollow users
- Timeline generation (home and user timeline)
- Search tweets

### Non-Functional Requirements
- 100M DAU, 200M tweets per day
- Read-heavy system (100:1 read/write ratio)
- 99.9% availability
- Low latency for timeline generation

## High-Level Design
\`\`\`
[Mobile/Web Client] → [Load Balancer] → [API Gateway]
                                              ↓
                                    [Tweet Service] [User Service] [Timeline Service]
                                              ↓            ↓              ↓
                                    [Tweet Cache] [User Cache] [Timeline Cache]
                                              ↓            ↓              ↓
                                    [Tweet DB]   [User DB]   [Timeline DB]
\`\`\`

## Database Design
### Tweet Table
- tweet_id (primary key)
- user_id
- content
- timestamp
- media_urls

### User Table
- user_id (primary key)
- username
- email
- profile_info

### Follower Table
- follower_id
- followee_id
- timestamp

## Timeline Generation
### Pull Model (On-demand)
- Generate timeline when user requests
- Query tweets from followed users
- Pros: Less storage, works for inactive users
- Cons: Slow for users following many people

### Push Model (Pre-computed)
- Pre-compute timelines when tweets are posted
- Store in timeline cache/database
- Pros: Fast timeline retrieval
- Cons: More storage needed

### Hybrid Approach
- Push for active users, pull for inactive users
- Push for users with few followers, pull for celebrities`
  },
  {
    id: "design-url-shortener",
    title: "Design URL Shortener",
    difficulty: "medium",
    description: "Design a URL shortening service like bit.ly or tinyurl.",
    content: `# Design URL Shortener

## Requirements
### Functional Requirements
- Shorten long URLs
- Redirect to original URL when short URL is accessed
- Custom aliases (optional)
- Analytics (click tracking)

### Non-Functional Requirements
- 100M URLs shortened per month
- 10:1 read/write ratio
- 99.9% availability
- Low latency for redirects

## API Design
\`\`\`
POST /api/v1/shorten
{
  "original_url": "https://example.com/very/long/url",
  "custom_alias": "mylink", // optional
  "expiry_date": "2024-12-31" // optional
}

GET /api/v1/{short_url}
→ Redirect to original URL
\`\`\`

## Database Design
### URL Table
- short_url (primary key)
- original_url
- user_id
- created_at
- expiry_date
- click_count

## URL Encoding Strategies
### Base62 Encoding
- Characters: [a-z, A-Z, 0-9] = 62 characters
- 6 characters = 62^6 = ~56 billion URLs
- 7 characters = 62^7 = ~3.5 trillion URLs

### Counter-based Approach
- Use auto-incrementing counter
- Convert to Base62
- Pros: Simple, no collisions
- Cons: Predictable, single point of failure

### Hash-based Approach
- Use MD5/SHA-256 hash of original URL
- Take first 6-7 characters
- Handle collisions with additional hashing
- Pros: Distributed, no coordination needed
- Cons: Possible collisions

## Caching Strategy
- Cache popular short URLs
- Use Redis/Memcached
- LRU eviction policy
- Cache hit ratio ~80%

## Analytics
- Track clicks in real-time
- Store in time-series database
- Aggregate data for reporting`
  }
];
# Restaurant API

A RESTful API for a restaurant management system built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js >= 14.0.0
- MongoDB Atlas account

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```

## Development

Run the development server:
```bash
npm run dev
```

## Production

Run the production server:
```bash
npm start
```

## Deployment

### Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add the following environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render's default port)

## API Endpoints

- `/api/reservations`: Reservation management
- `/api/orders`: Order management 
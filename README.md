# Morpho Markets Indexer

## Overview

This project is an on-chain indexer for Morpho Markets, designed to efficiently track and compute the Loan-to-Value (LTV) ratios for all borrowers. It's built with scalability and high-volume processing in mind, utilizing Node.js, Express, PostgreSQL, and Bull for queue management.

## Architecture

The indexer is composed of several key components:

1. **Event Listener**: Connects to the Ethereum network and listens for relevant Morpho contract events.
2. **Event Queue**: Uses Bull (backed by Redis) to manage high volumes of events asynchronously.
3. **Event Processor**: Processes queued events, updating the database with new market and user information.
4. **LTV Calculator**: Computes the LTV for users based on the latest market data and oracle prices.
5. **API Server**: Exposes endpoints to query user LTV data.
6. **Database**: PostgreSQL for robust and scalable data storage.

### Key Features

- Asynchronous event processing for high throughput
- Real-time LTV calculations
- Scalable database design
- Rate-limited API to prevent abuse
- Oracle price integration for accurate LTV computation

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/morpho-markets-indexer.git
   cd morpho-markets-indexer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your environment variables in a `.env` file:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/morpho_indexer
   REDIS_URL=redis://localhost:6379
   ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
   MORPHO_ADDRESS=0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
   PORT=3000
   ```

4. Run database migrations:
   ```
   npm run migrate
   ```

## Usage

1. Start the indexer:
   ```
   npm start
   ```

2. The indexer will automatically start processing events from the Morpho contract.

3. Access the API at `http://localhost:3000` (or your specified PORT).

### API Endpoints

- `GET /api/users`: Retrieve all users' LTV data
  - Query Parameters:
    - `alpha`: Filter users by minimum LTV ratio (e.g., `/api/users?alpha=0.8`)

- `GET /api/users/:address`: Retrieve LTV data for a specific user address

## Development

- Run in development mode with hot reloading:
  ```
  npm run start:local:dev
  ```

- Run tests:
  ```
  npm test
  ```

- Lint code:
  ```
  npm run lint
  ```

## Scaling Considerations

- The use of Bull for queue management allows for easy scaling of event processing.
- Consider implementing database sharding for very large datasets.
- Use a load balancer when deploying multiple instances of the API server.
- Implement caching (e.g., Redis) for frequently accessed data to reduce database load.
- Monitor performance and optimize database queries as needed.
- Consider using Node.js clustering to take advantage of multi-core systems.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
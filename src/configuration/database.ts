import { Pool } from 'pg';
import { DATABASE_URL } from '../constants';

if (!DATABASE_URL || DATABASE_URL.length == 0) {
    throw new Error(`Expected a connection string but found: ${DATABASE_URL}`);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export default pool;
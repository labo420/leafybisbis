import pg from 'pg';

const client = new pg.Client(process.env.DATABASE_URL);
await client.connect();

try {
  const result = await client.query(
    'UPDATE users SET xp = xp + 200 WHERE email = $1 RETURNING id, email, xp',
    ['labo@gmail.com']
  );
  
  if (result.rows.length === 0) {
    console.log('❌ User not found: labo@gmail.com');
  } else {
    const user = result.rows[0];
    console.log(`✅ Updated labo@gmail.com: new xp = ${user.xp}`);
  }
} finally {
  await client.end();
}

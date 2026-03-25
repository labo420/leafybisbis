import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function addDrops() {
  const email = "labo@gmail.com";
  const amount = 500;

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!users.length) {
    console.error(`User with email ${email} not found`);
    process.exit(1);
  }

  const user = users[0];
  const currentDrops = user.drops ?? 0;
  const newDrops = currentDrops + amount;

  await db
    .update(usersTable)
    .set({ drops: newDrops })
    .where(eq(usersTable.email, email));

  console.log(`✓ Added ${amount} drops to ${email}`);
  console.log(`  Before: ${currentDrops} drops`);
  console.log(`  After: ${newDrops} drops`);
}

addDrops()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });

import { db } from "./src/db.ts";
import { usersTable } from "../../lib/db/src/schema/users.ts";
import { eq } from "drizzle-orm";

async function addDrops() {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "labo@gmail.com"))
    .limit(1);

  if (!user.length) {
    console.error("User not found");
    process.exit(1);
  }

  const currentDrops = user[0].drops || 0;
  const newDrops = currentDrops + 1500;

  await db
    .update(usersTable)
    .set({ drops: newDrops })
    .where(eq(usersTable.email, "labo@gmail.com"));

  console.log(`✓ Added 1500 drops to labo@gmail.com`);
  console.log(`  Previous: ${currentDrops} drops`);
  console.log(`  New: ${newDrops} drops`);

  process.exit(0);
}

addDrops().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

import { getAdminParentsListServer } from "../lib/admin.server";

async function testAdminParents() {
  console.log("=================================================");
  console.log("🔍 TESTING ADMIN PARENTS LIST FETCH");
  console.log("=================================================\n");

  try {
    const list = await getAdminParentsListServer();
    console.log(`✅ Returned ${list.length} parent records for Admin Dashboard!`);
    if (list.length > 0) {
      console.log("   Sample record:", JSON.stringify(list[0], null, 2));
    }
  } catch (err: any) {
    console.error("❌ Admin parents list fetch failed:", err.message || err);
  }

  console.log("\n=================================================");
}

testAdminParents().catch(console.error);

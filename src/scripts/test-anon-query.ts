import { fetchAssessmentCardSettings } from "../lib/settings";

async function testPublicVisitorFetch() {
  console.log("=================================================");
  console.log("🌐 SIMULATING PUBLIC VISITOR HOMEPAGE READ");
  console.log("=================================================\n");

  const cardData = await fetchAssessmentCardSettings();
  console.log("Card Settings returned to Homepage:");
  console.log("- TK Title:", cardData.TK.title);
  console.log("- SD Title:", cardData.SD.title);
  console.log("- SMP Title:", cardData.SMP.title);
  console.log("- SMA Title:", cardData.SMA.title);

  if (cardData && cardData.TK && cardData.TK.title) {
    console.log("\n✅ PUBLIC VISITOR READ SUCCESSFUL!");
  } else {
    throw new Error("❌ PUBLIC VISITOR READ FAILED!");
  }
}

testPublicVisitorFetch();

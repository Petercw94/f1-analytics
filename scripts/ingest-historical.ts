// scripts/example.ts
import "dotenv/config";

async function main() {
  const args = process.argv.slice(2);

  console.log("Args:", args);

  // your logic here
}

main()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

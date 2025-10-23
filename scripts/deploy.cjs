const hre = require("hardhat");

async function main() {
  console.log("Deploying QuizStorage contract to Base ...");

  const QuizStorage = await hre.ethers.getContractFactory("QuizStorage");
  const quizStorage = await QuizStorage.deploy();

  await quizStorage.waitForDeployment();

  const contractAddress = await quizStorage.getAddress();
  console.log("✅ QuizStorage deployed to:", contractAddress);
  console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${contractAddress}`);
  console.log("\n⚠️  IMPORTANT: Copy this address to your .env.local file!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

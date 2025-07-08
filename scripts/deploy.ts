import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CustomToken = await hre.ethers.getContractFactory("CustomToken");
  const token = await CustomToken.deploy(
    "MyToken",            // name
    "MTK",                // symbol
    1000000,              // initial supply (1 million)
    2,                    // tax percentage (2%)
    1,                    // burn percentage (1%)
    deployer.address      // tax wallet (deployer in this case)
  );

  await token.deployTransaction.wait();
  console.log("Token deployed to:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

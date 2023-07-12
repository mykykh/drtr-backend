import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployMessageStorage: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const messageStorage = await deploy("MessageStorage", {
    from: deployer,
    log: true
  })
}

export default deployMessageStorage

deployMessageStorage.tags = ["all", "message-storage"]

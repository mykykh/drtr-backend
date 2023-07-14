import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { readFileSync, writeFileSync } from "fs"

const FRONTEND_PATH = process.env.FRONTEND_PATH
const ADDRESSES_FILE = FRONTEND_PATH + "addresses.json"
const ABI_FILE = FRONTEND_PATH + "abi.json"

const updateUi: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, network } = hre
  const chainId = network.config.chainId?.toString() || "31337"

  const messageStorage = await ethers.getContract("MessageStorage")
  const messageStorageAddress = await messageStorage.getAddress()

  const frontendNetworks = JSON.parse(readFileSync(ADDRESSES_FILE, "utf8"))

  if (chainId in frontendNetworks) {
    if (!(frontendNetworks[chainId].includes(messageStorageAddress))){
      frontendNetworks[chainId].push(messageStorageAddress)
    }
  } else {
      frontendNetworks[chainId] = [messageStorageAddress]
  }

  writeFileSync(ADDRESSES_FILE, JSON.stringify(frontendNetworks))
  writeFileSync(ABI_FILE, messageStorage.interface.formatJson())
}

export default updateUi;
updateUi.tags = ["all", "update-frontend"]

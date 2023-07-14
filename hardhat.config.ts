import 'hardhat-deploy'
import "@nomiclabs/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"
import "dotenv/config"
import { HardhatUserConfig } from 'hardhat/types';

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: "0.8.18",
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }
};

export default config;

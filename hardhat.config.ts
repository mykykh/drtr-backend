import 'hardhat-deploy'
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

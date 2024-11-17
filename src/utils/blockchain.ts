import { ethers } from 'ethers';

const contractABI = [
  "function storePhotoHash(string memory hash, string memory emotion, uint256 timestamp) public",
  "function getPhotoHash(uint256 index) public view returns (string memory hash, string memory emotion, uint256 timestamp)"
];

const contractAddress = "0x59613461e4B53875273d9Ec41a9902FF56B09693";
 

export class BlockchainStorage {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private isWeb3Available: boolean = false;

  constructor() {
    this.checkWeb3Availability();
  }

  private checkWeb3Availability() {
    this.isWeb3Available = typeof window !== 'undefined' && 
                          window.ethereum !== undefined && 
                          window.ethereum !== null;
  }

  async init() {
    if (!this.isWeb3Available) {
      console.warn('Web3 provider not available. Blockchain features disabled.');
      return false;
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(contractAddress, contractABI, signer);
      return true;
    } catch (error) {
      console.error('Error initializing blockchain:', error);
      return false;
    }
  }

  async storePhotoData(hash: string, emotion: string, timestamp: number) {
    if (!this.isWeb3Available) {
      console.warn('Web3 provider not available. Cannot store photo data.');
      return false;
    }

    if (!this.contract) {
      const initialized = await this.init();
      if (!initialized) return false;
    }

    try {
      const tx = await this.contract!.storePhotoHash(hash, emotion, timestamp);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error storing on blockchain:', error);
      return false;
    }
  }

  isAvailable() {
    return this.isWeb3Available;
  }
}

export const blockchainStorage = new BlockchainStorage();
import { getNamedAccounts, deployments, ethers } from "hardhat"
import { assert, expect } from "chai"

describe("MessageStorage unit test", async function() {

  let messageStorage: MessageStorage

  beforeEach(async function() {
    const { deployer } = await getNamedAccounts()

    await deployments.fixture("all")

    messageStorage = await ethers.getContract("MessageStorage", deployer)
  })

  describe("postMessage", async function() {
    it("Test postMessage with correct message", async function() {
      const startingId = await messageStorage.currentId()

      await messageStorage.postMessage("test")

      const currentId = await messageStorage.currentId()

      assert.equal(currentId - startingId, 1)
    })

    it("Test postMessage emits event", async function() {
      await expect(messageStorage.postMessage("test")).to
      .emit(messageStorage, "MessagePosted")
    })
  })

  describe("getMessage", async function() {
    it("Test getMessage with correct id", async function() {
      const messageText = "test"
      await messageStorage.postMessage(messageText)

      const storedMessage = await messageStorage.getMessage(0)

      assert.equal(storedMessage[1], messageText)
    })

    it("Test getMessage with incorect id", async function() {
      await expect(messageStorage.getMessage(0)).to.be
      .rejectedWith("MessageStorage__MessageWithIdNotFound")
    })
  })

  describe("donateToMessage", async function() {
    beforeEach(async function() {
      const messageText = "test"
      await messageStorage.postMessage(messageText)
    })

    it("Test donateToMessage with author donating", async function() {
      const donationAmount = ethers.formatUnits(100, "wei");

      await messageStorage.donateToMessage(0, {value: donationAmount})

      const storedMessage = await messageStorage.getMessage(0)

      assert.equal(storedMessage[2], donationAmount);
      assert.equal(storedMessage[3], donationAmount);
    })

    it("Test donateToMessage with not author donating", async function() {
      const [ _, donator ] = await ethers.getSigners()
      const donationAmount = ethers.formatUnits(150, "wei");

      await messageStorage.connect(donator).donateToMessage(0, {value: donationAmount})

      const storedMessage = await messageStorage.getMessage(0)

      assert.equal(storedMessage[2], donationAmount);
      assert.equal(storedMessage[3], donationAmount);
    })

    it("Test donateToMessage emits event", async function() {
      const donationAmount = ethers.formatUnits(100, "wei");

      await expect(messageStorage.donateToMessage(0, {value: donationAmount})).to
      .emit(messageStorage, "MessageDonation")
    })
  })

  describe("withdrawFromMessage", async function() {
    beforeEach(async function() {
      const messageText = "test"
      await messageStorage.postMessage(messageText)
    })

    it("Test author withdraws", async function() {
      const donationAmount = ethers.formatUnits(100, "wei")
      const [ author, donator ] = await ethers.getSigners()

      const startingAuthorBalance = await ethers.provider.getBalance(author)

      await messageStorage.connect(donator).donateToMessage(0, {value: donationAmount})
      const transactionReceipt = await (await messageStorage.connect(author)
        .withdrawFromMessage(0)).wait()

      const { gasUsed, gasPrice } = transactionReceipt
      const gasCost = gasUsed * gasPrice

      const endingAuthorBalance = await ethers.provider.getBalance(author)
      const storedMessage = await messageStorage.getMessage(0)

      assert.equal(storedMessage[2], 0n);
      assert.equal(storedMessage[3], donationAmount);
      assert.equal(endingAuthorBalance - startingAuthorBalance + gasCost,
        BigInt(parseInt(donationAmount)))
    })

    it("Test not author withdraws", async function() {
      const [ _, withdrawer ] = await ethers.getSigners()
      const donationAmount = ethers.formatUnits(100, "wei");

      await messageStorage.donateToMessage(0, {value: donationAmount})
      await expect(messageStorage.connect(withdrawer).withdrawFromMessage(0)).to.be
      .rejectedWith("MessageStorage__OnlyAuthorCanCallThisFunction")

      const storedMessage = await messageStorage.getMessage(0)

      assert.equal(storedMessage[2], donationAmount);
      assert.equal(storedMessage[3], donationAmount);
    })

    it("Test withdrawFromMessage emits event", async function() {
      const donationAmount = ethers.formatUnits(100, "wei")
      const [ author, donator ] = await ethers.getSigners()

      await messageStorage.connect(donator).donateToMessage(0, {value: donationAmount})

      await expect(messageStorage.connect(author).withdrawFromMessage(0)).to
      .emit(messageStorage, "MessageWithdraw")
    })
  })
})

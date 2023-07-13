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

})

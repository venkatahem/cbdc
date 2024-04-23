const CBDC_Dapps = artifacts.require("CBDC_Dapps");

let participant_1;
let participant_2;

contract("CBDC_Dapps", (accounts) => {
  it("...should recognize accounts[0] as BI account", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();
    const BI_Account = await CBDC_DappsInstance.ReserveBankofIndiaAddress();

    assert.equal(BI_Account, accounts[0]);
  });

  it("...should recognize BI as participant", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const participant = await CBDC_DappsInstance.addressToParticipant(
      accounts[0]
    );

    // console.log(participant);
    assert.equal(participant.name, "Reserve Bank of India");
  });

  it("...can add new participant", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    //add existing participant, expected error
    try {
      await CBDC_DappsInstance.addParticipant(
        accounts[0],
        "Reserve Bank of India"
      );
      assert(false);
    } catch (err) {
      assert(true, "reject adding existing participant");
    }

    //add participant using non BI account, expected error
    try {
      await CBDC_DappsInstance.addParticipant(accounts[1], "HDFC", {
        from: accounts[5],
      });
      assert(false);
    } catch (err) {
      assert(true, "reject adding using non BI caller");
    }

    try {
      await CBDC_DappsInstance.addParticipant(accounts[1], "HDFC");
      assert(true, "add participant 1 as HDFC succedd");
    } catch (err) {
      assert(false, err);
    }

    try {
      await CBDC_DappsInstance.addParticipant(accounts[2], "SBI");
      assert(true, "add participant 2 as SBI succedd");
    } catch (err) {
      assert(false, err);
    }
    participant_1 = await CBDC_DappsInstance.addressToParticipant(accounts[1]);
    participant_2 = await CBDC_DappsInstance.addressToParticipant(accounts[2]);
    assert(participant_1.name, "HDFC");
    assert(participant_2.name, "SBI");
  });

  it("...can edit participant", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    try {
      await CBDC_DappsInstance.editParticipantStatus(
        accounts[1],
        CBDC_DappsInstance.enums.ParticipantStatus.NotActive
      );
      assert(true);
    } catch (err) {
      assert(false);
    }
    console.log(particpant_2);
    assert(participant_2.status, CBDC_Dapps.enums.ParticipantStatus.NotActive);
  });
});

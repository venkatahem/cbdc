const CBDC_Dapps = artifacts.require("CBDC_Dapps");

let participant_1;
let participant_2;

contract("CBDC_Dapps", (accounts) => {
  it("...should recognize accounts[0] as BI account", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();
    const BI_Account = await CBDC_DappsInstance.BankIndonesiaAddress();

    assert.equal(BI_Account, accounts[0]);
  });

  it("...should recognize BI as participant", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    const participant = await CBDC_DappsInstance.addressToParticipant(
      accounts[0]
    );

    // console.log(participant);
    assert.equal(participant.name, "Bank Indonesia");
  });

  it("...can add new participant", async () => {
    const CBDC_DappsInstance = await CBDC_Dapps.deployed();

    //add existing participant, expected error
    try {
      await CBDC_DappsInstance.addParticipant(accounts[0], "Bank Indonesia");
      assert(false);
    } catch (err) {
      assert(true, "reject adding existing participant");
    }

    //add participant using non BI account, expected error
    try {
      await CBDC_DappsInstance.addParticipant(accounts[1], "Bank Mandiri", {
        from: accounts[5],
      });
      assert(false);
    } catch (err) {
      assert(true, "reject adding using non BI caller");
    }

    try {
      await CBDC_DappsInstance.addParticipant(accounts[1], "Bank Mandiri");
      assert(true, "add participant 1 as Bank Mandiri succedd");
    } catch (err) {
      assert(false, err);
    }

    try {
      await CBDC_DappsInstance.addParticipant(accounts[2], "Bank BCA");
      assert(true, "add participant 2 as Bank BCA succedd");
    } catch (err) {
      assert(false, err);
    }
    participant_1 = await CBDC_DappsInstance.addressToParticipant(accounts[1]);
    participant_2 = await CBDC_DappsInstance.addressToParticipant(accounts[2]);
    assert(participant_1.name, "Bank Mandiri");
    assert(participant_2.name, "Bank BCA");
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

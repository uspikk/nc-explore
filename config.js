const config = {
  "continious" : false, //  false/true,  if set true, will loop forever
  "sleep" : 30, ///if continious, the delay in between loops in minutes
  "debug": false
}

const accounts = ["acc1", "acc2"];

const wifs = ["wif1", "wif2"];

module.exports = {config, accounts, wifs}
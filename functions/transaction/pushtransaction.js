let steem = require("steem")
let wifs = require("../../config.js").wifs
let accs = require("../../config.js").accounts
let debug = require("../debug/worker.js").debug
module.exports = {transactionqueue}
let bugobj = {}

function transactionqueue(tx){
let keynum = require("../data/getdata.js").returnrotation
let passstate = require("../data/getdata.js").getstate
 trx = JSON.stringify(tx[0])
 bugobj.one = "trying to sign:";
 bugobj.two = trx;
 debug(bugobj)
  steem.broadcast.customJson(wifs[keynum()], [], [accs[keynum()]], "nextcolony", trx, function(err, result) {
  	if(err){console.log(err);return;}
  	if(result){console.log("signed a transaction: ");console.log(trx);debug("success");passstate(1);return;}
  });
}


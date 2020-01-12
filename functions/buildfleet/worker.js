let txqueue = require("../transaction/pushtransaction.js").transactionqueue
let debug = require("../debug/worker.js").debug

module.exports = {checkexplorers}
let bugobj = {}

function checkexplorers(planets){
  debug("checking explorers to build")
  let addmain = require("../data/getdata.js").addmain
  var d = new Date();
  d = Math.floor(d / 1000)
  if(planets.length === 0){
    debug("Ran out of planets to check. adding main")
    addmain();
    return;}
  for(var i=0;i<planets[0].shipyard.length;i++){
    if(planets[0].shipyard[i].type === "explorership1"){
      let pnts = planets[0].shipyard[i]
      bugobj.id = "found explorership1 on planet: " + planets[0].id;
      bugobj.coal = pnts.costs.coal < planets[0].qyt.coal;
      bugobj.ore = pnts.costs.ore < planets[0].qyt.ore;
      bugobj.copper = pnts.costs.copper < planets[0].qyt.copper;
      bugobj.uranium = pnts.costs.uranium < planets[0].qyt.uranium;
      bugobj.shipyard_level = pnts.shipyard_level >= pnts.shipyard_min_level;
      bugobj.ship_skill = pnts.ship_skill === 20;
      bugobj.activated = pnts.activated === true;
      bugobj.busy_until = pnts.busy_until < d;
      bugobj.time = d;
      bugobj.busy = pnts.busy_until;
      debug(bugobj);
      bugobj = {};
      if(pnts.activated === true && pnts.ship_skill === 20 && pnts.shipyard_level >= pnts.shipyard_min_level &&
         pnts.costs.coal < planets[0].qyt.coal && pnts.costs.copper < planets[0].qyt.copper &&
         pnts.costs.ore < planets[0].qyt.ore && pnts.costs.uranium < planets[0].qyt.uranium &&
         pnts.busy_until < d){
        debug("All true, building explorer II")
        buildexplorer(planets[0], pnts.type);
        return;
      }
      else{
        for(var j=0;j<planets[0].shipyard.length;j++){
          if(planets[0].shipyard[j].type === "explorership"){
            pnts = planets[0].shipyard[j]
            bugobj.id = "Trying regular explorer, condition not met on planet : " + planets[0].id;
            bugobj.coal = pnts.costs.coal < planets[0].qyt.coal;
            bugobj.ore = pnts.costs.ore < planets[0].qyt.ore;
            bugobj.copper = pnts.costs.copper < planets[0].qyt.copper;
            bugobj.uranium = pnts.costs.uranium < planets[0].qyt.uranium;
            bugobj.shipyard_level = pnts.shipyard_level >= pnts.shipyard_min_level;
            bugobj.ship_skill = pnts.ship_skill === 20;
            bugobj.activated = pnts.activated === true;
            bugobj.busy_until = pnts.busy_until < d;
            bugobj.time = d;
            bugobj.busy = pnts.busy_until;
            debug(bugobj);
            bugobj = {};
            if(pnts.activated === true && pnts.ship_skill === 20 && pnts.shipyard_level >= pnts.shipyard_min_level &&
               pnts.costs.coal < planets[0].qyt.coal && pnts.costs.copper < planets[0].qyt.copper &&
               pnts.costs.ore < planets[0].qyt.ore && pnts.costs.uranium < planets[0].qyt.uranium &&
               pnts.busy_until < d){
              debug("All true, building explorer")
              buildexplorer(planets[0], pnts.type);
              return;
            }
          }
        }
      }
    }
  }
  debug("Can't build explorer on this planet")
  planets.shift();
  checkexplorers(planets);
}

function buildexplorer(planet, type){
  let dummyobj = [{
    "username":planet.username,
    "type":"buildship",
    "command":{
      "tr_var1":planet.id,
      "tr_var2":type
    }
  }]
  debug(JSON.stringify(dummyobj))
  txqueue(dummyobj);
  return;
}
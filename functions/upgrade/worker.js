module.exports = {upgrade}
let txqueue = require("../transaction/pushtransaction.js").transactionqueue
let debug = require("../debug/worker.js").debug

let bugobj = {};


function upgrade(planets, arr){
  debug("trying to upgrade")
 let nextstep = require("../data/getdata.js").addmain
 if(planets.length === 0){debug("out of planets, nextstep");nextstep();return;}
 var d = new Date();
 d = Math.floor(d / 1000)
 planets[0].buildings = planets[0].buildings.sort(function(a,b){return a.current - b.current})
 for(var i=0;i<planets[0].skills.length;i++){
  let pskills = planets[0].skills[i]
  if(pskills.name === "Explorer"){
    bugobj.message = "trying to upgrade explorer";
    bugobj.busy = pskills.busy < d;
    bugobj.coal = pskills.coal < planets[0].qyt.coal;
    bugobj.copper = pskills.copper < planets[0].qyt.copper;
    bugobj.ore = pskills.ore < planets[0].qyt.ore;
    bugobj.uranium = pskills.uranium < planets[0].qyt.uranium;
    bugobj.skilllevel = pskills.current < 20;
    debug(bugobj);
    bugobj = {};
  	//console.log("trying to upgrade explorer")
    if(pskills.busy < d && pskills.coal < planets[0].qyt.coal && pskills.copper < planets[0].qyt.copper &&
       pskills.ore < planets[0].qyt.ore && pskills.uranium < planets[0].qyt.uranium && pskills.current < 20
    ){
      debug("all true, upgrading Explorer skill");
     upgradeskill(planets[0], pskills.name);
     return;
    }
    else{
     debug("Cant upgrade explorer, trying to upgrade skills and buildings")
    //console.log("don't meet resources to upgrade explorer skill, trying to upgrade buildings")
     for(var j=0;j<planets[0].buildings.length;j++){
     	let builds = planets[0].buildings[j];
      debug(builds.name)
     	if(builds.busy < d){
       debug("building is not busy")
     	  if(builds.skill <= builds.current){
          debug("building skill is not enough")
     	  	for(var q=0;q<planets[0].skills.length;q++){
     	  		let qskills = planets[0].skills[q];
              if(planets[0].skills[q].name === builds.name){
                bugobj.message = "trying to upgrade skill:";
                bugobj.busy = qskills.busy < d;
                bugobj.coal = qskills.coal < planets[0].qyt.coal;
                bugobj.copper = qskills.copper < planets[0].qyt.copper;
                bugobj.ore = qskills.ore < planets[0].qyt.ore;
                bugobj.uranium = qskills.uranium < planets[0].qyt.uranium;
                bugobj.below20 = qskills.current < 20;
                debug(bugobj);
                bugobj = {};
              	if(qskills.busy < d && qskills.coal < planets[0].qyt.coal &&
              	   qskills.copper < planets[0].qyt.copper &&
                   qskills.ore < planets[0].qyt.ore && qskills.uranium < planets[0].qyt.uranium &&
                   qskills.current < 20
                ){
                  debug("all true, upgrading skill:")
                  upgradeskill(planets[0], qskills.name);
                  return;
              	}
              	break;
              }
     	  	}
     	  }
     	  else{
          bugobj.message = "building skill is enough.";
          bugobj.coal = builds.coal < planets[0].qyt.coal;
          bugobj.copper = builds.copper < planets[0].qyt.copper;
          bugobj.ore = builds.ore < planets[0].qyt.ore;
          bugobj.uranium = builds.uranium < planets[0].qyt.uranium;
          bugobj.maxlevel = builds.current < 20;
          debug(bugobj);
          bugobj = {};
     	  	if(builds.coal < planets[0].qyt.coal &&
               builds.copper < planets[0].qyt.copper &&
               builds.ore < planets[0].qyt.ore && builds.uranium < planets[0].qyt.uranium &&
               builds.current < 20
            ){
              debug("all true buiding the building")
              upgradebuild(planets[0],builds.name);
              return;
     	  	}
     	  }
     	}
     }
    }
  }
 }
 debug("can't build anything shifting planet")
 planets.shift();
 upgrade(planets);
}

function upgradeskill(planet, skill){
  debug("creating the dummyobj");
  dummyobj = [{
  "username": planet.username,
  "type": "enhance",
  "command": {
    "tr_var1": planet.username,
    "tr_var2": planet.id,
    "tr_var3": skill
  }
 }]
 txqueue(dummyobj);
}

function upgradebuild(planet, build){
  debug("creating dummyobj");
 dummyobj = [{
  "username": planet.username,
  "type": "upgrade",
  "command": { "tr_var1": planet.id, "tr_var2": build }
 }]
 txqueue(dummyobj);
}
var Request = require("request");
const config = require("../../config.js").config
const accs = require("../../config.js").accounts
const buildships = require("../buildfleet/worker.js").checkexplorers
const explore = require("../explore/worker.js").precheck
const upgrade = require("../upgrade/worker.js").upgrade
const debug = require("../debug/worker.js").debug
const save = require("../debug/worker.js").save

module.exports = {planets, getstate, addmain, returnrotation}
let main = 0;
let accrotation = 0;
let bugobj = {}


function planets(){
  Request.get("https://api.nextcolony.io/loadplanets?user=" + accs[accrotation], (error,response, body) => {
  	if(error){console.log(error)}
  	if(body){
    body = JSON.parse(body);
    debug("Got planet data, to qyt");
    qyt(body.planets, []);
  	}
  })
}

function qyt(planets, arr){
  d = new Date();
  d = Math.floor(d / 1000);
  if(planets.length === 0){
    if(main === 1){
      debug("Got all planet qyt data to fleet")
      fleet(arr, []);
      return;
    }
    debug("Got all planet qyt data to buildings")
    buildings(arr, []);
    return;
  }
	Request.get("https://api.nextcolony.io/loadqyt?id=" + planets[0].id, (error,response,body) => {
		if(error){console.log(error)}
		if(body){
		  body = JSON.parse(body);
      body.lastUpdate = d - body.lastUpdate;
      body.coalrate = body.coalrate / 86400;
      body.coal = body.coal + (body.coalrate * body.lastUpdate);
      if(body.coal > body.coaldepot){body.coal = body.coaldepot};
      body.copperrate = body.copperrate / 86400;
      body.copper = body.copper + (body.copperrate * body.lastUpdate);
      if(body.copper > body.copperdepot){body.copper = body.copperdepot};
      body.orerate = body.orerate / 86400;
      body.ore = body.ore + (body.orerate * body.lastUpdate);
      if(body.ore > body.oredepot){body.ore = body.oredepot};
      body.uraniumrate = body.uraniumrate / 86400;
      body.uranium = body.uranium + (body.uraniumrate * body.lastUpdate);
      if(body.uranium > body.uraniumdepot){body.uranum = body.uraniumdepot}
		  planets[0].qyt = body;
          arr.push(planets[0]);
          planets.shift();
          debug("got planets qyt data.")
          qyt(planets, arr)
		}
	})
}

function buildings(planets, arr){
 if(planets.length === 0){
  if(main === 0){debug("got all planet building data to shipyard");shipyard(arr, []);return;}
  if(main === 2){debug("got all planet buildings data to skills");skills(arr, []);return;}
 }
  Request.get("https://api.nextcolony.io/loadbuildings?id=" + planets[0].id, (error,response,body) => {
  	if(error){console.log(error)};
  	if(body){
  		body = JSON.parse(body);
  		planets[0].buildings = body;
        arr.push(planets[0]);
        planets.shift();
        debug("got planet building data")
        buildings(planets, arr);
        return;
  	}
  })
}

function shipyard(planets, arr){
  if(planets.length === 0){
    bugobj.one = "got all planet shipyard data, to buildships";
    bugobj.two = JSON.stringify(arr);
    debug(bugobj);
    bugobj = {};
    buildships(arr);return;
  }
   Request.get("https://api.nextcolony.io/planetshipyard?user=" + accs[accrotation] + "&planet=" + planets[0].id, (error,response,body) => {
   	if(error){console.log(error)}
   	if(body){
   		body = JSON.parse(body);
   		planets[0].shipyard = body;
   		arr.push(planets[0]);
   		planets.shift();
      debug("got planet shipyard data");
   		shipyard(planets, arr);
      return;
   	}
   })
}

function fleet(planets, arr){
  if(planets.length === 0){
    debug("Got all fleet data, to mission")
    mission(arr, []);
    return;
  }
  Request.get("https://api.nextcolony.io/planetships?user=" + accs[accrotation] + "&planet=" + planets[0].id, (error,response,body)=>{
    if(error){console.log(error)}
    if(body){
      body = JSON.parse(body);
      planets[0].fleet = body;
      arr.push(planets[0]);
      planets.shift();
      debug("got fleet data")
      fleet(planets, arr);
      return;
    }
  })
} 


function mission(planets, arr){
  if(planets.length === 0){
    bugobj.one = "Got all mission data to explore";
    bugobj.two = JSON.stringify(arr);
    debug(bugobj);
    bugobj = {};
    explore(arr)
    return;
  }
  Request.get("https://api.nextcolony.io/missioninfo?user="+ accs[accrotation] + "&planet=" + planets[0].id, (error,response,body) =>{
    if(error){console.log(error)}
    if(body){
      body = JSON.parse(body);
      planets[0].mission = body;
      arr.push(planets[0]);
      planets.shift();
      debug("got mission data")
      mission(planets, arr);
      return;
    }
  })
}


function getstate(int){
  if(int === 0){
    bugobj.main = main;
    bugobj.accs = accs
    bugobj.rotation = accrotation;
    bugobj.rotlength = accs.length;
    debug(bugobj)
    bugobj = {};
    planets();return;}
  if(int === 1){
    bugobj.main = main;
    bugobj.rotation = accrotation;
    debug("getstate(1) to planets")
    bugobj = {};
    Request.get("https://api.nextcolony.io/state", (error,response,body) => {
      if(error){console.log(error)}
      if(body){
        body = JSON.parse(body);
        let timeout = 1000 * body.processing_delay_seconds
        timeout = timeout + 10000;
        setTimeout(planets, timeout)
        return;}
  })
  }
}

function skills(planets, arr){
  if(planets.length === 0){
    bugobj.one = "Got all skills data"
    bugobj.two = JSON.stringify(arr)
    debug(bugobj);
    bugobj = {};
    upgrade(arr, []);
    return;
  }
  Request.get("https://api.nextcolony.io/loadskills?user=" + accs[accrotation], (error,response,body)=>{
    if(error){console.log(error)}
    if(body){
      body = JSON.parse(body);
      planets[0].skills = body;
      arr.push(planets[0]);
      planets.shift();
      debug("got skills data.")
      skills(planets, arr);
      return;
    }
  })
  return;
}

function addmain(){
  bugobj.mainbefore = main;
  if(main === 0){console.log("finished checking for ships to build..")}
  if(main === 1){console.log("finished checking for space to explore..")}
  if(main === 2){console.log("finished checking for skills/buildings to upgrade..")}
  main++;
  bugobj.mainafter = main;
  bugobj.log = "added main"
  debug(bugobj);
  bugobj = {};
  if(main === 3){
    debug("main 3")
    main=0;
    accrotation++;
    bugobj.main = main;
    bugobj.accrotation = accrotation;
    bugobj.message = "should end script"
    debug(bugobj);
    bugobj = {};
    if(accrotation === accs.length){
      debug("accrotation at accounts length")
      let batman = config.sleep * 1000 * 60
      if(config.continious === false){debug("saving debug");save();console.log("end of script...");return;}
      else{accrotation=0;setTimeout(getstate, config.sleep, 1);return;}
    }
  }
  debug("getting state")
  getstate(1);
}

function returnrotation(){
  return accrotation;
}
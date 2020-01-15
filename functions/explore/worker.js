module.exports = {precheck}
var Request = require("request");
let txqueue = require("../transaction/pushtransaction.js").transactionqueue
let fs = require("fs")
let debug = require("../debug/worker.js").debug

let bugobj = {};


function precheck(data){
  if(data.length === 0){
    if(shortestdistance.length > 0){
      funkyshortestdistance([]);
      return;
    }
  	let nextstep = require("../data/getdata.js").addmain
    debug("out of planets, moving to next step")
  	nextstep();
  	return;
  }
  bugobj.fleet_length = data[0].fleet.length;
  bugobj.mission_allowed = data[0].mission.mission_allowed;
  bugobj.mission_planet_active_max = data[0].mission.planet_active < data[0].mission.planet_max;
  bugobj.mission_user_unused = data[0].mission.user_unused;
  debug(bugobj);
  bugobj = {};
  if(data[0].fleet.length > 0 &&  data[0].mission.mission_allowed === true &&
  data[0].mission.planet_active < data[0].mission.planet_max &&
  data[0].mission.user_unused > 0){
   for(var i=0;i<data[0].fleet.length;i++){
   	if(data[0].fleet[i].longname === "Explorer II"){
      debug("Fleetis on explorer II, mida saab kasutada")
   		data[0].shipused = data[0].fleet[i].type;
   		data[0].consumption = data[0].fleet[i].consumption;
      data[0].shipspeed = data[0].fleet[i].speed;
      data[0].step = 0;
      data[0].cube = 0;
      data[0].cubetarget = 0;
      data[0].potentialcords = {"x":0,"y":0};
      data[0].homecords = {"x":data[0].posx,"y":data[0].posy};
   		precordinate(data);
   		return;
   	}
   	if(i === data[0].fleet.length - 1 && data[0].fleet[i].longname !== "Explorer II"){
   		for(var j=0;j<data[0].fleet.length;j++){
   			if(data[0].fleet[j].longname === "Explorer"){
          debug("Fleetis on explorer, mida saab kasutada")
   				data[0].shipused = data[0].fleet[j].type;
   				data[0].consumption = data[0].fleet[j].consumption;
          data[0].shipspeed = data[0].fleet[j].speed;
          data[0].step = 0;
          data[0].cube = 0;
          data[0].cubetarget = 0;
          data[0].potentialcords = {"x":0,"y":0};
          data[0].homecords = {"x":data[0].posx,"y":data[0].posy};
   				precordinate(data);
   				return;
   			}
   		}
   	}
   }
  }
  debug("Ei ole ühtegi laeva mida saab kasutada @" + data[0].id)
  data.shift()
  precheck(data);
}

async function precordinate(planets){//filesystem to get cubetarget
  let planetfile;
  debug("üritab lugeda faili pealt vanu kordinaate")
  fs.readFile(__dirname + '/planetcube.json', "utf8", (err, data) => {
  if (err) throw err;
  planetfile = JSON.parse(data);
  for(var i=0;i<planetfile.length;i++){
    if(planetfile[i].id === planets[0].id){
      debug("leidis faili pealt vanad kordinaadid")
      planets[0].cubetarget = planetfile[i].target;
      planets[0].posx = planetfile[i].x;
      planets[0].posy = planetfile[i].y;
      planets[0].cube = planetfile[i].cube;
      planets[0].step = planetfile[i].step;
    }
  }
  debug("otsib kordinaate")
  checkcordinate(planets);
  return;
  });
}

function checkcordinate(data){
  debug("lf cords")
  Request.get("https://api.nextcolony.io/loadgalaxy?x=" + data[0].posx + "&y=" + data[0].posy + 
    "&heigth=" + 12 + "&width=" + 12, (error,response,body)=>{
    if(error){console.log(error)}
    if(body){
      body = JSON.parse(body)
      for(var i=-6;i<6;i++){
        for(var j=-6;j<6;j++){
          let x = data[0].posx + i;
          let y = data[0].posy + j;
          for(var q=0;q<body.explored.length;q++){
            if(x === body.explored[q].x && y === body.explored[q].y){
              break;
            }
            if(q === body.explored.length - 1 &&
              x !== body.explored[q].x && y !== body.explored[q].y){
              for(var w=0;w<body.planets.length;w++){
                if(x === body.planets[w].x && y === body.planets[w].y){
                  break;
                }
                if(w === body.planets.length - 1 &&
                  x !== body.planets[w].x && y !== body.planets[w].y){
                  for(var e=0;e<body.explore.length;e++){
                    if(x === body.explore[e].x && y === body.explore[e].y){
                      break;
                    }
                    if(e === body.explore.length - 1 &&
                      x !== body.explore[e].x && y !== body.explore[e].y){
                        console.log("found cords at: " + x + " " + y)////winnrar
                        data[0].potentialcords.x = x;
                        data[0].potentialcords.y = y;
                        debug("leidis kordinaadid")
                        checkfuel(data);
                        return;
                    }
                  }
                }
              }
            }
          }
        } 
      }
      console.log("lf cords at: " + JSON.stringify(body.area));
      algo(data)
      return;
    }
  })
}



function algo(data){
  if(data[0].step === 0){
  data[0].posy = Math.floor(data[0].posy + 12);
  if(data[0].cube === data[0].cubetarget){
    data[0].cube = 0;
    data[0].step++;
    checkcordinate(data);
    return;
  }
  data[0].cube++;
  checkcordinate(data);
  return;
  }
  if(data[0].step === 1){
   data[0].posx = Math.floor(data[0].posx + 12);
    if(data[0].cube === data[0].cubetarget){
      data[0].cube = 0;
      data[0].step++;
      data[0].cubetarget++;
      checkcordinate(data);
      return;
    }
    data[0].cube++;
    checkcordinate(data);
    return;
  }
  if(data[0].step === 2){
    data[0].posy = Math.floor(data[0].posy - 12);
    if(data[0].cube === data[0].cubetarget){
      data[0].cube = 0;
      data[0].step++;
      checkcordinate(data);
      return;
    }
    data[0].cube++;
    checkcordinate(data);
    return;
  }
  if(data[0].step === 3){
    data[0].posx = Math.floor(data[0].posx - 12);
    if(data[0].cube === data[0].cubetarget){
      data[0].cube = 0;
      data[0].step = 0;
      data[0].cubetarget++;
      checkcordinate(data);
      return;
    }
    data[0].cube++;
    checkcordinate(data);
    return;
  }
}

function checkfuel(planets){
  debug("kontrollib kütsi")
  let planetfile;
  fs.readFile(__dirname + '/planetcube.json', "utf8", (err, data) => {
    if (err) throw err;
    planetfile = JSON.parse(data)
    let dummyobj = {
      "id":planets[0].id,
      "target":planets[0].cubetarget,
      "x":planets[0].posx,
      "y":planets[0].posy,
      "cube": planets[0].cube,
      "step": planets[0].step
    }
    function diff(a,b){return Math.abs(a-b);}
    let fuelrequired =  diff(planets[0].homecords.x, planets[0].potentialcords.x) + diff(planets[0].homecords.y, planets[0].potentialcords.y)
    planets[0].distance = fuelrequired / planets[0].shipspeed;
    fuelrequired = fuelrequired * planets[0].consumption
    if(fuelrequired < planets[0].qyt.uranium){
      debug("on piisavalt kütsi")
      for(var i=0;i<planetfile.length;i++){
        if(i === planetfile.length - 1 && planetfile[i].id !== planets[0].id){
          planetfile.push(dummyobj);
          fs.writeFile(__dirname + '/planetcube.json', JSON.stringify(planetfile), function (err) {
            if (err) throw err;
            debug("toshortestdistance")
            funkyshortestdistance(planets);
            return;
          });
          return;
        }
        if(planetfile[i].id === planets[0].id){
          planetfile[i] = dummyobj
          fs.writeFile(__dirname + '/planetcube.json', JSON.stringify(planetfile), function (err) {
            if (err) throw err;
            debug("toshortestdistance")
            funkyshortestdistance(planets);
            return;
          });
          return;
        }
      }
    }
    else{debug("ei ole piisavalt kütsi");planets.shift();precheck(planets);return;}
    return;
  });
}

let shortestdistance = [];

function funkyshortestdistance(planets){
 if(planets.length === 0){
  shortestdistance = shortestdistance.sort(function(a,b){return a.distance - b.distance});
  transaction(shortestdistance);
  return;}
 shortestdistance.push(planets[0]);
 planets.shift();
 precheck(planets);
 return;
}

function transaction(data){
  shortestdistance = [];
  dummyobj = [{
  "username": data[0].username,
  "type": "explorespace",
  "command": { 
   "tr_var1": data[0].id,
   "tr_var2": data[0].potentialcords.x,
   "tr_var3": data[0].potentialcords.y,
   "tr_var4": data[0].shipused}
  }]
  txqueue(dummyobj)
}

module.exports = {debug, save}
let fs = require("fs")
const config = require("../../config.js").config


let step = 0;
let bugobj = {};

function debug(toobj){
  if(config.debug === true){
    step++
    bugobj[step] = toobj
    return;
  }
}

function save(){
  if(config.debug === true){
   fs.writeFile(__dirname + '/scriptlog.js', JSON.stringify(bugobj), function (err) {
    if (err) throw err;
    console.log("saved logfile to /functions/debug/scriptlog.log")
    return;
   });
  }
}
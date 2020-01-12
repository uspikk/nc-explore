let x = 0;
let y = 0;

let step = 0;
let cube = 0;
let cubetarget = 0;

function algo(){
  if(step === 0){
	y++;
	if(cube === cubetarget){
	  cube = 0;
	  step++;
	  algos();
	  return;
	}
	cube++;
	algos();
	return;
  }
  if(step === 1){
    x++;
    if(cube === cubetarget){
      cube = 0;
      step++;
      cubetarget++;
      algos();
      return;
    }
    cube++;
    algos();
    return;
  }
  if(step === 2){
    y--;
    if(cube === cubetarget){
  	  cube = 0;
  	  step++;
  	  algos();
  	  return;
    }
    cube++;
    algos();
    return;
  }
  if(step === 3){
    x--;
    if(cube === cubetarget){
    	cube = 0;
    	step = 0;
    	cubetarget++;
    	algos();
    	return;
    }
    cube++;
    algos();
    return;
  }
}

function algos(){
	setTimeout(algo, 100)
}

algo();
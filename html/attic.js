
function draw_house(x){
  context.fillStyle = house_color ;
  context.moveTo(x   ,h-50) ;
  context.lineTo(x+25,h-75) ;
  context.lineTo(x+50,h-50) ;
  context.lineTo(x+50,h   ) ;
  context.lineTo(x   ,h   ) ;
  context.fill() ;
  context.fillRect(x+35,h-70,10,20) ;
}

function draw_factory(x){
  context.fillStyle = house_color ;
  context.moveTo(x   ,h-50) ;
  context.lineTo(x+25,h-75) ;
  context.lineTo(x+50,h-50) ;
  context.lineTo(x+50,h   ) ;
  context.lineTo(x   ,h   ) ;
  context.fill() ;
  context.fillRect(x+35,h-70,10,20) ;
}

function draw_coolingTower(x,dy){
  var y1 = 80 ;
  var y2 = 40 ;
  var r  = 150 ;
  var width = 80 ;
  var t1 = Math.asin(y1/r) ;
  var t2 = Math.asin(y2/r) ;
  var x0 = x  - r*Math.cos(t1) ;
  var x1 = x  + width ;
  var x2 = x1 + r*Math.cos(t2) ;
  context.moveTo(x,h+dy) ;
  context.arc(x0,h-y1+dy,r,t1,-t2,true) ;
  context.lineTo(x+width,h-y1-y2+dy) ;
  context.arc(x2,h-y1+dy,r,Math.PI+t2,Math.PI-t1,true) ;
  context.lineTo(x,h+dy) ;
  context.fill() ;
}

function draw_needle(x,dy){
  var y1 = 225 ;
  var y2 = 150 ;
  var r  = 650 ;
  var width = 90 ;
  var t1 = Math.asin(y1/r) ;
  var t2 = Math.asin(y2/r) ;
  var x0 = x - 0.5*width - r*Math.cos(t1) ;
  var x2 = x + 0.5*width + r*Math.cos(t1) ;
  context.moveTo(x,h+dy) ;
  context.arc(x0,h-y1+dy,r,t1,-t2,true) ;
  context.lineTo(x+width,h-y1-y2+dy) ;
  context.arc(x2,h-y1+dy,r,Math.PI+t2,Math.PI-t1,true) ;
  context.lineTo(x,h+dy) ;
  context.fill() ;
  
  var r2 = 50 ;
  context.beginPath() ;
  var y = h-y1-y2+dy-20 ;
  context.arc(x,y,r2,-Math.PI,0,true) ;
  context.fill() ;
  y = h-y1-y2+dy ;
  context.arc(x,y,r2,-Math.PI,0,false) ;
  context.fill() ;
  
  var spire_height = 50 ;
  context.beginPath() ;
  context.moveTo(x,h-y1-y2-r2-spire_height) ;
  context.lineTo(x-10,h-y1-y2-r2+5) ;
  context.lineTo(x+10,h-y1-y2-r2+5) ;
  context.fill() ;
}

function draw_skyscraper(x){
  context.fillStyle = house_color ;
  context.moveTo(x   ,h    ) ;
  context.lineTo(x   ,h-175) ;
  context.lineTo(x+80,h-175) ;
  context.lineTo(x+80,h   ) ;
  context.lineTo(x   ,h   ) ;
  context.fill() ;
}

function draw_highway(x,n){
  context.fillStyle = house_color ;
  var y = 20 ;
  var spacer = 50 ;
  var overhang = 10 ;
  var column_width = 10 ;
  var width = spacer*(n-1)+overhang*2+column_width ;
  context.fillRect(x-overhang,h-y-5,width,5) ;
  for(var i=0 ; i<n ; i++){
    var x1 = x+i*spacer ;
    context.fillRect(x1,h-y,column_width,h) ;
  }
}







path = [] ;
{
path.push([0,300,'l']) ;
path.push([0,0,'l']) ;
path.push([30,0,'l']) ;
path.push([30,200,'l']) ;
path.push([50,200,'l']) ;
path.push([100,150,'l']) ;
path.push([100,200,'l']) ;
path.push([150,150,'l']) ;
path.push([150,200,'l']) ;
path.push([200,150,'l']) ;
path.push([200,200,'l']) ;
path.push([250,150,'l']) ;
path.push([250,300,'l']) ;
path.push([0,300,'l']) ;
path.push([30,220,'m']) ;
path.push([50,220,'l']) ;
path.push([50,240,'l']) ;
path.push([30,240,'l']) ;
path.push([30,220,'l']) ;
path.push([30,260,'m']) ;
path.push([50,260,'l']) ;
path.push([50,280,'l']) ;
path.push([30,280,'l']) ;
path.push([30,260,'l']) ;
path.push([70,220,'m']) ;
path.push([70,240,'l']) ;
path.push([90,240,'l']) ;
path.push([90,220,'l']) ;
path.push([70,220,'l']) ;
path.push([110,220,'m']) ;
path.push([110,240,'l']) ;
path.push([130,240,'l']) ;
path.push([130,220,'l']) ;
path.push([110,220,'l']) ;
path.push([150,220,'m']) ;
path.push([150,240,'l']) ;
path.push([170,240,'l']) ;
path.push([170,220,'l']) ;
path.push([150,220,'l']) ;
path.push([190,220,'m']) ;
path.push([190,240,'l']) ;
path.push([210,240,'l']) ;
path.push([210,220,'l']) ;
path.push([190,220,'l']) ;
path.push([190,260,'m']) ;
path.push([210,260,'l']) ;
path.push([210,280,'l']) ;
path.push([190,280,'l']) ;
path.push([190,260,'l']) ;
path.push([150,260,'m']) ;
path.push([170,260,'l']) ;
path.push([170,280,'l']) ;
path.push([150,280,'l']) ;
path.push([150,260,'l']) ;
path.push([110,260,'m']) ;
path.push([130,260,'l']) ;
path.push([130,280,'l']) ;
path.push([110,280,'l']) ;
path.push([110,260,'l']) ;
path.push([70,260,'m']) ;
path.push([90,260,'l']) ;
path.push([90,280,'l']) ;
path.push([70,280,'l']) ;
path.push([70,260,'l']) ;
}
var building_factory = new building_object(path) ;
buildings.push(building_factory) ;

<?php
$title = 'Skyline' ;
$js_scripts = array('building.js' , 'add_paths.js') ;
include($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>
<script type="text/ecmascript">
var w = 2500 ;
var h =  500 ;

var canvas  = 0 ;
var context = 0 ;

// Colors
var sky_blue = 'rgb(136,205,234)' ;
var house_color = 'rgb(255,255,255)' ;

//var sky_blue = 'rgb(0,0,200)' ;
var house_color = 'rgb(0,0,0)' ;

var saved_paths = [] ;

function start(){
  make_buildings() ;

  canvas = document.getElementById('canvas_skyline') ;
  context = canvas.getContext('2d') ;
  draw_sky() ;
  for(var i=0 ; i<buildings.length ; i++){
    buildings[i].context = context ;
    buildings[i].fill_color = house_color ;
    buildings[i].stroke_color = 'rgb(255,255,255)' ;
    buildings[i].stroke = false ;
    buildings[i].margin = 0 ;
    buildings[i].update_dimensions(buildings[i].path,1.0) ;
    buildings[i].bool_draw_windows = false ;
  }
  
  var b_Skyscraper2 = buildings[2] ;
  //b_Skyscraper2.draw(1,200) ;
  //b_Skyscraper2.draw(0.9,500) ;
  
  
  var b_house = buildings[0] ;
  var scale = 0.5 ;
  var dy = h-scale*b_house.h ;
  b_house.draw(scale,100,dy) ;
  
  var b_skyscraper1 = buildings[1] ;
  var scale = 0.5 ;
  var dy = h-scale*b_skyscraper1.h ;
  b_skyscraper1.draw(scale,100,dy) ;
  
  var b_skyscraper2 = buildings[2] ;
  var scale = 0.8 ;
  var dy = h-scale*b_skyscraper2.h ;
  b_skyscraper2.draw(scale,350,dy) ;
  
  var b_needle = buildings[3] ;
  var scale = 0.8 ;
  var dy = h-scale*b_needle.h ;
  b_needle.draw(scale,220,dy) ;
  
  var b_skyscraper3 = buildings[4] ;
  var scale = 0.8 ;
  var dy = h-scale*b_skyscraper3.h ;
  b_skyscraper3.draw(scale,500,dy) ;
  
  var b_skyscraper4 = buildings[5] ;
  var scale = 0.8 ;
  var dy = h-scale*b_skyscraper4.h ;
  b_skyscraper4.draw(scale,600,dy) ;
  
  var b_skyscraper5 = buildings[6] ;
  var scale = 0.8 ;
  var dy = h-scale*b_skyscraper5.h ;
  b_skyscraper5.draw(scale,700,dy) ;
  b_skyscraper5.draw(scale,800,dy) ;
  
  var b_coolingTower = buildings[8] ;
  var scale = 0.8 ;
  var dy = h-scale*b_coolingTower.h ;
  b_coolingTower.draw(scale,900,dy) ;
  var scale = 0.7 ;
  var dy = h-scale*b_coolingTower.h ;
  b_coolingTower.draw(scale,980,dy) ;
  
  var b_flats = buildings[9] ;
  var scale = 0.8 ;
  var dy = h-scale*b_flats.h ;
  b_flats.draw(scale,200,dy) ;
  var scale = 0.5 ;
  var dy = h-scale*b_flats.h ;
  b_flats.draw(scale,400,dy) ;
  
  var b_church = buildings[10] ;
  var scale = 0.8 ;
  var dy = h-scale*b_church.h ;
  b_church.draw(scale,1200,dy) ;
  
  
  var b_ball = buildings[11] ;
  var scale = 0.45 ;
  var dy = h-scale*b_ball.h ;
  b_ball.draw(scale,1050,dy) ;
  
  
  var b_bridge = buildings[12] ;
  var scale = 0.85 ;
  var dy = h-scale*b_bridge.h+60 ;
  b_bridge.draw(scale,1350,dy) ;
  
  
  var b_bridge2 = buildings[13] ;
  var scale = 0.85 ;
  var dy = h-scale*b_bridge2.h+60 ;
  b_bridge2.draw(scale,1800,dy) ;
}
function draw_sky(){
  context.fillStyle = sky_blue ;
  context.fillRect(0,0,w,h) ;
}

</script>
</head>
    <div class="right">
      <h3>About this page</h3>
      <div class="blurb">
        <p>This page should make some nifty vector art skyline graphics.</p>
      </div>
    </div>
    
    <div class="right">
      <h3>The canvas</h3>  
      <div class="blurb">
        <canvas id="canvas_skyline" width="2500" height="500"></canvas>
      </div>
    </div>
    
<?php foot() ; ?>

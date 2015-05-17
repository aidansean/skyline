var w =  750 ;
var h = 6000 ;

var g_w = 400 ;
var g_h = 400 ;

var canvas  = 0 ;
var context = 0 ;

var debug = 0 ;
var paintbrush = 'line' ;
var new_layer = false ;
var draw_floor_numbers = true ;
var draw_heights       = true ;

var large_tick = 50 ;
var small_tick = 10 ;

var marker_x = -1 ;
var marker_y = -1 ;

var current_path = [] ;
var saved_paths = [] ;

// Windows settings
var w_x1 = -1 ;
var w_y1 = -1 ;
var w_mx = small_tick ;
var w_my = small_tick ;
var w_sx = small_tick ;
var w_sy = 2*small_tick ;
var w_w  = small_tick ;
var w_h  = 2*small_tick ;


function start(){
  canvas = document.getElementById('canvas_skyline') ;
  context = canvas.getContext('2d') ;
  canvas.addEventListener('mousedown', mouse_down) ;
  canvas.addEventListener('mousemove', mouse_move) ;
  document.addEventListener('keydown'  , key_down  ) ;
  document.addEventListener('keyup'    , key_up    ) ;
  
  window.oncontextmenu = function() { return false } ;
  draw_all() ;
  add_paths() ;
}

function draw_graph_paper(){
  // Draw floor numbers and heights
  var floor_counter = 0 ;
  for(var y=h ; y>=0 ; y-=large_tick){
    context.font = 0.5*large_tick+'px arial black' ;
    context.fillStyle = 'rgb(200,200,200)' ;
    if(draw_floor_numbers) context.fillText(floor_counter,w-large_tick,y-small_tick) ;
    context.font = 0.25*large_tick+'px arial black' ;
    context.fillStyle = 'rgb(100,100,100)' ;
    var height = floor_counter*3.0 ;
    if(draw_heights      ) context.fillText(height+'m',w-2*large_tick+small_tick,y-small_tick) ;
    floor_counter++ ;
  }
  
  // Draw graph paper
  context.lineWidth = 1 ;
  context.strokeStyle = 'rgb(200,200,200)' ;
  for(var x=0 ; x<=w ; x+=small_tick){
    context.beginPath() ;
    context.moveTo(x,0) ;
    context.lineTo(x,h) ;
    context.stroke() ;
  }
  for(var y=0 ; y<=h ; y+=small_tick){
    context.beginPath() ;
    context.moveTo(0,y) ;
    context.lineTo(w,y) ;
    context.stroke() ;
  }
  
  context.strokeStyle = 'rgb(100,100,100)' ;
  for(var x=0 ; x<=w ; x+=large_tick){
    context.beginPath() ;
    context.moveTo(x,0) ;
    context.lineTo(x,h) ;
    context.stroke() ;
  }
  for(var y=0 ; y<=h ; y+=large_tick){
    context.beginPath() ;
    context.moveTo(0,y) ;
    context.lineTo(w,y) ;
    context.stroke() ;
  }
}

function XY_from_mouse(evt){
  var X = evt.pageX - evt.target.offsetLeft ;
  var Y = evt.pageY - evt.target.offsetTop  ;
  return [X,Y] ;
}

function clear_canvas(){
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillRect(0,0,w,h) ;
}

function draw_all(){
  clear_canvas() ;
  draw_graph_paper() ;
  draw_current_path(1,0,0) ;
  draw_marker() ;
}

function draw_marker(){
  if(marker_x<0 || marker_y<0) return ;
  if(marker_x>w || marker_y>h) return ;
  var r = 5 ;
  context.beginPath() ;
  context.fillStyle = 'rgb(255,200,200)' ;
  context.arc(marker_x,marker_y,r,0,2*Math.PI,true) ;
  context.fill() ;
  context.closePath() ;
}

function key_down(evt){
  var keyDownID = window.event ? event.keyCode : (evt.keyCode != 0 ? evt.keyCode : evt.which) ;
  switch(keyDownID){
    case 49: paintbrush = 'window_fill'; break ; // 1
    case 65: paintbrush = 'arc'        ; break ; // a
    case 78: // n
      current_path.push( [-1,-1,'n'] ) ;
      new_layer = true ;
      break ; // n
    case 87: paintbrush = 'window'     ; break ; // w
    case 32: // space
      evt.preventDefault() ;
      current_path.splice(current_path.length-1,1) ;
      draw_all() ;
      break ;
    case 13: // enter
      evt.preventDefault() ;
      add_image(current_path) ;
      current_path = [] ;
      draw_all() ;
      break ;
  }
}
function key_up(evt){
  paintbrush = 'line' ;
}

function draw_current_path(scale,x0,y0){
  if(scale==null) scale = 1.0 ;
  if(x0==null) x0 = 0 ;
  if(y0==null) y0 = 0 ;
  var p0 = current_path[0] ;
  if(p0==undefined) return ;
  
  context.lineWidth = 2 ;
  for(var i=0 ; i<current_path.length ; i++){
    var p = current_path[i] ;
    var x = p0[0] + x0 + scale*(p[0]-p0[0]) ;
    var y = p0[1] + y0 + scale*(p[1]-p0[1]) ;
    if(i==0) continue ;
    
    var p2 = current_path[i-1] ;
    context.beginPath() ;
    context.moveTo(p2[0],p2[1]) ;
    if(p[2]=='l'){ // It's a line!
      context.strokeStyle = 'rgb(0,0,255)' ;
      context.lineTo(x,y) ;
      context.stroke() ;
      context.closePath() ;
    }
    else if(p[2]=='m'){ // It's a move!
      context.moveTo(x,y) ;
    }
    else if(p[2]=='w'){ // It's a window!
      context.moveTo(x,y) ;
    }
    else if(p[2]=='a'){ // It's an arc!
      var cp = p[3] ;
      context.beginPath() ;
      context.strokeStyle = 'rgb(0,200,0)' ;
      context.arc(cp[0],cp[1],cp[2],cp[3],cp[4],cp[5]) ;
      context.stroke() ;
      context.closePath() ;
    }
  }
}

function mouse_move(evt){
  var XY = XY_from_mouse(evt) ;
  var tick = small_tick ;
  var x = XY[0] ;
  var y = XY[1] ;
  
  var u = Math.floor(x/tick) ;
  var v = Math.floor(y/tick) ;
  marker_x = u*tick ;
  marker_y = v*tick ;
  
  draw_all() ;
  
  if(paintbrush=='line'){
    if(current_path.length<1) return ;
    var p = current_path[current_path.length-1] ;
    context.beginPath() ;
    context.strokeStyle = 'rgb(255,0,0)' ;
    context.moveTo(p[0],p[1]) ;
    context.lineTo(marker_x,marker_y) ;
    context.stroke() ;
  }
  else if(paintbrush=='arc'){
    if(current_path.length<2) return ;
    var p1 = current_path[current_path.length-2] ;
    var p2 = current_path[current_path.length-1] ;
    var p3 = [marker_x,marker_y] ;
    var cp = get_circle_parameters(p1,p2,p3) ;
    
    context.beginPath() ;
    context.strokeStyle = 'rgb(255,0,0)' ;
    context.arc(cp[0],cp[1],cp[2],cp[3],cp[4],cp[5]) ;
    context.stroke() ;
  }
}

function get_circle_parameters(p1,p2,p3){
  var x1 = p1[0] ; var y1 = p1[1] ;
  var x2 = p2[0] ; var y2 = p2[1] ;
  var x3 = p3[0] ; var y3 = p3[1] ;
    
  // Get the angle
  var t = Math.atan2(y2-y1,x2-x1) ;
    
  // Move the origin to (x1,y1)
  x3 -= x1 ; y3 -= y1 ;
  x2 -= x1 ; y2 -= y1 ;
    
  // Rotate the points
  var x2_tmp = x2 ; var y2_tmp = y2 ;
  var x3_tmp = x3 ; var y3_tmp = y3 ;
  x2 = x2_tmp*Math.cos(t) + y2_tmp*Math.sin(t) ;
  y2 = y2_tmp*Math.cos(t) - x2_tmp*Math.sin(t) ;
  x3 = x3_tmp*Math.cos(t) + y3_tmp*Math.sin(t) ;
  y3 = y3_tmp*Math.cos(t) - x3_tmp*Math.sin(t) ;
    
  // Get the altitude above the line
  var a = y3 ;
  if(Math.abs(a)<1e-6) return [0,0,0,0,0,0] ; // Bail out for an infinite radius!
    
  // Let d be the depth below the line
  // Then r = a + d
  // t is the half angle between the radii
  // So d = r*cos(t)
  // 2l is the length of the line
  // l = r*sin(t)
  // r = a + d
  // r^2 = l^2 + d^2
  // a^2 + 2ad + d^2 = l^2 + d^2
  // a^2 + 2ad = l^2
  // d = (l^2 - a^2)/(2a)
  var l = 0.5*x2 ;
  var d = (l*l-a*a)/(2*a) ;
  var cx =  l ;
  var cy = -d ;
  // Set direction based on whether the altitude is above or below the line
  var dir = (a>0) ;
    
  // Get the radius
  var r = a + d ;
    
  // Rotate (x3,y3) back to get the centre of the arc
  var cx_tmp = cx ;
  var cy_tmp = cy ;
  cx = cx_tmp*Math.cos(t) - cy_tmp*Math.sin(t) ;
  cy = cy_tmp*Math.cos(t) + cx_tmp*Math.sin(t) ;
  
  // Now we have radius, move the origin again
  cx += x1 ; cy += y1 ;
  
  var t1 = Math.atan2(p1[1]-cy,p1[0]-cx) ;
  var t2 = Math.atan2(p2[1]-cy,p2[0]-cx) ;
  
  return [cx,cy,Math.abs(r),t1,t2,dir] ;
}

function mouse_down(evt){
  // Is it a right click?
  var rightclick ;
  if(!evt) var evt = window.event ;
  if(evt.which) rightclick = (evt.which==3) ;
  else if(evt.button) rightclick = (evt.button==2) ;
  
  var XY = XY_from_mouse(evt) ;
  
  var tick = small_tick ;
  var u = Math.floor(XY[0]/tick) ;
  var v = Math.floor(XY[1]/tick) ;
  var x = u*tick ;
  var y = v*tick ;
  
  if(rightclick){
    current_path.push( [x,y,'m'] ) ;
    if(debug) $('#debug').append('m: '+x+' '+y+'\n') ;
  }
  else{
    if(paintbrush=='line'){
      if(new_layer){
        current_path.push( [x,y,'m'] ) ;
        new_layer = false ;
      }
      else{
        current_path.push( [x,y,'l'] ) ;
      }
      if(debug) $('#debug').append('l: '+x+' '+y+'\n') ;
    }
    else if(paintbrush=='window'){
      current_path.push( [x,y,'w'] ) ;
      if(debug) $('#debug').append('w: '+x+' '+y+'\n') ;
    }
    else if(paintbrush=='window_fill'){
      if(w_x1<0 || w_y1<0){
        w_x1 = x ;
        w_y1 = y ;
      }
      else{
        var w_x2 = x ;
        var w_y2 = y ;
        var mini_path = fill_windows_area(w_x1,w_y1,w_x2,w_y2,w_w,w_h,w_mx,w_my,w_sx,w_sy,small_tick) ;
        for(var i=0 ; i<mini_path.length ; i++){
          current_path.push(mini_path[i]) ;
        }
        w_x1 = -1 ;
        w_y1 = -1 ;
      }
    }
    else if(paintbrush=='arc'){
      var p1 = current_path[current_path.length-2] ;
      var p2 = current_path[current_path.length-1] ;
      var p3 = [marker_x,marker_y] ;
      var cp = get_circle_parameters(p1,p2,p3) ;
      var l = current_path.splice(current_path.length-1,1) ;
      current_path.push( [x,y,'a',cp] ) ;
      if(debug) $('#debug').append('l: '+x+' '+y+'\n') ;
    }
    draw_all() ;
  }
  return ;
}

function add_image(path){
  var building = new building_object(path) ;
  saved_paths.push(building) ;
  saved_paths[saved_paths.length-1].draw() ;
  
  var tbody = document.getElementById('tbody_gallery') ;
  var tr = document.createElement('tr') ;
  var td ;
  td = document.createElement('td') ;
  var canvas = building.canvas ;
  
  var max_height = 300 ;
  var cs_width = 300 ;
  var cs_height = cs_width*canvas.height/canvas.width ;
  if(cs_height>max_height){
    cs_height = max_height ;
    cs_width = cs_height*canvas.width/canvas.height ;
  }
  canvas.style.width  = cs_width  + 'px' ;
  canvas.style.height = cs_height + 'px' ;
  td.appendChild(canvas) ;
  tr.appendChild(td) ;
  
  td = document.createElement('td') ;
  var textarea = document.createElement('textarea') ;
  var code = building.write_output() ;
  code = code.join('\n') ;
  textarea.value = code ;
  textarea.cols = 40 ;
  textarea.rows =  5 ;
  td.appendChild(textarea) ;
  tr.appendChild(td) ;
  
  td = document.createElement('td') ;
  var span = document.createElement('input') ;
  span.type = 'submit' ;
  span.id = 'span_load_' + (saved_paths.length-1) ;
  span.value = 'Load' ;
  span.onclick = function(evt){
    var id = evt.target.id ;
    var index = parseInt(id.split('_')[2]) ;
    buildings[index].center_points(w,h,small_tick) ;
    current_path = buildings[index].raw_path ;
    draw_all() ;
  }
  td.appendChild(span) ;
  tr.appendChild(td) ;
  
  tbody.appendChild(tr) ;
  
  $('#master_code').append(code) ;
}



function fill_windows_area(x1,y1,x2,y2,ww,wh,mx,my,sx,sy,tick){
  // (x1,y1) and (x2,y2) are the bounding points
  // ww and wh are the window width and height
  // mx and my are the margins around the window area
  // sx and sy are the space between the windows
  // sx and sy are respected, whereas the margins are increased to take up free space
  
  // Swap values if needed
  if(x2<x1){ var xtmp = x1 ; x2 = x1 ; x1 = xtmp ; }
  if(y2<y1){ var ytmp = y1 ; y2 = y1 ; y1 = ytmp ; }
  var w = x2-x1 ;
  var h = y2-y1 ;
  
  var n_x = Math.floor((w+sx-2*mx)/(ww+sx)) ;
  var n_y = Math.floor((h+sy-2*my)/(wh+sy)) ;
  var w_used = n_x*(ww+sx)-sx ;
  var h_used = n_y*(wh+sy)-sy ;
  var w_free = w - w_used ;
  var h_free = h - h_used ;
  
  // Adjust the margins
  mx = tick*Math.floor(0.5*w_free/tick) ;
  my = tick*Math.floor(0.5*h_free/tick) ;
  
  var mini_path = [] ;
  for(var i=0 ; i<n_x ; i++){
    var x = x1 + mx + i*(ww+sx) ;
    for(var j=0 ; j<n_y ; j++){
      var y = y1 + my + j*(wh+sy) ;
      mini_path.push( [x   ,y   ,'w'] ) ;
      mini_path.push( [x+ww,y   ,'l'] ) ;
      mini_path.push( [x+ww,y+wh,'l'] ) ;
      mini_path.push( [x   ,y+wh,'l'] ) ;
      mini_path.push( [x   ,y   ,'l'] ) ;
    }
  }
  return mini_path ;
}
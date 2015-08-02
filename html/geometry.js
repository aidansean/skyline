// Model the current user interactions as beads on a rope
var current_layer_number = 0 ;
var current_rope = new rope_object(current_layer_number) ;
var current_rope_store = [] ;
var force_closed_ropes = true ;

var small_tick = 10 ;
var large_tick = 50 ;
var w =  750 ;
var h = 6000 ;

var debug = false ;

var canvas  = 0 ;
var context = 0 ;

var draw_floor_numbers = true ;
var draw_heights       = true ;
var mode = 'guide' ;

var marker_r = 5 ;

var tolerance = 1e-3 ;

// Possible paintbrush options:
// Straight line between two points
// Move to a new point
// Circular arc between two points, passing through a control point
// Quadratic curve between two points, passing through a control point
var paintbrush = 'line' ;

function quad_arc(x1,y1,x2,y2,x3,y3){
  this.x1 = x1 ;
  this.y1 = y1 ;
  this.x2 = x2 ;
  this.y2 = y2 ;
  this.qx = x3 ;
  this.qy = y3 ;
  
  this.draw = function(context){
    context.quadraticCurveTo(this.x2,this.y2,this.qx,this.qy) ;
  }
}

function circle_arc(x1,y1,x2,y2,x3,y3){
  // Get the angle
  var x1_0 = x1 ;
  var y1_0 = y1 ;
  var x2_0 = x2 ;
  var y2_0 = y2 ;
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
  
  var t1 = Math.atan2(y1_0-cy,x1_0-cx) ;
  var t2 = Math.atan2(y2_0-cy,x2_0-cx) ;
  
  this.cx  = cx ;
  this.cy  = cy ;
  this.r   = Math.abs(r) ;
  this.t1  = t1 ;
  this.t2  = t2 ;
  this.dir = dir ;
  
  this.draw = function(context){
    context.arc(this.cx,this.cy,this.r,this.t1,this.t2,this.dir) ;
  }
}

function shape(rope){
  // For now force a rope to be closed
  // Then arrange in a clockwise order
  rope.order_clockwise() ;
  this.rope = rope ;
  this.draw = function(color){
    this.rope.draw(color) ;
  }
}

function find_closest_intersection(b1,b2,r){
  var best_d2 = 1e20 ;
  var best_point = 0 ;
  var best_index = -1 ;
  for(var i1=0 ; i1<r.beads.length ; i1++){
    var i2 = (i1==r.beads.length-1) ? 0 : i1+1 ;
    var b3 = r.beads[i1] ;
    var b4 = r.beads[i2] ;
    var result = line_intersections(b1.x,b1.y,b2.x,b2.y,b3.x,b3.y,b4.x,b4.y) ;
    if(result[0]>0){
      var d2 = (result[1]-b1.x)*(result[1]-b1.x)+(result[2]-b1.y)*(result[2]-b1.y) ;
      if(d2<best_d2){
        best_point = new bead('i',result[1],result[2]) ;
        best_index = i2 ;
        best_d2 = d2 ;
      }
    }
  }
  return [best_index,best_point] ;
}


function rope_object(layer_number){
  this.is_closed = false ;
  this.beads = [] ;
  this.layer = layer_number ;
  this.add_bead = function(type,x,y){
    this.beads.push(new bead(type,x,y)) ;
  }
  this.add_arc = function(type,x,y){
    // Change the type of the previous bead
    var b = this.beads[this.beads.length-1] ;
    b.type = type ; // a for arc, q for quadratic
    var b2 = this.beads[this.beads.length-2] ;
    if(b.type=='a'){
      b.circle = new circle_arc(b2.x,b2.y,b.x,b.y,x,y) ;
    }
    else if(b.type=='q'){
      b.quad = new quad_arc(b2.x,b2.y,b.x,b.y,x,y) ;
    }
  }
  this.output_code = function(){
    var string = [] ;
    string.push('[\n') ;
    for(var i=0 ; i<this.beads.length ; i++){
      var b = this.beads[i] ;
      var str = "'" + b.type + "'," + b.x + ',' + b.y ;
      if(b.type=='a'){
        var c = b.circle ;
        str = str + ',' + '[' + c.cx + ',' + c.cy + ',' + c.r + ',' + c.t1 + ',' + c.t2 + ',' + c.dir + ']' ;
      }
      string.push('[' + str + '],\n') ;
    }
    string.push(']\n') ;
    return string ;
  }
  this.draw = function(color){
    if(this.beads.length==0) return ;
    context.lineWidth = 2 ;
    context.beginPath() ;
    context.strokeStyle = 'rgb(255,0,0)' ;
    if(mode=='construct' && this==current_rope) context.strokeStyle = 'rgb(0,0,255)' ;
    context.moveTo(this.beads[0].x,this.beads[0].y) ;
    for(var i=1 ; i<this.beads.length ; i++){
      var b = this.beads[i] ;
      if(b.type=='l'||b.type=='i'){
        if(color!=undefined) context.strokeStyle = color ;
        context.lineTo(b.x,b.y) ;
      }
      else if(b.type=='m'){ context.moveTo(b.x,b.y) ; }
      else if(b.type=='a'){ b.circle.draw(context)  ; }
      else if(b.type=='q'){ b.quad.draw(context)    ; }
    }
    context.stroke() ;
    if(this.layer<current_layer_number && this.closed){
      context.fillStyle = 'rgba(255,0,0,0.25)' ;
      context.fill() ;
    }
  }
  this.get_last_x = function(i){
    if(this.beads.length==0) return 0 ;
    return this.beads[this.beads.length-1-i].x ;
  }
  this.get_last_y = function(i){
    if(this.beads.length==0) return 0 ;
    return this.beads[this.beads.length-1-i].y ;
  }
  this.update_closed = function(){
    var closed_x = (is_zero(this.beads[0].x-this.get_last_x(0))) ;
    var closed_y = (is_zero(this.beads[0].y-this.get_last_y(0))) ;
    this.closed = (closed_x && closed_y) ;
    if(force_closed_ropes){
      if(this.closed==false){
        var b = new bead('l',this.beads[0].x,this.beads[0].y) ;
        this.beads.push(b) ;
        this.closed = true ;
      }
    }
    return this.closed ;
  }
  this.order_clockwise = function(){
    this.update_closed() ;
    // Taken from http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order/1165943#1165943
    var eps_y = 1 ; // Offset everything by 1 in y to prevent division by 0
    var dA = 0 ; // Determine signed area enclosed by shape
    for(var i1=0 ; i1<this.beads.length ; i1++){
      var i2 = (i1==this.beads.length-1) ? 0 : i1+1 ;
      var b1 = this.beads[i1] ;
      var b2 = this.beads[i2] ;
      dA += (b2.x-b1.x)/(eps_y+b1.y+b2.y) ;
    }
    if(dA<0){
      // We're already clockwise!
      this.clockwise = 1 ;
      return ;
    }
    else{
      this.beads.reverse() ;
      this.clockwise = 1 ;
    }
  }
  this.area = function(){
    // Taken from the good folks at
    // http://www.wikihow.com/Sample/Area-of-an-Irregular-Polygon
    var A = 0 ;
    for(var i1=0 ; i1<this.beads.length ; i1++){
      var i2 = (i1==this.beads.length-1) ? 0 : i1+1 ;
      var b1 = this.beads[i1] ;
      var b2 = this.beads[i2] ;
      A += 0.5*(b1.x*b2.y-b1.y*b2.x) ;
    }
    return A ;
  }
  
  
  this.merge = function(r2){
    // Merge with another rope
    // This will be tedious!
    var n_intersect = 0 ;
    var n_touch     = 0 ;
    var n_meet      = 0 ;
    var n_contain   = 0 ;
    var n_identical = 0 ;
    for(var i1=0 ; i1<this.beads.length ; i1++){
      var i2 = (i1==this.beads.length-1) ? 0 : i1+1 ;
      var b1 = this.beads[i1] ;
      var b2 = this.beads[i2] ;
      for(var j1=0 ; j1<r2.beads.length ; j1++){
        var j2 = (j1==r2.beads.length-1) ? 0 : j1+1 ;
        var b3 = r2.beads[j1] ;
        var b4 = r2.beads[j2] ;
        var result = line_intersections(b1.x,b1.y,b2.x,b2.y,b3.x,b3.y,b4.x,b4.y) ;
        if(result[0]==1 || result[0]==11) n_intersect++ ;
        if(result[0]==2 || result[0]==12) n_touch++     ;
        if(result[0]==3) n_meet++     ;
        if(result[0]==13 || result[0]==14) n_contain++ ; 
        if(result[0]==15) n_identcal++ ;
      }
    }
    
    // Find a point outside the polygons
    // Project a ray out to infinity and count how many times it intersects the other polygon
    var point_outside = -1 ;
    for(var i1=0 ; i1<this.beads.length ; i1++){
      var b1 = this.beads[i1] ;
      var b2 = new bead('l',0,1e6) ;
      var n_cross = 0 ;
      var escape = false ;
      for(var j1=0 ; j1<r2.beads.length ; j1++){
        var j2 = (j1==r2.beads.length-1) ? 0 : j1+1 ;
        var b3 = r2.beads[j1] ;
        var b4 = r2.beads[j2] ;
        if(b1.is_in_line(b3.x,b3.y,b4.x,b4.y)) escape = true ; 
        var result = line_intersections(b1.x,b1.y,b2.x,b2.y,b3.x,b3.y,b4.x,b4.y) ;
        if(result[0]==1 || result[0]==11) n_cross++ ;
        if(result[0]==2 || result[0]==12) n_cross++ ;
        if(result[0]==3) escape = true ;
        if(escape) break ;
      }
      if(escape) continue ;
      if(n_cross%2==0){
        point_outside = i1 ;
        break ;
      }
    }
    if(point_outside==-1) return r2 ;
    
    var union_rope = new rope_object(this.layer_number) ;
    var done = false ;
    var r1 = this ;
    var bs1 = r1.beads ;
    var bs2 = r2.beads ;
    var l1  = bs1.length ;
    var l2  = bs2.length ;
    var i1 = point_outside ;
    var i2 = 0 ;
    var current_rope = 1 ;
    var current_bead = new bead('l',bs1[i1].x,bs1[i1].y) ;
    i1++ ;
    while(done==false && union_rope.beads.length<20){
      if(current_rope==1){
        var b1 = current_bead ;
        var b2 = bs1[i1] ;
        var result = find_closest_intersection(b1,b2,r2) ;
        if(result[0]!=-1){
          union_rope.add_bead('i',result[1].x,result[1].y) ;
          current_bead.x = result[1].x ;
          current_bead.y = result[1].y ;
          current_rope = 2 ;
          i2 = result[0] ;
        }
        else{
          union_rope.add_bead('i',b2.x,b2.y) ;
        }
      }
      
      if(current_rope==2){
        var b1 = current_bead ;
        var b2 = bs2[i2] ;
        var result = find_closest_intersection(b1,b2,r1) ;
        if(result[0]!=-1){
          union_rope.add_bead('i',result[1].x,result[1].y) ;
          current_bead.x = result[1].x ;
          current_bead.y = result[1].y ;
          current_rope = 1 ;
          i1 = result[0] ;
        }
        else{
          union_rope.add_bead('i',b2.x,b2.y) ;
        }
      }
    }
    
    
    
    
    //union_rope.order_clockwise() ;
    for(var i=0 ; i<union_rope.beads.length ; i++){
      var b = union_rope.beads[i] ;
      //$('#debug').append(i+' '+b.type+' '+(b.x)+','+(b.y)+'\n') ;
    }
    return union_rope ;
  }
}

function bead(type,x,y){
  this.type = type ;
  this.x = x ;
  this.y = y ;
  this.is_in_line = function(x1,y1,x2,y2){
    var t1 = Math.atan2(y2-this.y,x2-this.x) ;
    var t2 = Math.atan2(this.y-y1,this.x-x1) ;
    return is_zero(t1-t2) ;
  }
}

function start(){
  canvas = document.getElementById('canvas_skyline') ;
  context = canvas.getContext('2d') ;
  canvas.addEventListener('mousedown', mouse_down) ;
  canvas.addEventListener('mousemove', mouse_move) ;
  document.addEventListener('keydown'  , key_down) ;
  document.addEventListener('keyup'    , key_up  ) ;
  
  window.oncontextmenu = function(){ return false ; }
  draw_all() ;
}

function draw_all(){
  clear_canvas() ;
  draw_graph_paper() ;
  for(var i=0 ; i<current_rope_store.length ; i++){
    current_rope_store[i].draw() ;
  }
  current_rope.draw() ;
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

function clear_canvas(){
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillRect(0,0,w,h) ;
}

function key_down(evt){
  var keyDownID = window.event ? event.keyCode : (evt.keyCode != 0 ? evt.keyCode : evt.which) ;
  switch(keyDownID){
    case 65: paintbrush = 'arc'  ; break ; // a
    case 81: paintbrush = 'quad' ; break ; // q
    case 78: // n
      current_rope.update_closed() ;
      current_rope_store.push(current_rope) ;
      current_layer_number++ ;
      current_rope = new rope_object(current_layer_number) ;
      draw_all() ;
      break ;
    case 32: // space
      evt.preventDefault() ;
      current_rope.beads.splice(current_rope.beads.length-1,1) ;
      draw_all() ;
      break ;
    case 13: // enter
      evt.preventDefault() ;
      if(mode=='construct'){
        var string = current_rope.output_code() ;
        $('#textarea_construct').append(string) ;
        mode = 'guide' ;
      }
      else{
        current_rope_store.push(current_rope) ;
        current_layer_number++ ;
        current_rope = new rope_object(current_layer_number) ;
        draw_all() ;
        mode = 'construct' ;
      }
      break ;
  }
}
function key_up(evt){ paintbrush = 'line' ; }

function XY_from_mouse(evt){
  var X = evt.pageX - evt.target.offsetLeft ;
  var Y = evt.pageY - evt.target.offsetTop  ;
  return [X,Y] ;
}

function mouse_move(evt){
  var XY = XY_from_mouse(evt) ;
  var tick = small_tick ;
  var x = XY[0] ;
  var y = XY[1] ;
  
  marker_x = tick*Math.floor(x/tick) ;
  marker_y = tick*Math.floor(y/tick) ;
  
  draw_all() ;
  context.beginPath() ;
  context.lineWidth = 2 ;
  context.strokeStyle = 'rgba(255,0,0,0.5)' ;
  context.moveTo(current_rope.get_last_x(0),current_rope.get_last_y(0)) ;
  if(paintbrush=='line'){
    context.lineTo(marker_x,marker_y) ;
  }
  else if(paintbrush=='arc'){
    var x1 = current_rope.get_last_x(1) ;
    var y1 = current_rope.get_last_y(1) ;
    var x2 = current_rope.get_last_x(0) ;
    var y2 = current_rope.get_last_y(0) ;
    var c = new circle_arc(x1,y1,x2,y2,marker_x,marker_y) ;
    c.draw(context) ;
  }
  else if(paintbrush=='quad'){
    var x1 = current_rope.get_last_x(1) ;
    var y1 = current_rope.get_last_y(1) ;
    var x2 = current_rope.get_last_x(0) ;
    var y2 = current_rope.get_last_y(0) ;
    context.moveTo(x1,y1) ;
    context.quadraticCurveTo(marker_x,marker_y,x2,y2) ;
  }
  context.stroke() ;
  draw_marker() ;
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
    current_rope.add_bead('m',x,y) ;
    if(debug) $('#debug').append('m: '+x+' '+y+'\n') ;
  }
  else{
    if(paintbrush=='line'){
      if(current_rope.beads.length==0){
        current_rope.add_bead('m',x,y) ;
      }
      else{
        current_rope.add_bead('l',x,y) ;
      }
      if(debug) $('#debug').append('l: '+x+' '+y+'\n') ;
    }
    else if(paintbrush=='arc'){
      current_rope.add_arc('a',x,y) ;
      if(debug) $('#debug').append('a: '+x+' '+y+'\n') ;
    }
    else if(paintbrush=='quad'){
      current_rope.add_arc('q',x,y) ;
      if(debug) $('#debug').append('q: '+x+' '+y+'\n') ;
    }
    draw_all() ;
  }
  return ;
}

function draw_marker(){
  context.beginPath() ;
  context.fillStyle = 'rgba(255,100,100,0.5)' ;
  context.arc(marker_x,marker_y,marker_r,0,2*Math.PI,true)
  context.fill() ;
}

function line_intersections(x1,y1,x2,y2,x3,y3,x4,y4,debug){
  if(debug==undefined) debug = 0 ;
  // First  line from (x1,y1) to (x2,y2)
  // Second line from (x3,y3) to (x4,y4)
  // We'll do this the expensive but intuitive way
  
  // return values:
  // [status,x,y]
  // Statuses: negative for error, positive for interserction
  // -1: line 1 is a point
  // -2: line 2 is a point
  // -3: parallel, no intersection
  // -4: non-parallel, no interserction
  //
  //  1: non-parallel, intersection
  //  2: non-parallel, touching
  //  3: non-parallel, meeting at a point
  // 11: parallel, intersection
  // 12: parallel, touching
  // 13: parallel, l1 contains l2
  // 14: parallel, l2 contains l1
  // 15: identical lines
  
  if(is_zero(x2-x1) && is_zero(y2-y1)) return [-1,0,0] ;
  if(is_zero(x4-x3) && is_zero(y4-y3)) return [-2,0,0] ;
  
  var x1_in = x1 ; var y1_in = y1 ;
  var x2_in = x2 ; var y2_in = y2 ;
  var x3_in = x3 ; var y3_in = y3 ;
  var x4_in = x4 ; var y4_in = y4 ;
  
  // First move such that (x1,y1) is the origin
  x1 -= x1_in ; y1 -= y1_in ;
  x2 -= x1_in ; y2 -= y1_in ;
  x3 -= x1_in ; y3 -= y1_in ;
  x4 -= x1_in ; y4 -= y1_in ;
  
  // Now rotate so that line 1 lies along the x axis
  var t1 = Math.atan2(y2_in-y1_in,x2_in-x1_in) ;
  var xy1 = rotate(x1,y1,t1) ;
  var xy2 = rotate(x2,y2,t1) ;
  var xy3 = rotate(x3,y3,t1) ;
  var xy4 = rotate(x4,y4,t1) ;
  
  x1 = xy1[0] ; y1 = xy1[1] ;
  x2 = xy2[0] ; y2 = xy2[1] ;
  x3 = xy3[0] ; y3 = xy3[1] ;
  x4 = xy4[0] ; y4 = xy4[1] ;
  
  // if y3 and y4 are on the same side of the line, then there is no intersection
  if(y3>tolerance && y4>tolerance){
    if(Math.abs(y3-y4)<tolerance){ return [-3,0,0] ; }
    else{ return [-4,0,0] ; }
  }
  if(y3<-tolerance && y4<-tolerance){
    if(Math.abs(y3-y4)<tolerance){ return [-3,0,0] ; }
    else{ return [-4,0,0] ; }
  }
  
  // if y3 and y4 are on the x-axis, check for overlap
  if(is_zero(y3-y4)){
    var xA = Math.min(x3,x4) ;
    var xB = Math.max(x3,x4) ;
    if(is_zero(xB)        ){ return [12,x1_in,y1_in] ; } // Touching parallel lines
    else if(is_zero(xA-x2)){ return [12,x2_in,y2_in] ; } // Touching parallel lines
    else if(xA>tolerance && xA-x2<-tolerance && xB>tolerance && xB-x2<tolerance){ return [13,0.5*(x4_in+x3_in),0.5*(y4_in+y3_in)] ; } // Return midpoint of inner line
    else if(xA<-tolerance && xB-x2>tolerance ){ return [14,0.5*(x2_in+x1_in),0.5*(y2_in+y1_in)] ; } // Return midpoint of inner line
    else if(xA<0 && xB>0  ){ return [11,x1_in,y1_in] ; } // Intersection
    else if(xA<x2 && xB>x2){ return [11,x2_in,y2_in] ; } // Intersection
    else if(is_zero(xA) && is_zero(xB-x2)){ return [15,x1_in,y1_in] ; } 
    else{ return [-3,0,0] ; } // No intersection
  }
  
  // line 2 crosses the x-axis
  // Find the point where the intersection occurs
  if(Math.abs(x3-x4)<tolerance){
    if(x3<-tolerance || x3>x2+tolerance) return [-4,0,0] ;
    // Check for touching
    if(is_zero(x3)){ 
      if(is_zero(y3)||is_zero(y4)){ return[3,x1_in,y1_in] ; } // Meeting
      else{ return[2,x1_in,y1_in] ; }// Touching
    }
    if(is_zero(x3-x2)){
      if(is_zero(y3)||is_zero(y4)){ return[3,x2_in,y2_in] ; } // Meeting
      else { return[2,x2_in,y2_in] ; }// Touching
    }
    if(is_zero(y3)){ return[2,x3_in,y3_in] ; } // Touching
    if(is_zero(y4)){ return[2,x4_in,y4_in] ; } // Touching
    // Otherwise transform (x3,0) back and we're done
    var xy = rotate(x3,0,-t1) ; // Rotate points back ;
    xy[0] += x1_in ; xy[1] += y1_in ;
    if(debug) $('#debug').append('Intersection found! '+x1_in+','+y1_in+' '+x2_in+','+y2_in+' '+x3_in+','+y3_in+' '+x4_in+','+y4_in+' '+xy[0]+','+xy[1]+'\n') ;
    return [1,xy[0],xy[1]] ; // Intersecting
  }
  else{
    // x0 is the root where l2 crosses the x axis
    var g  = (y4-y3)/(x4-x3) ; // Gradient
    var x0 = x3 - y3/g ;
    if(x0<-tolerance || x0>x2+tolerance) return [-4,0,0] ;
    if(is_zero(y3)   ){
      if(is_zero(x3)   ) return [3,x1_in,y1_in] ; // Meeting
      if(is_zero(x3-x2)) return [3,x2_in,y2_in] ; // Meeting
      return[2,x3_in,y3_in] ; // Touching
    }
    if(is_zero(y3)   ){
      if(is_zero(x4)   ) return [3,x1_in,y1_in] ; // Meeting
      if(is_zero(x4-x2)) return [3,x2_in,y2_in] ; // Meeting
      return[2,x4_in,y4_in] ; // Touching
    }
    if(is_zero(x0)   ){ return[3,x1_in,y1_in] ; } // Meeting
    if(is_zero(x0-x2)){ return[3,x2_in,y2_in] ; } // Meeting
    
    var xy = rotate(x0,0,-t1) ;
    alert(x3_in+','+y3_in+' '+x4_in+','+y4_in) ;
    alert(x3+','+y3+' '+x4+','+y4+' '+x0+' '+g+' '+180*t1/Math.PI) ;
    xy[0] += x1_in ; xy[1] += y1_in ;
    return [1,xy[0],xy[1]] ; // Intersecting
  }
}

function rotate(x,y,t){
  var x_out = x*Math.cos(t) + y*Math.sin(t) ;
  var y_out = y*Math.cos(t) - x*Math.sin(t) ;
  return [x_out,y_out] ;
}
function is_zero(x){
  return (Math.abs(x)<tolerance) ;
}

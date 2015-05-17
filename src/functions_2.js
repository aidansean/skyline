function abs (x){ return Math. abs(x) ; }
function sqrt(x){ return Math.sqrt(x) ; }

function uv_from_mouse(evt){
  var u = evt.pageX - evt.target.offsetLeft ;
  var v = evt.pageY - evt.target.offsetTop  ;
  return [u,v] ;
}

function path_point(x,y){
  this.x = x ;
  this.y = y ;
}

function vector(x,y){
  this.x = x ;
  this.y = y ;
  this.add        = function(v2){ return new vector(this.x+v2.x,this.y+v2.y) ; }
  this.subtract   = function(v2){ return new vector(this.x-v2.x,this.y-v2.y) ; }
  this.multiply   = function( k){ return new vector(this.x*k   ,this.y*k   ) ; }
  this.dot        = function(v2){ return new vector(this.x*v2.x,this.y*v2.y) ; }
  this.cross      = function(v2){ return this.x*v2.y-this.y*v2.x             ; }
  this.r          = function(  ){ return sqrt(this.x*this.x+this.y*this.y)   ; }
  this.normalised = function(  ){ return new vector(this.x/this.r(),this.y*this.r()) ; }
}

function bounds_object(){
  this.xMin =  1e6 ;
  this.xMax = -1e6 ;
  this.yMin =  1e6 ;
  this.yMax = -1e6 ;
  this.reset_values = function(){
    this.xMin =  1e6 ;
    this.xMax = -1e6 ;
    this.yMin =  1e6 ;
    this.yMax = -1e6 ;
  }
  this.compare_point = function(point){
    this.compare_x(point.x) ;
    this.compare_y(point.y) ;
  }
  this.compare_x = function(x){
    if(x<this.xMin) this.xMin = x ;
    if(x>this.xMax) this.xMax = x ;
  }
  this.compare_y = function(y){
    if(y<this.yMin) this.yMin = y ;
    if(y>this.yMax) this.yMax = y ;
  }
}

function shape(){
  this.bounds = new bounds_object() ;
  this.closed = false ;
  this.points = [] ;
  this.chords = [] ;
  this.clockwise = 0 ;
  this.update_bounds = function(){
    for(var i=0 ; i<this.points.length ; i++){
      this.bounds.compare_point(this.points[i]) ;
    }
  }
  this.arrange_clockwise = function(){
    // Taken from http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order/1165943#1165943
    var eps_y = 1 + this.bounds.yMin ; // Offset everything by 1 in y to prevent division by 0
    var dA = 0 ; // Determine signed area enclosed by shape
    for(var i1=0 ; i1<this.points.length ; i1++){
      var i2 = (i1==this.points.length-1) ? 0 : i1+1 ;
      var p1 = this.points[i1] ;
      var p2 = this.points[i2] ;
      dA += (p2.x-p1.x)/(eps_y+p1.y+p2.y) ;
    }
    if(dA<0){
      // We're already clockwise!
      this.clockwise = 1 ;
      return ;
    }
    else{
      var points_new = [] ;
      for(var i=this.points.length-1 ; i>=0 ; i--){
        points_new.push(this.points[i]) ;
      }
      this.points = points_new ;
      this.clockwise = 1 ;
    }
  }
  this.make_chords = function(){
  
  }
  this.find_intersections = function(s2){
    // This will look to see if any of the chords in the two shapes intersect
    var intersections = [] ;
    for(var i=0 ; i<this.chords.length ; i++){
      for(var j=0 ; j<s2.chords.length ; j++){
        var intersect = line_intersection(this.chords[i],s2.chords[j]) ;
        if(intersect[0]==1 || intersect[0]==2 || intersect[0]==5 || intersect[0]==6){
          intersections.push(intersect) ;
        }
      }
    }
    for(var i=0 ; i<intersections.length ; i++){
      alert(intersections[i]) ;
    }
  }
}

function line_intersection(l1, l2){
  // Take two lines, find their point of intersection (if it exists) and return it
  // Taken from http://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
  
  // Return [status,x,y]
  // Status codes:
  // -1: Error: zero length segment
  //  0: Parallel lines, no intersection
  //  1: Parallel lines, touching
  //  2: Parallel lines, intersection
  //  3: Parallel lines, identical
  //  4: Non parallel lines, no intersection
  //  5: Non parallel lines, touching
  //  6: Non parallel lines, intersection
  
  var p = new vector(l1.x1,l1.y1) ;
  var q = new vector(l2.x1,l2.y1) ;
  var r = new vector(l1.x2,l1.y2) ;
  var s = new vector(l2.x2,l2.y2) ;
  r = r.subtract(p) ;
  s = s.subtract(q) ;
  if(abs(r.r())<1e-6) return -1 ;
  if(abs(s.r())<1e-6) return -1 ;
  
  var rXs = r.cross(s) ;
  if(abs(rXs)<1e-6){
    // Parallel lines.  Oh noes!
    // Try to order by x, failing that by y
    // There must be an easier way!
    if(abs(l1.x1-l1.x2)>1e-6){
      var pA = (l1.x1 < l1.x2) ? [l1.x1,l1.y1] : [l1.x2,l1.y2] ;
      var pB = (l1.x1 < l1.x2) ? [l1.x2,l1.y2] : [l1.x1,l1.y1] ;
      var pC = (l2.x1 < l2.x2) ? [l2.x1,l2.y1] : [l2.x2,l2.y2] ;
      var pD = (l2.x1 < l2.x2) ? [l2.x2,l2.y2] : [l2.x1,l2.y1] ;
      if(abs(pA[0]-pC[0])<1e-6 && abs(pB[0]-pD[0])<1e-6) return [ 3 , new path_point(0.5*(l1.x1+l1.x2),0.5*(l1.y1+l1.y2)) ] ;
      if(abs(pA[0]-pD[0])<1e-6) return [ 1 , new path_point(pA[0],pA[1]) ] ;
      if(abs(pB[0]-pC[0])<1e-6) return [ 1 , new path_point(pB[0],pB[1]) ] ;
      if(pA[0]<pC[0] && pB[0]>pC[0]) return [ 2 , new path_point(0.5*(pB[0]+pC[0]),0.5*(pB[1]+pC[1])) ] ;
      if(pC[0]<pA[0] && pD[0]>pA[0]) return [ 2 , new path_point(0.5*(pB[0]+pC[0]),0.5*(pB[1]+pC[1])) ] ;
      return 0 ;
    }
    else{
      var pA = (l1.y1 < l1.y2) ? [l1.x1,l1.y1] : [l1.x2,l1.y2] ;
      var pB = (l1.y1 < l1.y2) ? [l1.x2,l1.y2] : [l1.x1,l1.y1] ;
      var pC = (l2.y1 < l2.y2) ? [l2.x1,l2.y1] : [l2.x2,l2.y2] ;
      var pD = (l2.y1 < l2.y2) ? [l2.x2,l2.y2] : [l2.x1,l2.y1] ;
      if(abs(pA[1]-pC[1])<1e-6 && abs(pB[1]-pD[1])<1e-6) return [ 3 , new path_point(0.5*(l1.x1+l1.x2),0.5*(l1.y1+l1.y2)) ] ;
      if(abs(pA[1]-pD[1])<1e-6) return [ 1 , new path_point(pA[0],pA[1]) ] ;
      if(abs(pB[1]-pC[1])<1e-6) return [ 1 , new path_point(pB[0],pB[1]) ] ;
      if(pA[1]<pC[1] && pB[1]>pC[1]) return [ 2 , new path_point(0.5*(pB[0]+pC[0]),0.5*(pB[1]+pC[1])) ] ;
      if(pC[1]<pA[1] && pD[1]>pA[1]) return [ 2 , new path_point(0.5*(pB[0]+pC[0]),0.5*(pB[1]+pC[1])) ] ;
      return 0 ;
    }
  }
  var mXs = q.subtract(p).cross(s) ;
  var t = mXs/rXs ;
  if(abs(t-0.0)<1e-6) return [ 5 , new path_point(l1.x1,l1.y1) ] ;
  if(abs(t-1.0)<1e-6) return [ 5 , new path_point(l2.x1,l2.y1) ] ;
  if(t<0 || t>1) return 4 ;
  return [6 , new path_point(l1.x1+t*r.x,l1.y1+t*r.y) ] ;
}

function path_step(action,x,y,x2,y2){
  this.action = action ;
  this.x = x ;
  this.y = y ;
  this.circle_point = [x2,y2] ;
}

function path_chord(action,x1,y1,x2,y2,x3,y3){
  this.action = action ;
  this.x1 = x1 ;
  this.y1 = y1 ;
  this.x2 = x2 ;
  this.y2 = y2 ;
  this.x3 = x3 ;
  this.y3 = y3 ;
}

function assemble_shape(){
  var path = current_path ; // Save some characters
  var dx2 = Math.pow(path[0].x-path[path.length-1].x,2) ;
  var dy2 = Math.pow(path[0].y-path[path.length-1].y,2) ;
  var closed = (dx2+dy2<1e-6) ;
  
  var s = new shape() ;
  s.closed = closed ;
  
  var end = (closed) ? path.length-2 : path.length-1 ;
  for(var i=0 ; i<=end ; i++){
    var p = path[i] ;
    s.points.push(new path_point(p.x,p.y)) ;
  }
  s.update_bounds() ;
  s.arrange_clockwise() ;
  for(var i=1 ; i<path.length ; i++){
    var p2 = s.points[i] ;
    if(i==path.length-1 && closed) p2 = s.points[0] ;
    var chord = new path_chord( path[i].action, s.points[i-1], p2, path[i].circle_point ) ;
    s.chords.push(chord) ;
  }
  
  return s ;
}

function mouse_down_2(evt){
  // Is it a right click?
  var rightclick ;
  if(!evt) var evt = window.event ;
  if(evt.which) rightclick = (evt.which==3) ;
  else if(evt.button) rightclick = (evt.button==2) ;
  
  // Get position on canvass
  var uv = uv_from_mouse(evt) ;
  var tick = small_tick ;
  var x = tick*Math.floor(uv[0]/tick) ;
  var y = tick*Math.floor(uv[1]/tick) ;
  
  if(rightclick){
    current_path.push( ['m',x,y,-1,-1] ) ;
  }
  else{
    if(paintbrush=='line'){
      if(new_layer){
        current_path.push( ['m',x,y,-1,-1] ) ;
        new_layer = false ;
      }
      else{
        current_path.push( ['l',x,y,-1,-1] ) ;
      }
    }
    else if(paintbrush=='arc'){
      current_path.splice(current_path.length-1,1) ;
      current_path.push( ['a',x,y,marker_x,marker_y] ) ;
    }
    draw_all() ;
  }
  return ;
}

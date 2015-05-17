// Possible actions:
// line: lineTo
// move: moveTo
// arc : arc

function circle_parameters(p1,p2,p3){
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
  
  var params = get_circle_parameters(p1,p2,p3) ;
  this.cx  = cx ;
  this.cy  = cy ;
  this.r   = Math.abs(r) ;
  this.t1  = t1 ;
  this.t2  = t2 ;
  this.dir = dir ;
}

function path_chord(action,x1,y1,x2,y2,x3,y3){
  if(action==undefined) action = 'line' ;
  this.x1 = x1 ;
  this.y1 = y1 ;
  this.x2 = x2 ;
  this.y2 = y2 ;
  this.x3 = x3 ;
  this.y3 = y3 ;
  this.action = action ;
  this.circle = 0 ;
  if(this.action=='arc'){
    this.circle = new circle_parameters([x1,y1],[x2,y2],[x3,y3]) ;
  }
}

function structure_layer(){
  this.bounds = new bounds_object() ;
  this.shapes = [] ;
}

function structure_guide(path){
  this.bounds = new bounds_object() ;
  this.layers = [] ;
  this.raw_path = path ;
  
  // Parse the path
  var shape = [] ;
  for(var i=0 ; i<path.length ; i++){
    if(path[i][2]=='n'){
      this.layers.push( new structure_layer() ) ;
    }
    else if(path[i][2]=='m'){
      this.layers[this.layers.length-1].push(path[i]) ;
    }
  }
}

function structure_object(){

}


function building_object(path){
  this.xMin = 1e6 ;
  this.yMin = 1e6 ;
  this.xMax = 0 ;
  this.yMax = 0 ;
  this.x0   = 0 ;
  this.y0   = 0 ;
  
  this.update_dimensions = function(path,scale){
    for(var i=0 ; i<path.length ; i++){
      if(path[i][0]<0 || path[i][1]<0) continue ;
      if(path[i][0]<this.xMin) this.xMin = path[i][0] ;
      if(path[i][1]<this.yMin) this.yMin = path[i][1] ;
    }
    for(var i=0 ; i<path.length ; i++){
      if(path[i][0]<0 || path[i][1]<0) continue ;
      path[i][0] -= this.xMin ;
      path[i][1] -= this.yMin ;
      if(path[i][2]=='a'){
        path[i][3][0] -= this.xMin ;
        path[i][3][1] -= this.yMin ;
      }
      if(path[i][0]>this.xMax) this.xMax = path[i][0] ;
      if(path[i][1]>this.yMax) this.yMax = path[i][1] ;
      if(path[i][2]=='a'){
        if(path[i][3][0]>this.xMax) this.xMax = path[i][3][0] ;
        if(path[i][3][1]>this.yMax) this.yMax = path[i][3][1] ;
      }
    }
    for(var i=0 ; i<path.length ; i++){
      if(path[i][0]<0 || path[i][1]<0) continue ;
      if(path[i][0]<this.xMin) this.xMin = path[i][0] ;
      if(path[i][1]<this.yMin) this.yMin = path[i][1] ;
    }
    this.xMin = scale*this.xMin ;
    this.xMax = scale*this.xMax ;
    this.yMin = scale*this.yMin ;
    this.yMax = scale*this.yMax ;
    this.w = this.xMax - this.xMin + 2*this.margin ;
    this.h = this.yMax - this.yMin + 2*this.margin ;
  }
  
  this.bool_draw_windows = true ;
  this.stroke_color = 'rgb(0,0,0)' ;
  this.fill_color   = 'rgb(255,0,0)' ;
  this.fill = true ;
  this.stroke = true ;
  
  this.margin = 20 ;
  this.id = saved_paths.length+1 ;
  this.name = (document.getElementById('shape_name')) ? document.getElementById('shape_name').value : '' ;
  this.update_dimensions(path,1.0) ;
  
  this.canvas  = document.createElement('canvas') ;
  this.canvas.width  = this.w ;
  this.canvas.height = this.h ;
  this.canvas.style.width  = this.w ;
  this.canvas.style.height = this.h ;
  this.context = this.canvas.getContext('2d') ;
  
  this.beacons = [] ;
  this.windows = [] ;
  this.windows_status = [] ;
  this.raw_path = path ;
  this.path = [] ;
  
  this.parse_path = function(path){
    for(var i=0 ; i<path.length ; i++){
      var type = path[i][2] ;
      if(type=='w'){
        var win = [] ;
        win.push(path[i]) ;
        while(true){
          i++ ;
          if(i==path.length){
            this.windows.push(win) ;
            break ;
          }
          if(path[i][2]=='l'){
            win.push(path[i]) ;
          }
          else{
            this.windows.push(win) ;
            this.windows_status.push(false) ;
            i-- ;
            break ;
          }
        }
      }
      else if(type=='b'){
        this.beacons.push(path[i]) ;
      }
      else{
        this.path.push(path[i]) ;
      }
    }
  }
  this.parse_path(path) ;
  
  this.clear_canvas = function(){
    this.context.fillStyle = 'rgb(255,255,255)' ;
    this.context.fillRect(0,0,g_w,g_h) ;
  }
  
  this.draw = function(scale,x0,y0){
    // y0 should be the height above the baseline of the canvas
    
    if(scale==undefined) scale = 1.0 ;
    if(   x0==undefined) x0    =   0 ;
    if(   y0==undefined) y0    =   0 ;
    
    this.context.strokeStyle = this.stroke_color ;
    this.context.fillStyle   = this.fill_color ;
    this.context.mozFillRule = 'evenodd' ;
    this.context.lineWidth = 2 ;
    this.context.beginPath() ;
    
    var new_layer = true ;
    var path = [] ;
    for(var i=0 ; i<this.path.length ; i++){
      path.push(this.path[i]) ;
    }
    for(var i=0 ; i<path.length ; i++){
      var p = path[i] ;
      var x = x0 + scale*p[0] ;
      var y = y0 + scale*p[1] ;
      if(p[2]=='n'){ // It's a new layer!
        if(this.fill) this.context.fill('evenodd') ;
        if(this.stroke) this.context.stroke() ;
        this.context.closePath() ;
        this.context.beginPath() ;
        new_layer = true ;
      }
      else if(p[2]=='l'){ // It's a line!
        if(new_layer){
          this.context.moveTo(this.margin+x,this.margin+y) ;
          new_layer = false ;
        }
        else{
          this.context.lineTo(this.margin+x,this.margin+y) ;
        }
      }
      else if(p[2]=='m'){ // It's a move!
        this.context.moveTo(this.margin+x,this.margin+y) ;
        if(new_layer) new_layer = false ;
      }
      else if(p[2]=='w'){ // It's a window!
        this.context.moveTo(this.margin+x,this.margin+y) ;
        if(new_layer) new_layer = false ;
      }
      else if(p[2]=='a'){ // It's an arc!
        var cp = p[3] ;
        var cx = x0 + scale*cp[0] ;
        var cy = y0 + scale*cp[1] ;
        var cr = cp[2]*scale ;
        this.context.arc(this.margin+cx,this.margin+cy,cr,cp[3],cp[4],cp[5]) ;
        if(new_layer) new_layer = false ;
      }
    }
    if(this.fill) this.context.fill('evenodd') ;
    if(this.stroke) this.context.stroke() ;
    this.context.closePath() ;
    
    this.illuminate_windows(scale,x0,y0) ;
    this.disilluminate_one_window(2,scale,x0,y0) ;
    if(this.bool_draw_windows) this.draw_windows(scale,x0,y0) ;
    
    for(var i=0 ; i<this.beacons.length ; i++){
      var b = this.beacons[i] ;
      var x = x0 + scale*b[0] ;
      var y = y0 + scale*b[1] ;
      context.beginPath() ;
      context.arc(x,y,2,0,2*Math.PI,true) ;
      context.fillStyle = 'rgb(255,0,0)' ;
      context.fill() ;
    }
  }
  
  this.illuminate_one_window = function(index,scale,x0,y0){
    if(index<0 || index>=this.windows.length) return ;
    this.windows_status[index] = true ;
  }
  this.disilluminate_one_window = function(index,scale,x0,y0){
    if(index<0 || index>=this.windows.length) return ;
    this.windows_status[index] = false ;
  }
  
  this.fill_window = function(index,color,scale,x0,y0){
    this.context.beginPath() ;
    var w = this.windows[index] ;
    for(var j=0 ; j<w.length ; j++){
      var x = this.margin+w[j][0] ;
      var y = this.margin+w[j][1] ;
      x = x0 + scale*x ;
      y = y0 + scale*y ;
      if(j==0){
        this.context.moveTo(x,y) ;
      }
      else{
        this.context.lineTo(x,y) ;
      }
    }
    this.context.fillStyle = color ;
    this.context.fill() ;
  }
  
  this.illuminate_windows = function(scale,x0,y0){
    for(var i=0 ; i<this.windows.length ; i++){
      this.windows_status[i] = true ;
    }
  }
  this.draw_windows = function(scale,x0,y0){
    for(var i=0 ; i<this.windows.length ; i++){
      var color = (this.windows_status[i]) ? 'rgb(255,255,0)' : 'rgb(0,0,0)' ;
      this.fill_window(i,color,scale,x0,y0) ;
    }
  }
  
  this.center_points = function(w,h,tick){
    var dx = tick*Math.floor((0.5*(w-this.w))/tick) ;
    var dy = tick*Math.floor((0.5*(w-this.h))/tick) ;
    for(var i=0 ; i<this.raw_path.length ; i++){
      if(this.raw_path[i][0]<0 || this.raw_path[i][1]<0) continue ;
      this.raw_path[i][0] += dx ;
      this.raw_path[i][1] += dy ;
      if(this.raw_path[i][2]=='a'){
        this.raw_path[i][3][0] += dx ;
        this.raw_path[i][3][1] += dy ;
      }
    }
  }
  
  this.write_output = function(){
    var string = [] ;
    string.push('path = [] ;') ;
    string.push('{') ;
    for(var i=0 ; i<this.path.length ; i++){
      var str = '.push(' ;
      if(this.path[i][2]=='a'){
        str = str + '[' + this.path[i][0] + ',' + this.path[i][1] + ',a,[' + this.path[i][3] + ']]) ;' ;
      }
      else{
        str = str + '[' + this.path[i] + ']) ;' ;
      }
      str = str.replace('false','0') ;
      str = str.replace('a','\'a\'') ;
      str = str.replace('l','\'l\'') ;
      str = str.replace('m','\'m\'') ;
      str = str.replace('n','\'n\'') ;
      str = str.replace('w','\'w\'') ;
      str = 'path' + str ;
      string.push(str) ;
    }
    string.push('}') ;
    string.push('var building_'+this.name+' = new building_object(path) ;') ;
    string.push('buildings.push(building_'+this.name+') ;') ;
    string.push('') ;
    return string ;
  }
  this.write_output() ;
}
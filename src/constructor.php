<?php $title = 'Building constructor' ;?>
<?php include($_SERVER['DOCUMENT_ROOT'].'/head_1.php') ; ?>
<title><?php echo $title ; ?></title>
<style type="text/css">
canvas#canvas_skyline{
  margin-top : 20px ;
  border : 1px solid black ;
  padding : 2px ;
}
table#table_gallery{
  width : 750px ;
}
th#gallery_image { width : 300px ; }
th#gallery_code  { width : 350px ; }
th#gallery_update{ width : 100px ; }
th#gallery_image, th#gallery_name, th#gallery_code, th#gallery_update{
  text-align : center ;
  color : white ;
  background : #000000 ;
}
</style>
<script src="functions.js"></script>
<script src="functions_2.js"></script>
<script src="add_paths.js"></script>
<script src="building.js"></script>
</head>
<body onload="start()" lang="en">
<?php include($_SERVER['DOCUMENT_ROOT'].'/head_2.php') ; ?>

    <div class="right">
      <h3>About this page</h3>
      <div class="blurb">
        <p>This page should make some nifty vector art skyline graphics.</p>
      </div>
    </div>
    
    <div class="right">
      <h3>The canvas</h3>  
      <div class="blurb">
        <canvas id="canvas_skyline" width="750" height="6000"></canvas>
      </div>
      Name: <input id="shape_name"/>
    </div>
    
    <div class="right">
      <h3>Gallery of objects</h3>
      <table id="table_gallery">
        <thead>
          <tr>
            <th id="gallery_image" >Canvas</th>
            <th id="gallery_code"  >Code</th>
            <th id="gallery_update">Action</th>
          </tr>
        </thead>
        <tbody id="tbody_gallery">
        </tbody>
      </table>
    </div>
    
    <div class="right">
      <h3>Master code</h3>
      <textarea id="master_code" cols="96" rows="20"></textarea>
    </div>
    <pre id="debug"></pre>
    
    
<?php include($_SERVER['DOCUMENT_ROOT'].'/foot.php') ; ?>

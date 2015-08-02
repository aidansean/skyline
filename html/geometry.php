<?php $title = '2D geometry' ;?>
<?php include($_SERVER['DOCUMENT_ROOT'].'/head_1.php') ; ?>
<title><?php echo $title ; ?></title>
<style type="text/css">
canvas#canvas_skyline{
  margin-top : 20px ;
  border : 1px solid black ;
  padding : 2px ;
}

</style>
<script src="geometry.js"></script>
</head>
<body onload="start()" lang="en">
<?php include($_SERVER['DOCUMENT_ROOT'].'/head_2.php') ; ?>

    <div class="right">
      <h3>About this page</h3>
      <div class="blurb">
        <p>Making shapes!</p>
      </div>
    </div>
    
    <div class="right">
      <h3>The canvas</h3>  
      <div class="blurb">
        <canvas id="canvas_skyline" width="750" height="6000"></canvas>
      </div>
    </div>
    <pre id="debug"></pre>
    <textarea id="textarea_construct" rows="20" cols="80"></textarea>
    
    
<?php include($_SERVER['DOCUMENT_ROOT'].'/foot.php') ; ?>

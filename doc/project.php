<?php
include_once($_SERVER['FILE_PREFIX']."/project_list/project_object.php") ;
$github_uri   = "https://github.com/aidansean/skyline" ;
$blogpost_uri = "http://aidansean.com/projects/?tag=skyline" ;
$project = new project_object("skyline", "Skyline generator", "https://github.com/aidansean/skyline", "http://aidansean.com/projects/?tag=skyline", "skyline/images/project.jpg", "skyline/images/project_bw.jpg", "One of the features I want on my webpage is the silhouette of a skyline to use as background image.  This project is aimed at allowing the user to draw a complex skyline, with the possibilty for animation.", "Maths,Toys", "canvas,CSS,HTML,JavaScript") ;
?>
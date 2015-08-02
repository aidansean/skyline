from project_module import project_object, image_object, link_object, challenge_object

p = project_object('skyline', 'Skyline generator')
p.domain = 'http://www.aidansean.com/'
p.path = 'skyline'
p.preview_image    = image_object('%s/images/project.jpg'   %p.path, 150, 250)
p.preview_image_bw = image_object('%s/images/project_bw.jpg'%p.path, 150, 250)
p.folder_name = 'aidansean'
p.github_repo_name = 'skyline'
p.mathjax = False
p.tags = 'Maths,Toys'
p.technologies = 'canvas,CSS,HTML,JavaScript'
p.links.append(link_object(p.domain, 'skyline', 'Live page'))
p.introduction = 'One of the features I want on my webpage is the silhouette of a skyline to use as background image.  This project is aimed at allowing the user to draw a complex skyline, with the possibilty for animation.'
p.overview = '''The user can create individual "buildings" with many layers, and then arrange the buildings into a skyline to generate an image.  If possible, the user can animate the image (for example adding lights at night, allowing the sky to change to match the time of day.)

The design would take place on the canvas, with a suite of tools to allow the user to correctly determine the size of buildings, add arches, spires etc.  A second layer would allow the user to add windows, and a third layer would allow them to add other features.  These would then be saved to file and a script would read the file to render the images on screen.  The images would be rendered on a canvas that sits behind the main content of the page.  This project is largely a problem of geometry.'''

p.challenges.append(challenge_object('Initially I wanted to set the canvas as the background of the page.', 'There are methds of taking the content of a canvas and using it to draw images that can be used with the DOM.  I tried to use Javascript to change the source of the background image to match the canvas, but this lead to "flickering" effects, even when to canvases were used.  As a result this was not a viable option.', 'Abandoned'))

p.challenges.append(challenge_object('The user needs a simple and intuitive interface.', 'This project allows the user to draw wire frames for the buildings.  They can draw straight lines, circle arcs, and quadratic curves.  The interface is not perfect, but it is easy enough to quickly make buildings.  A grid is also provided so the user can keep track of sizes.', 'Resolved'))

p.challenges.append(challenge_object('This projects needs to be able to calculate interections and unions of polygons.', 'One of the hardest problems to solve is the interserction and union of two shapes, so that the user can make complex shapes.  This is a non-trivial problems of geometry and finding solutions online was not east.  I honest cannot remember if I completely solved this problem or not.', 'Resolved, to be revisited'))

p.challenges.append(challenge_object('This project would ideally respond to the client\'s time.', 'Animation and time dependence has not been implemented yet, but eventually the colour of the sky and weather would chance, lights would turn on and off, and vehicles would move.  This should be relatively simple to implement, once I find the time.', 'To do'))

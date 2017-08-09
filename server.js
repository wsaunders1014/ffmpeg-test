var express = require('express');
const fileUpload = require('express-fileupload');
var ffmpeg = require('ffmpeg-static');
var ffmpeg = require('ffmpeg');
var app = express();

app.use(express.static(__dirname));
app.use(fileUpload());
app.post('/upload', function(req,res){
	console.log(req.files);
	//res.send(req.files.video.name)
	 if (!req.files)
     	return res.status(400).send('No files were uploaded.');
     let video = req.files.video;
     var timestamp = Date.now();
     var tmpName = video.name.slice(0,video.name.lastIndexOf('.'))+'_'+timestamp+'.'+video.name.slice(video.name.lastIndexOf('.'),video.name.length);
     console.log(tmpName)
     video.mv('tmp/'+tmpName);
	 try {
		var process2 = new ffmpeg('tmp/'+tmpName);
		process2.then(function (video) {
			//console.log(video);
			
			video.fnAddWatermark('overlay.png','uploads/video_'+timestamp+'.mp4', {position:'C'}, function(error,file){
				if(!error){
					console.log('New Video: '+file)
					res.send(file);
				}
			})
			console.log('Processing video...');
		}, function (err) {
			console.log('Error: ' + err);
		});
	} catch (e) {
		console.log(e.code);
		console.log(e.msg);
	}
});

// app.get("*",function(req,res){
// 	res.sendFile('index.html',{root:__dirname+''});
// 	//next();
// });

app.listen(3000, function(){
	console.log(`App listening on port 3000!`);
});

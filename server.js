var express = require('express');
const fileUpload = require('express-fileupload');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
var Promise = require('promise');
ffmpeg.setFfmpegPath(ffmpegPath);
var app = express();
var timemark = null;
var AWS = require('aws-sdk');
var s3 = require('s3');
var S3Client = new AWS.S3({apiVersion: '2006-03-01'});

// var client = s3.createClient({
//   maxAsyncS3: 20,     // this is the default
//   s3RetryCount: 3,    // this is the default
//   s3RetryDelay: 1000, // this is the default
//   multipartUploadThreshold: 20971520, // this is the default (20 MB)
//   multipartUploadSize: 15728640, // this is the default (15 MB)
//   s3Options: {
//     accessKeyId: "AKIAISZ72VCNHQO5ZN3A",
//     secretAccessKey: "mi3PkE7NcucYO8znPHxM0D3qTFaJiq1Ne2j5RXrC",
//     region: "your region",
//     // endpoint: 's3.yourdomain.com',
//     // sslEnabled: false
//     // any other options are passed to new AWS.S3()
//     // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
//   },
// });
app.use(express.static(__dirname));
app.use(fileUpload());
app.post('/upload', function(req,res){
	/*  WORKS! File is uploaded to tmp server, encoded, saved, then uploaded to S3 Bucket, returns the url that loads the move into page */
	console.log('Request received');
	if (!req.files)
     	return res.status(400).send('No files were uploaded.');
    let video = req.files.video;
   	console.log(video.name);
    var timestamp = Date.now();
    var tmpName = video.name.slice(0,video.name.lastIndexOf('.'))+'_'+timestamp+'.'+video.name.slice(video.name.lastIndexOf('.')+1,video.name.length);
    console.log(tmpName)
    video.mv('tmp/'+tmpName);
    
	var command = ffmpeg();
	command
	.on('end', function(){onEnd(res) })
	.on('progress', onProgress)
	.on('error', onError)
	.input('tmp/'+tmpName)
	.videoFilter(["movie=overlay.png [watermark]; [in][watermark] overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2 [out]"])
	.output('uploads/'+tmpName)
	.run();
	function onEnd(res) {
		console.log('Finished processing');
		//res.send('uploads/'+tmpName);
		var params = {ACL:'public-read', Bucket: 'wsaunders1014-test', Key: 'uploads/'+tmpName, Body: fs.createReadStream('uploads/'+tmpName)};
		
		var uploadPromise = S3Client.upload(params).promise();
		uploadPromise.then(function(data){
			console.log(data.Location);
			
			res.send(data.Location);
		})
		
	}

	/* Attempting to send stream to AWS Encoder instead of using ffmpeg  */
});
function onProgress(progress){
 // if (progress.timemark != timemark) {
 // timemark = progress.timemark;
 //console.log('Progress: ' + progress.percent + '% done');
 console.log('Processing...');
}

function onError(err, stdout, stderr) {
	console.log(err, stdout,stderr)
 console.log('Cannot process video: ' + err.message);
}

// app.get("*",function(req,res){
// 	res.sendFile('index.html',{root:__dirname+''});
// 	//next();
// });

app.listen(3000, function(){
	console.log(`App listening on port 3000!`);
});

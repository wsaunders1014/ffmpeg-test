(function() {
 var jQuery;

 if (window.jQuery === undefined || window.jQuery.fn.jquery !== '2.2.4') {
   var script_tag = document.createElement('script');
   script_tag.setAttribute("type","text/javascript");
   script_tag.setAttribute("src",
       "http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js");
   if (script_tag.readyState) {
     script_tag.onreadystatechange = function () { // For old versions of IE
         if (this.readyState == 'complete' || this.readyState == 'loaded') {
             scriptLoadHandler();
         }
     };
   } else { // Other browsers
     script_tag.onload = scriptLoadHandler;
   }
   (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);    
 } else {    
   jQuery = window.jQuery;
   main(); //our main JS functionality
 }


 function scriptLoadHandler() {
   jQuery = window.jQuery.noConflict(true);

   main(); //our main JS functionality
 }

 function main() {     
   jQuery(document).ready(function($) {
     var homeURL = "http://iamwillsaunders.com/";
      var css_link = $("<link>", { 
       rel: "stylesheet", 
       type: "text/css", 
       href: homeURL + "widget.css" 
     });
      css_link.appendTo('head'); 
      var $container = $('#widget');
      $.ajax('http://iamwillsaunders.com/widget-data.js?callback=?', {dataType:'jsonp', jsonpCallback:'callback'}).success(function(data){
        console.log(data)
        $container.html(data.html);
        $('#submit').on('click', function(e){
          e.preventDefault();
          var file = $('input').eq(0)[0].files[0];
          console.log(file)
          var fd = new FormData();
          fd.append('file', file);
          
          // $.ajax({type:'POST',url:homeURL+'widget-upload.php', data:fd,processData:false,contentType:false}).done(function(data){
          //   console.log(data)
          // })
        })
      });
   });
}
})();
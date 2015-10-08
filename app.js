var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var spark = require('sparknode');

//require('http://cdn.jsdelivr.net/sparkjs/0.5.9/spark.min.js"')

app.set('views', './views');
app.set('view engine', 'jade');

var core = new spark.Core({
  accessToken: 'a70ed372617e76ac66db33e77ff16f3e10dba546',
  id: '53ff6f066667574831362067'
});

scrapeFunc();
setInterval(scrapeFunc,1000*60*60);

core.on('connect', function()
{
  core.write('Hello msg!');
});

app.get('/', function (req, res)
{
  res.render('scrape', {title: 'Hey', message: 'Hello there!'});
});

var tl;
var headlines = [];

app.get('/tl', function(req, res)
{
  res.send(tl);
});

var curitem = 0;

function writeItem()
{
  var allstr = headlines[curitem];
  var mid = Math.round(allstr.length / 2);
  var a1 = allstr.substr(0,mid);
  var a2 = allstr.substr(mid,allstr.length-1);
  console.log(a1);
  console.log(a2);
  core.write(a1);
  setTimeout(core.write2, 50, a2);
}

setTimeout(writeItem, 3000);

core.on('next',function()
{
  console.log('next!');
  if (curitem < headlines.length - 1)
    curitem++;
  else
    curitem = 0;
  //console.log(headlines[curitem]);
  setTimeout(writeItem, 50);
});

function scrapeFunc()
{
    url = 'http://singaporeseen.stomp.com.sg/singaporeseen/';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error)
        {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            //console.log('no error');
            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            $('.headline24').filter(function(){
              // Let's store the data we filter into a variable so we can easily see what's going on.
              var data = $(this);
              //console.log(data);
              // In examining the DOM we notice that the title rests within the first child element of the header tag. 
              // Utilizing jQuery we can easily navigate and get the text by writing the following code:
              headlines.push(data.children().first().text());
              // Once we have our title, we'll store it to the our json object.
              //json.title = title;
              tl = headlines[0];
              //console.log(tl);
            });
            $('.headline20').each(function(i, elem){
              // Let's store the data we filter into a variable so we can easily see what's going on.
              var data = $(this);
              //console.log(data);
              headlines.push(data.children().first().text());
              // Once we have our title, we'll store it to the our json object.
              //json.title = title;
              //tl = headlines[0];
              //console.log(headlines[headlines.length-1]);
            });
        }
    });
}

app.get('/scrape', function(req, res)
{
  res.send(headlines[0]);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

exports = module.exports = app;


var http = require('http');
var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var builder = require('./builder');

http.createServer(function(req, rep) {
	var requrl = url.parse(req.url, true);
	var page = requrl.pathname.split("/");
	page = page[page.length - 1];

	console.log(page);

	if (page == "compile") {
		var chunk = "";
		req.on('data', function(data) {
			if (chunk.length > 50000) {
				rep.end();
			} else {
				chunk += data.toString();
			}
		});
		req.on('end', function() {
			console.log(chunk);
			try {
				var data = querystring.parse(chunk);
				console.log(data);

				data.appID = "qg_" + data.appName.replace(/\./g, '').replace(/\s/g, '');

				builder(data, data.html, function(tmpdir) {
					rep.writeHead(200, { 'Content-type': 'application/zip', 'Content-Disposition': 'inline; filename="yourapp.apk"' });
					fs.createReadStream(tmpdir + "/output.apk").pipe(rep);
				});
			} catch (e) {
				console.log("bad data");
			}
		});
	} else {
		rep.writeHead(200, { "Content-type": "text/html" });
		fs.createReadStream("form.html").pipe(rep);
	}
}).listen(8891);
 

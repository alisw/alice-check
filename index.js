var http = require('http')
    url  = require('url');

function nocache(d) {
  var resp = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  };
  for (k in d) {
    resp[k] = d[k];
  }
  return resp;
}

function boolitem(test, iftrue, iffalse) {
  return '<p><i class="' + (test ? 'yay' : 'nay') + '"></i> ' + (test ? iftrue : iffalse) + '</p>';
}

http.createServer(function (req, res) {
  uri = url.parse(req.url);
  if (uri.pathname == "/health") {
    res.writeHead(200, nocache({"Content-Type": "text/plain"}));
    res.end("ok");
  }
  else if (uri.pathname == "/") {
    res.writeHead(200, nocache({"Content-Type": "text/html"}));

    var user = req.headers["adfs_login"];
    var name = req.headers["adfs_fullname"];
    var groups = req.headers["adfs_group"];
    groups = (groups === undefined) ? [] : groups.split(";");

    content = "";
    content += boolitem(user !== undefined && name !== undefined,
                        "Your CERN username is " + user + " and your name is " + name,
                        "Not a registered CERN user");
    content += boolitem(groups.indexOf("alice-member") >= 0,
                        "You are an ALICE member",
                        "You are not an ALICE member");

    var txt = "<!doctype html>"                                                             +
              "<html lang=\"en\">"                                                          +
              "<head>"                                                                      +
              "<meta charset=\"utf-8\">"                                                    +
              "<title>ALICE user permissions check</title>"                                 +
              "<style>"                                                                     +
              "body { font: 13pt helvetica, sans-serif; }"                                  +
              ".yay { font-size: 165%; color: green; } .yay::before { content: '\\2714'; }" +
              ".nay { font-size: 165%; color: red; }   .nay::before { content: '\\2718'; }" +
              "</style>"                                                                    +
              "</head>"                                                                     +
              "<body>"                                                                      +
              "<h1>Hi!</h1>"                                                                +
              content                                                                       +
              "</body>"                                                                     +
              "</html>";
    res.end(txt);
  }
  else {
    res.writeHead(404, nocache({"Content-Type": "text/plain"}));
    res.end("Sorry, path not found.");
  }
}).listen(8888);

console.log("Server started on 8888");

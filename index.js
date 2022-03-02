const { http, url, util } = require('./main/includes');
const { conn } = require('./main/database');

const server = http.createServer((req, res) => {

        let path = url.parse(req.url, true);
        let query = util.inspect(path.query.id);
        res.setHeader('Content-Type', 'application/json');
        let id = query.replace(/'/g, '');

        //Select only one of all posts...
        if(req.url == `/api/posts/select?id=${id}`) {
            conn.query('SELECT * FROM posts WHERE id=?', [id], (err, result) => {
                if(err) throw err;
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(JSON.stringify(result));
                res.end();
            });
        } else if(req.url === `/api/posts/create`) {
            //API url requires the request method to be POST method.
            if(req.method === 'POST') {
                var body = '';
                //Accepts and awaits the every single bit of data..
                req.on('data', data => {
                    body += data;   //Append the data inside the variable..
                });
                //Accepts and awaits the end of the stream of incoming packets, then do something..
                req.on('end', () => {
                    //Tell the packet to have the content type of text or html.
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    var body_json = JSON.parse(body);
                    //Post name must be defined, we cannot do much without it..
                    if(body_json.post_name) {
                        //Check if name already exists in the database on the local server..
                        conn.query('SELECT * FROM posts WHERE post_name=?', [body_json.post_name], (err, result) => {
                            if(err) throw err;  //If something went wrong, throws an error..
                            if(!result[0]) {    //Same post doesn't name exists?
                                //Write inside the database from the stream's body...
                                conn.query('INSERT INTO posts (`post_name`, `desc`, `positions`, `position_names`, `youtube_url`, `pic_url`) VALUES (?, ?, ?, ?, ?, ?)',
                                [body_json.post_name, body_json.desc, body_json.positions, body_json.position_names, body_json.youtube_url, body_json.pic_url], (errInsert, resInsert) => {
                                    if(errInsert) throw errInsert;  //If there's something wrong with inserting in database, trow an error!
                                    res.end(`Post successfully added!`);   //Returns the stringified success text.
                                });

                            } else res.end(`This post name already exists!`);   //Same post name apparently exists.. don't do anything
                        });
                    } else res.end('Post name must be filled!');    //Post name is not filled, then do this..
                });
            } else res.end('This API link has different method type - POST');
            //Gets all the posts in the database
        } else if(req.url === "/api/posts/all") {
            //Select every single post in the database..
            conn.query('SELECT * FROM posts', (err, result) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(JSON.stringify(result));
                res.end();
            });
        } else if(req.url === `/api/posts/delete?id=${id}`) {
            //If packet method is set to DELETE, then go ahead..
            if(req.method === "DELETE") {
                conn.query('DELETE FROM posts WHERE id=?', [id], (err, result) => {
                    if(err) throw err;
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    if(result) {
                        res.write(`ID ${id} successfully deleted!`);
                        res.end();
                    } else res.end(`Oops, looks like there is no item with id ${id}`);
                });
            } else res.end('This API link has different method type - DELETE');
        }
});

server.listen(3001, () => console.log('Server open on port 3002'));
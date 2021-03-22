var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

//database sqlite3
const sqlite3 = require('sqlite3');

//geocoding
const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'openstreetmap'
};

const geocoder = NodeGeocoder(options);

var updatedEntries = [];

var db = new sqlite3.Database('./covidinfo.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("database connected");
});

//open existing database
function openDatabase() {
	db = new sqlite3.Database('./covidinfo.db',sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log("database opened");
	});
}

function createTable() {
	db.serialize(() => {
		db.run(`SELECT name FROM covidinfo WHERE type = 'table' AND name='{covid}'`,(err)=>{
			if (err) {
				let table = db.run(`CREATE TABLE Covid(
				ssid TEXT NOT NULL, 
				location TEXT NOT NULL, 
				time TEXT NOT NULL
				)`
				,(err) => {
					if (err) {
						console.log("table already exist!");
					} else {
						console.log("table created!");
					}
				});
				console.log(table);
			}
		});
	})
}

function insertData(s,l,t) {
	db.run(`INSERT INTO Covid(ssid,location,time) VALUES(?,?,?)`,[s,l,t],(err)=>{
		if (err) {
			console.log(err.message);
		}
		console.log("A row has been inserted: ssid: "+s+",location: "+l+", time: "+t);
	});
}

function updateEntries() {
	var sql = `SELECT * FROM Covid ORDER BY time`;
	db.all(sql,(err,rows) => {
		var entry = {};
		var uid = 0;
		
		if (err) {
			console.log("Database SELECT error");
		}
		if (rows != null) {		
			Promise.all(rows.map((row)=>{
				var longitude = parseFloat(row.location.split(",")[0]);
				var latitude = parseFloat(row.location.split(",")[1]);
				return geocoder.reverse({lat:latitude,lon:longitude}).then((res)=>{
					var address = res[0].formattedAddress; 
					entry = {id:uid,ssid:row.ssid,lon:longitude,lat:latitude,add:address,time:row.time};	
					uid++;
					return entry;
				});
			})).then((newRows)=> {
				console.log(newRows);
				updatedEntries = newRows;
				io.emit("retrieveData",updatedEntries);	
			});
		}
	});
	console.log("updating entries");
}

updateEntries(); //when server first starts, update entries

//page update every 120 seconds
const interval = setInterval(() => {
	updateEntries();
}, 120000);
	
app.get('/',(req,res) => {
	res.json({name:"Ming"});
});

io.on('connection',(socket) => {
	console.log("a user connected");
	openDatabase();
	
	socket.on('disconnect',(reason)=> {
		console.log("user disconnected: "+reason);
	});
	
	socket.on('sendData',(data)=>{
		createTable();
		insertData(data.ssid,data.location,data.time);
	});
	
	socket.on('askForUpdate',(data)=>{
		io.emit("retrieveData",updatedEntries);
	});
});

http.listen(5000,()=> {
	console.log('listening on *:5000');
});
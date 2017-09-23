const spawn 	= require('child_process').spawn
const request 	= require('request');
const cheerio	= require('cheerio');


const searchString = process.argv[2]

const searchUrl = "http://www.torrent9.pe/search_torrent/"+ searchString +".html"

let Res = []

request(searchUrl, function (error, response, body) {

	const $ = cheerio.load(body)
	let results = $('table.table.table-striped.table-bordered.cust-table tbody tr td a')
	results.each(function(i, el) {
		let url = $(this).attr('href').replace('/torrent/', '/get_torrent/') + ".torrent"
		Res[i] = {title: $(this).text(), url: url}
		console.log($(this).text() + " => " + url)
	})

	let wget = spawn('wget', ['-Ofile.torrent','http://www.torrent9.pe' + Res[0].url])
	wget.on('close', (code) => {
  		console.log(`wget exited with code ${code}`);
	});

	spawn('mkdir', ['dl'])

	let tr = spawn('transmission-cli', ['-w dl', 'file.torrent'])
	tr.stdout.on('data', (data) => {
  		console.log(`stdout: ${data}`);
	});

	tr.stderr.on('data', (data) => {
  		console.log(`stderr: ${data}`);
	});
	tr.on('close', (code) => {
  		console.log(`transmission exited with code ${code}`);
	});

})



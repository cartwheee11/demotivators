
const html2image = require('node-html-to-image');
// const fs = require('fs');
const config = require('./config.json');
const Discord = require('discord.js');

function getDemotivator(url, title, subtitle) {
	let html = `
		<head>
			<style>
				body {
					padding: 30px;
					background: black;
					color: white; 
					text-align: center;
				}

				img {
					width: 100%;
					border: 1px solid white;
				}

				h2 {
					font-family: sans-serif;
					font-weight: 400;
					margin-bottom: 0;
					padding-bottom: 0;
				}
			</style>
		</head>

		<body>
				<img src="${url}" alt="">
				<h1>${title}</h1>
				<h2>${subtitle}</h2>
		</body>
	`

	return html2image({
		html: html,
	});
}

let client = new Discord.Client();

client.login(config.BOT_TOKEN);

let PREFIX = '-dem';
client.on('message', message => {
	if(message.author.bot == true) return;
	if(!message.content.startsWith(PREFIX)) return;

	let body = message.content.replace(PREFIX, '');
	body = body.trim();
	body = body.split('|');

	let imageURL = Array.from(message.attachments)[0][1].attachment;
	let title = body[0];
	let subtitle = body[1];

	getDemotivator(imageURL, title, subtitle).then(image => {
		console.log(image);

		let reply = new Discord.MessageEmbed();
		reply.attachFiles([image]).setTitle('Это твоя новая кортинка, Волера')

		message.reply(reply);
	});
});




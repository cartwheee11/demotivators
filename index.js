
const config = require('./config.json');
const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');

Canvas.registerFont('fonts/PTSerif-Regular.ttf', { family: 'kek-Times' });
Canvas.registerFont('fonts/Roboto-Regular.ttf', { family: 'kek-Arial' });

let client = new Discord.Client({ intents: [ Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS ] });

client.login(config.BOT_TOKEN);

const NO_IMAGE_ERRORS = [
	'Вы не прикрепили картинку, обязательно сделайте это!',
	'У вас что, нет картинки? Сбросьте мне по почте',
	'Эмм, а картинка?',
	'Вы забыли про картинку! >:c'
]

const INCORRECT_ATTACHMENT_ERRORS = [
	'Вместо картики вы скинули что-то не то',
	'Мы ждем именно картинку, а не непонятный файл'
]

const HELLOS = [
	'Привет, вот твой дивный демотиватор:',
	'Как же крут твой новый демотиватор:',
	'Деееееемотиватор готов:',
	'Кек',
	'Лол'
]

const DESCS = [
	'Афигенно -_-',
	'Нет слов 😍',
	'Бред...'
]

function getRandomArrayElement(arr) {
	let len = arr.length;
	let rand = Math.floor(Math.random() * len);
	return arr[rand];
}

function getRandHello(arr) {
	let len = arr.length;
	let rand = Math.floor(Math.random() * len);
	return arr[rand];
}

const CANVAS_WIDTH = 500;
const PREFIX = '-dem';
const CONTAINER_PADDING = 30;
const TEXT_MARGIN_TOP = 20;
const CONTENT_WIDTH = CANVAS_WIDTH - CONTAINER_PADDING * 2;
const TITLE_LINE_HEIGHT = 40;
const TITLE_FONT =  TITLE_LINE_HEIGHT + 'px kek-Times';
const SUBTITLE_LINE_HEIGHT = 30;
const SUBTITLE_FONT =  SUBTITLE_LINE_HEIGHT + 'px kek-Arial';

// function getCanvasTextarea(context, text, maxWidth) {
// 	let words = text.split(" ");
// 	let countWords = words.length;
// 	let result = "";
// 	for (let n = 0; n < countWords; n++) {
// 		let testLine = result + words[n] + " ";
// 		let testWidth = context.measureText(testLine).width;
// 		if (testWidth > maxWidth) {
// 			result = result + '\n' + words[n] + " ";
// 		} else {
// 			result += words[n] + " ";
// 		}
// 	}
// 	return result;
// }

function printCanvasTextarea(c, text, x, y, width, lineHeight) {
	let words = text.split(' ');
	let line = '';
	let dy = 0;

	line = words[0] + ' ';

	if(words.length == 1) {
		c.fillText(line, x, y);
	} else {
		for(let i = 1; i < words.length; i++) {
			
			if(c.measureText(line + words[i] + ' ').width > width) {
				c.fillText(line, x, y + dy);
				dy += lineHeight;
				line = words[i] + ' ';
			} else {
				line = line + words[i] + ' ';
			}

			if(i == words.length - 1) {
				c.fillText(line, x, y + dy);
			}
		}
	}
}

function getCanvasTextareaHeight(context, text, maxWidth, lineHeight) {
	let words = text.split(" ");
	let countWords = words.length;
	let result = "";
	for (let n = 0; n < countWords; n++) {
		let testLine = result + words[n] + " ";
		let testWidth = context.measureText(testLine).width;
		if (testWidth > maxWidth) {
			result = result + '\n' + words[n] + " ";
		} else {
			result += words[n] + " ";
		}
	}

	return result.split('\n').length * lineHeight;
}

client.on('ready', () => {
	function setActivity() {
		client.user.setPresence({ activities: [{ name: '-dem help >:D' }] })
	}

	setActivity();
	setInterval(setActivity, 300000)
})

client.on('messageCreate', message => {
	try{
		if(!message.content.startsWith(PREFIX)) return;
		if(message.author.bot) return;
		let textBody = message.content.replace(PREFIX, '').trim();
		if(textBody == '') {
			message.reply('Нет текста — нет мема').then(() => {
				message.delete();
			})
			return;
		}
		//получаем текст из сообщения
		let tmp = textBody.replace('|', 'ƒ©˙∆˚¬…').split('ƒ©˙∆˚¬…');
		tmp = tmp.map(elem => { elem.trim(); if (elem != '') return elem });
		let text = [];

		tmp.forEach(elem => {
			if(elem) {
				elem = elem.trim();
				if(elem != '')
					text.push(elem);
			}
		});

		if(!message.attachments.size)  {

			if (textBody == 'help') {
				// message.reply('ди нах')

				let embed = new Discord.MessageEmbed();
				embed.setTitle('Как пользоваться -dem:')
				embed.setDescription('1) Прикрепляешь картинку 🖼️\n 2) Пишешь типа -dem <text 1> | <text 2> 😚\n 3) Можно и без <text 2> 😉\n 4) Профит 😍')
				embed.setColor('#faa81a');
				message.reply({
					embeds: [ embed ]
				})
			} else {
				message.reply(getRandomArrayElement(NO_IMAGE_ERRORS)).then(() => {
					message.delete();
				})
			}
			return;
		}

		let attachment = Array.from(message.attachments)[0][1];
		if(!attachment.height || !attachment.width) {
			message.reply(getRandomArrayElement(INCORRECT_ATTACHMENT_ERRORS)).then(() => {
				message.delete();
			})
			
			return;
		}

		//получаем картинку из вложения
		let obtainedImageURL = Array.from(message.attachments)[0][1].attachment;

		//создаем и настраиваем элемент Canvas
		let canvas = Canvas.createCanvas();
		let c = canvas.getContext('2d');
		canvas.width = 500;
		
		Canvas.loadImage(obtainedImageURL).then(obtainedImage => {
			
			

			c.font = TITLE_FONT;
			let title = text[0];
			let titleHeight = getCanvasTextareaHeight(c, title, CONTENT_WIDTH, TITLE_LINE_HEIGHT);

			let textHeight = 0;
			let subtitleHeight = 0;
			let subtitle = null;

			if(text[1]) {
				c.font = SUBTITLE_FONT;
				subtitle = text[1];
				subtitleHeight = getCanvasTextareaHeight(c, subtitle, CONTENT_WIDTH, SUBTITLE_LINE_HEIGHT);
				
			} 

			textHegiht = subtitleHeight + titleHeight;
			
			let formatedImageWidth = canvas.width - CONTAINER_PADDING * 2;
			let sizeMultipler = 1 / obtainedImage.width * formatedImageWidth;
			let formatedImageHeight = obtainedImage.height * sizeMultipler;
			
			canvas.height = formatedImageHeight + CONTAINER_PADDING * 2 + textHegiht + TEXT_MARGIN_TOP * ( subtitle ? 2 : 1);
	
			c.textAlign = 'center';
			c.textBaseline = 'top';
	
			//Наносим изображениеc
			c.strokeStyle = 'white';
			c.fillStyle = 'black';

			c.fillRect(0, 0, canvas.width, canvas.height);
			c.strokeRect(CONTAINER_PADDING - 5, CONTAINER_PADDING - 5, formatedImageWidth + 10, formatedImageHeight + 10);
			c.drawImage(obtainedImage, CONTAINER_PADDING, CONTAINER_PADDING, formatedImageWidth, formatedImageHeight);			
	
			//Наносим текст заголовка
			c.fillStyle = 'white';
			c.font = TITLE_FONT;
			printCanvasTextarea(c, title, canvas.width / 2, CONTAINER_PADDING + formatedImageHeight + TEXT_MARGIN_TOP, CONTENT_WIDTH, TITLE_LINE_HEIGHT);
			
			if(subtitle){
				c.font = SUBTITLE_FONT;
				printCanvasTextarea(c, subtitle, canvas.width / 2, CONTAINER_PADDING + formatedImageHeight + TEXT_MARGIN_TOP * 2 + titleHeight, CONTENT_WIDTH, SUBTITLE_LINE_HEIGHT);
			}

			let replyText = getRandHello(HELLOS);

			const embed = new Discord.MessageEmbed();
			let attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'image.png')
			
			embed.setTitle(replyText);
			embed.setDescription(getRandomArrayElement(DESCS));
			embed.setColor('#faa81a');
			embed.setImage('attachment://image.png');
			embed.setFooter({
				text: 'Прикол заказал ' + message.author.tag,
				iconURL: message.author.displayAvatarURL()
			});
			message.channel.send({
				embeds: [ embed ],
				files: [ attachment ]
			})
			
		});
	} catch(e) {
		console.log(e)
		message.reply('Некорректная команда').then(() => {
			message.delete();
		})
	}

});
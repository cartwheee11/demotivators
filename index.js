
const config = require('./config.json');
const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require('fs');
const { CLOSING } = require('ws');

Canvas.registerFont('fonts/PTSerif-Regular.ttf', { family: 'kek-Times' });
Canvas.registerFont('fonts/Roboto-Regular.ttf', { family: 'kek-Arial' });

let client = new Discord.Client();
client.login(config.BOT_TOKEN);

const HELLOS = [
	'Привет, вот твой дивный демотиватор:',
	'Как же крут твой новый демотиватор:',
	'дИИИИИмотиватор готов:',
	'кек',
	'лол'
]

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


client.on('message', message => {

	try{
		if(!message.content.startsWith(PREFIX)) return;
		if(message.author.bot) return;
		
		//получаем картинку из вложения
		let obtainedImageURL = Array.from(message.attachments)[0][1].attachment;
	
		//создаем и настраиваем элемент Canvas
		let canvas = Canvas.createCanvas();
		let c = canvas.getContext('2d');
		canvas.width = 500;
		
		//получаем текст из сообщения
		let text = message.content.replace(PREFIX, '').trim().split('|');
		text = text.map(elem => elem.trim());
		Canvas.loadImage(obtainedImageURL).then(obtainedImage => {
			
			message.delete();

			c.font = TITLE_FONT;
			let title = text[0];
			// console.log(title);
			let titleHeight = getCanvasTextareaHeight(c, title, CONTENT_WIDTH, TITLE_LINE_HEIGHT);
	
			c.font = SUBTITLE_FONT;
			let subtitle = text[1];
			// console.log(subtitle);
			let subtitleHeight = getCanvasTextareaHeight(c, subtitle, CONTENT_WIDTH, SUBTITLE_LINE_HEIGHT);
			let textHegiht = subtitleHeight + titleHeight;
			let formatedImageWidth = canvas.width - CONTAINER_PADDING * 2;
			let sizeMultipler = 1 / obtainedImage.width * formatedImageWidth;
			let formatedImageHeight = obtainedImage.height * sizeMultipler;
			
			canvas.height = formatedImageHeight + CONTAINER_PADDING * 2 + textHegiht + TEXT_MARGIN_TOP * 2;
	
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
	
			c.font = SUBTITLE_FONT;
			printCanvasTextarea(c, subtitle, canvas.width / 2, CONTAINER_PADDING + formatedImageHeight + TEXT_MARGIN_TOP * 2 + titleHeight, CONTENT_WIDTH, SUBTITLE_LINE_HEIGHT);
	
			let replyText = getRandHello(HELLOS);
			message.reply(replyText, { files: [ canvas.toBuffer() ] })
		});
	} catch {
		message.reply('Это так не работает');
	}

});
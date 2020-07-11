var tmi = require('tmi.js');

var canal = "CoringaStark";

var options = {
	options: {
		debug: true
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: {
		username: "bot_cap",
		password: "oauth:kf45qw6b72xc3oh136basdf2o3ndz0"
	},
	channels: [canal]
};


var client = new tmi.client(options);
client.connect();


client.on("chat", function(channel, user, message, self)
{
	var message = message.toLowerCase();

	switch(message)
	{
		case '!elo':
		{
			client.action(canal, "Coringaa Stark -> Prata III");

			break;
		}

		case '!salve':
		{
			client.action(canal, user['display-name'] + ", está salvo!!");

			break;
		}

		case '!youtube':
		{
			client.action(canal, "https://www.youtube.com/channel/UCeHPVlwUFR53hNJ7V1viedg");

			break;
		}

		case "!cap":
		case "!bot_cap":
		{
			client.action(canal, "Olá Olá! Sou o Bot CAP :)");

			break;
		}

		case "!commands":
		case "!comandos":
		case "!ajuda":
		case "!help":
		{
			client.action(canal, "!salve, !elo, !youtube, !dc, !discord, !cap, !bot_cap");

			break;
		}

		case '!dc':
		case '!discord':
		{
			client.action(canal, "Cauê Antunes#9834");

			break;
		}
	}
});
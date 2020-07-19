var tmi = require('tmi.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var tokenRiot = ""; //Deve ser inserido o token da Riot
var canal = "CoringaStark";
var elosConsultados = {};
var senhaTwitch = ""; // Deve ser inserida a senha da Twitch para o bot

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
		password: senhaTwitch
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
			var p1 = new Promise(
				function(resolve, reject) {
					buscaElo('Coringaa Stark', resolve);
				}
			);

			p1.then(
				function(val) {
					client.action(canal, val);
				}
			);

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
			client.action(canal, "!salve, !elo, !elo {Nome de usuario}, !youtube, !dc, !discord, !cap, !bot_cap");

			break;
		}

		case '!dc':
		case '!discord':
		{
			client.action(canal, "Cauê Antunes#9834");

			break;
		}

		default:
		{
			if(message.startsWith("!elo "))
			{
				var p1 = new Promise(
					function(resolve, reject) {
						var nomeUsuario = message.substring(5);
						buscaElo(nomeUsuario, resolve);
					}
				);

				p1.then(
					function(val) {
						client.action(canal, val);
					}
				);
			}
		}
	}
});

function verificaHistoricoElo(nomeUsuario, resolve)
{
	if(typeof elosConsultados[nomeUsuario] === 'undefined')
	{
		return false;
	}

	var date = new Date();
	var dateConsultado = elosConsultados[nomeUsuario]['horaPesquisa'];
	var minutes = (date.getTime() - dateConsultado.getTime()) / (60 * 1000);

	if (minutes > 4 || (minutes < 0 && minutes > -1395)) {
		return false;
	}
	else
	{
		return (elosConsultados[nomeUsuario]['nome'] + " -> " + elosConsultados[nomeUsuario]['tier'] + " " + elosConsultados[nomeUsuario]['rank']);
	}
}

function buscaElo(nomeUsuario, resolve)
{
	var usuario = encodeURI(nomeUsuario, resolve);

	var resultado = verificaHistoricoElo(usuario);

	if(resultado)
	{
		resolve(resultado);
	}

	var url = "https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + usuario;//Sua URL

	var xhttpBuscaUsuario = new XMLHttpRequest();
	xhttpBuscaUsuario.open("GET", url, true);
	xhttpBuscaUsuario.setRequestHeader("X-Riot-Token", tokenRiot);

	xhttpBuscaUsuario.onreadystatechange = function()
	{	//Função a ser chamada quando a requisição retornar do servidor
		if ( xhttpBuscaUsuario.readyState == 4 && xhttpBuscaUsuario.status == 200 && xhttpBuscaUsuario.responseText)
		{	//Verifica se o retorno do servidor deu certo
			var resposta = xhttpBuscaUsuario.responseText;
			resposta = JSON.parse(resposta);
			var idUsuario = resposta.id;

			// Busca os usuários
			var url = "https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + idUsuario;//Sua URL

			var xhttpBuscaDadosRanked = new XMLHttpRequest();
			xhttpBuscaDadosRanked.open("GET", url, true);
			xhttpBuscaDadosRanked.setRequestHeader("X-Riot-Token", tokenRiot);

			xhttpBuscaDadosRanked.onreadystatechange = function()
			{	//Função a ser chamada quando a requisição retornar do servidor
				if ( xhttpBuscaDadosRanked.readyState == 4 && xhttpBuscaDadosRanked.status == 200 && xhttpBuscaDadosRanked.responseText)
				{	//Verifica se o retorno do servidor deu certo
					var BuscaDadosRanked = xhttpBuscaDadosRanked.responseText
					BuscaDadosRanked = JSON.parse(BuscaDadosRanked);

					BuscaDadosRanked.forEach(function(dados)
					{
						if(dados.queueType == "RANKED_SOLO_5x5")
						{
							dadosEloConsultado = {
								'nome': dados.summonerName,
								'tier': dados.tier,
								'rank': dados.rank,
								'horaPesquisa': new Date()
							};
							elosConsultados[usuario] = dadosEloConsultado;
							resolve(dados.summonerName + " -> " + dados.tier + " " + dados.rank);
						}
					});


				}
			}

			xhttpBuscaDadosRanked.send();	//A execução do script CONTINUARÁ mesmo que a requisição não tenha retornado do servidor
		}
	}

	xhttpBuscaUsuario.send();	//A execução do script CONTINUARÁ mesmo que a requisição não tenha retornado do servidor
}
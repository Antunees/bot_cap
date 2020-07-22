var tmi = require('tmi.js');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var dadosUsuario = require('./dados.json');

var client = new tmi.client(dadosUsuario.twitch.options);
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
					client.action(dadosUsuario.twitch.canal, val);
				}
			);

			break;
		}

		case '!salve':
		{
			client.action(dadosUsuario.twitch.canal, user['display-name'] + ", está salvo!!");

			break;
		}

		case '!youtube':
		{
			client.action(dadosUsuario.twitch.canal, "https://www.youtube.com/channel/UCeHPVlwUFR53hNJ7V1viedg");

			break;
		}

		case "!cap":
		case "!bot_cap":
		{
			client.action(dadosUsuario.twitch.canal, "Olá Olá! Sou o Bot CAP :)");

			break;
		}

		case "!commands":
		case "!comandos":
		case "!ajuda":
		case "!help":
		{
			client.action(dadosUsuario.twitch.canal, "!salve, !elo, !elo {Nome de usuario}, !youtube, !dc, !discord, !cap, !bot_cap");

			break;
		}

		case '!dc':
		case '!discord':
		{
			client.action(dadosUsuario.twitch.canal, "Cauê Antunes#9834");

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
						client.action(dadosUsuario.twitch.canal, val);
					}
				);
			}
		}
	}
});

function verificaHistoricoElo(nomeUsuario)
{
	if(typeof dadosUsuario.riot.elosConsultados[nomeUsuario] === 'undefined')
	{
		return false;
	}

	var date = new Date();
	var dateConsultado = dadosUsuario.riot.elosConsultados[nomeUsuario]['horaPesquisa'];
	var minutes = (date.getTime() - dateConsultado.getTime()) / (60 * 1000);

	if (minutes > 4 || (minutes < 0 && minutes > -1395)) {
		return false;
	}
	else
	{
		return (dadosUsuario.riot.elosConsultados[nomeUsuario]['nome'] + " -> " + dadosUsuario.riot.elosConsultados[nomeUsuario]['tier'] + " " + dadosUsuario.riot.elosConsultados[nomeUsuario]['rank']);
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
	xhttpBuscaUsuario.setRequestHeader("X-Riot-Token", dadosUsuario.riot.tokenRiot);

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
			xhttpBuscaDadosRanked.setRequestHeader("X-Riot-Token", dadosUsuario.riot.tokenRiot);

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
							console.log(dados);
							dadosEloConsultado = {
								'nome': dados.summonerName,
								'tier': dados.tier,
								'rank': dados.rank,
								'horaPesquisa': new Date()
							};

							dadosUsuario.riot.elosConsultados[usuario] = dadosEloConsultado;

							var texto = dados.summonerName + " . . . . . . . . . . " + dados.tier + " " + dados.rank + " (" + dados.leaguePoints + "LP)";
							texto = dadosUsuario.twitch.resposta.separador + texto + dadosUsuario.twitch.resposta.separador;
							resolve(texto);
						}
					});


				}
			}

			xhttpBuscaDadosRanked.send();	//A execução do script CONTINUARÁ mesmo que a requisição não tenha retornado do servidor
		}
	}

	xhttpBuscaUsuario.send();	//A execução do script CONTINUARÁ mesmo que a requisição não tenha retornado do servidor
}
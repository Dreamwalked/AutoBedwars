const mineflayer = require('mineflayer')
const { log, replPlugin } = require('mineflayer-repl');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
const webhook = ''
function createBot() {
    const bot = mineflayer.createBot({
        host: 'mc.hypixel.net', // minecraft server ip
        username: '',   //your email
        auth: 'microsoft', // for offline mode servers, you can set this to 'offline'
        version: "1.17",          // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
        logErrors: true        // whether to log errors to the console
    })

    bot.once('login', () => {
        bot._client.on('packet', function (packet, packetMeta) {
            if (packetMeta.name.includes('disconnect')) {
                console.log('§f[§4Autobw§f]: §fYou were disconnected from the server...')
                console.log('§f[§4Autobw§f]: §f' + JSON.stringify(packet))
            }
        })
    })

    bot.once('spawn', async () => {
        await bot.waitForChunksToLoad()
        await sleep(2000)
        bot.chat('/play bedwars_four_four')
    })
    let start
    bot.on('message', async (message) => {
        console.log(message.toAnsi())
        const msg = message.toString()
        if (msg.includes("You were kicked for inactivity!")) bot.chat('/rejoin')
        else if (msg.includes("joined the lobby")) bot.chat('/play bedwars_four_four')
        else if (msg.includes("You were spawned in limbo") || msg.includes("A kick occurred")) bot.chat('/l')
        else if (msg.toLowerCase().includes("afk")) {
            bot.setControlState('forward', true)
            await sleep(5000)
            bot.setControlState('forward', false)
            await sleep(500)
            bot.setControlState('back', true)
            await sleep(5000)
            bot.setControlState('back', false)
        }
        else if (msg.includes("Protect your bed and destroy")) {
            start = Date.now()
            await sleep(200)
            //bot.chat("im a free final")
            //bot.setControlState('sprint', true)
            bot.setControlState('back', true)
            await sleep(5000)
            bot.setControlState('back', false)
        }
        else if (msg.includes(bot.username) && msg.includes("FINAL KILL")) {
            bot.chat('/play bedwars_four_four')
            sendStuff(`${msg}\ndied in ${(Date.now() - start) / 1000}s`)
        }
        else if (msg.toLowerCase().includes("kraken") && msg.includes(":") && !msg.includes("iTzKraken: ")) {
            sendStuff(msg)
        }
    })
    replPlugin(bot);
    bot.repl.on('enter', function (command) {
        if (command.length === 0) return;
        if (command === 'quit') return bot.quit();
        bot.chat(command);
    });

}

createBot()

const sendStuff = (msg) => {
    fetch(webhook, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
            content: msg,
            username: 'bedwars god',
            avatar_url: `https://minotar.net/helm/${bot.username}/600.png`
        })
    })
        .then((response) => {
            return response.json();
        })
        .catch((error) => {
            console.error('Error: ' + error);
        });
}
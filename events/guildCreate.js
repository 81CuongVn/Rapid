const Discord = require("discord.js");
const fs = require("fs");
const ServerConfig = require('../models/ServerConfig');

exports.run = async (bot,guild) => {
    console.log("Acabamos de entrar em um servidor!");

    const filter = (reaction,user) => ['✅', '❌'].includes(reaction.emoji.name);

    guild.roles.create({ data: { name: 'Rapid Admin' }, });
    guild.roles.create({ data: { name: 'Rapid Muted' }, });

    const welcome_message = new Discord.MessageEmbed()
        .setColor("#ff0015")
        .setTitle('Rapid Bot')
        .setURL('https://google.com')
        .setDescription('Obrigado por me adicionar ao seu servidor!')
        .setThumbnail('https://cdn.discordapp.com/app-icons/734154625845952694/8261474e8963b9e62bf19159ca52dcea.png')
        .setAuthor('Rapid Bot', 'https://cdn.discordapp.com/app-icons/734154625845952694/8261474e8963b9e62bf19159ca52dcea.png', 'https://discord.js.org')
        .addFields(
            { name: 'Me adicione ao seu servidor!',value: '[Clique aqui! 🔗](https://discord.com/oauth2/authorize?client_id=734154625845952694&permissions=8&scope=bot)' },
            { name: 'Meu prefixo é r!',value: 'Para ver os comandos digite r!help' }
        )
        .setTimestamp();

    const antiflood_msg = new Discord.MessageEmbed()
        .setColor("#ff0015")
        .setTitle('Rapid Bot')
        .setURL('https://google.com')
        .setDescription('Deseja habilitar o sistema Anti-Flood?')
        .setThumbnail('https://cdn.discordapp.com/app-icons/734154625845952694/8261474e8963b9e62bf19159ca52dcea.png')
        .setAuthor('Rapid Bot', 'https://cdn.discordapp.com/app-icons/734154625845952694/8261474e8963b9e62bf19159ca52dcea.png', 'https://discord.js.org')
        .setTimestamp();

    if (guild.systemChannel){
        await guild.systemChannel.send(welcome_message);
        const msg = await guild.systemChannel.send(antiflood_msg);
        await msg.react('✅');
        await msg.react('❌');

        msg.awaitReactions(filter,{ max: 1, time: 120000, errors: ['time'] }).then(collected => {
            const reaction = collected.first();

            if (reaction.name === '✅'){
                ServerConfig.create({
                    guild: guild.id,
                    antispam: true,
                    joinedAt: new Date().getTime(),
                });
                msg.channel.send("Anti-Flood habilitado!");
            } else {
                ServerConfig.create({
                    guild: guild.id,
                    antispam: false,
                    joinedAt: new Date().getTime(),
                });

                msg.channel.send("Anti-Flood desabilitado!");
            }
        }).catch(collected => {
            msg.reply("Ocorreu algum erro");
        });
    } else {
        let channels = 0;
        guild.channels.cache.map(async (value,key,collection) => {
            if(guild.channels.resolve(value.id).type == "text" && channels < 1){
                channels = channels + 1;
                await guild.channels.resolve(value.id).send(welcome_message);
                const msg = await guild.channels.resolve(value.id).send(antiflood_msg);
                                
                await msg.react('✅');
                await msg.react('❌');
                
                await new Promise(r => setTimeout(r, 1000));
                msg.awaitReactions(filter,{ max: 1, time: 60000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first();

                    if (reaction._emoji.name === '✅'){
                        ServerConfig.create({
                            guild: guild.id,
                            antispam: true,
                            joinedAt: new Date().getTime(),
                        });

                        msg.channel.send("Anti-Flood habilitado!");
                    } else {
                        ServerConfig.create({
                            guild: guild.id,
                            antispam: false,
                            joinedAt: new Date().getTime(),
                        });

                        msg.reply("Anti-Flood desabilitado!");
                    }
                }).catch(collected => {
                    msg.reply("Ocorreu algum erro");
                });
            }
        });
    }
};
import discord
from discord.ext import commands
from discord_slash import SlashCommand

import logging
import sys
import os
from src.constants import BOT
from typing import Optional
import datetime as dt

logger = logging.getLogger("licence")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(
    filename='licence.log',
    encoding='utf-8',
    mode='w'
)
handler.setFormatter(logging.Formatter(
    '%(asctime)s:%(levelname)s:%(name)s: %(message)s'
))
logger.addHandler(handler)


class Licence(commands.AutoShardedBot):
    def __init__(self, *args, **kwargs):
        intents = discord.Intents.default()
        intents.members = True

        super().__init__(
            activity=discord.Game(
                name="Starting..."
            ),
            status=discord.Status.dnd,
            command_prefix="♫",
            intents=intents
        )
        self.slash = SlashCommand(
            self,
            sync_commands=True,
            sync_on_cog_reload=True
        )
        self.load_cogs()

    def _exit(self):
        try:
            self.loop.run_until_complete(self._close())
            logger.info("Pool closed")
        except Exception as e:
            logger.exception(e, exc_info=True)
            sys.exit(1)
        finally:
            logger.info("Licence has been shutted down")
            sys.exit(0)

    def run(self, *args, **kwargs):
        try:
            super().run(BOT, *args, **kwargs)
        except KeyboardInterrupt:
            self._exit()

    async def on_member_join(self, member):
        if member.dm_channel is None:
            await member.create_dm()

        channel = member.dm_channel

        embed = discord.Embed(
            color=0x007fa3,
            description="Bienvenue sur le discord **Licence Informatique@UCA** ce lieu a pour vocation d'être ta place de communication avec les autres étudiants et les professeurs durant ta licence.\n\nCe serveur est gérer par des étudiants et il se doit de rester un espace propre, pour cela, nous avons mis en places quelques règles que tu retrouveras dans <#743452204207439913>.\n\nN’oublie pas de choisir également un rôle pour avoir accès à tes cours dans <#748152325654446110>.\n\n**Un petit mot sur moi :** Mes créateurs, ne sont plus en licence et pour certains plus à l’université. C’est pour cela qu’ils ont besoin de toi afin que tu me maintiennes et que je continue à fonctionner pour tous les étudiants, je suis fait en Python et tu vas voir c’est simple, tout ce passe sur github : [https://github.com/thibaultjunin/discord-licence](https://github.com/thibaultjunin/discord-licence)\n**On compte sur toi !**",
            timestamp=dt.datetime.utcnow()
        )
        embed.set_author(
            name="Bienvenue sur le discord de la licence informatique à l'Université Côte d'Azur !",
            icon_url="https://usercontent.stantabcorp.com/~thibault/46d34e1eccb244ceabd468f3d597e853-logo-rond-l.png"
        )
        embed.set_thumbnail(
            url="https://usercontent.stantabcorp.com/~thibault/46d34e1eccb244ceabd468f3d597e853-logo-rond-l.png")
        embed.set_footer(
            text="Licence Informatique@UCA",
            icon_url="https://usercontent.stantabcorp.com/~thibault/46d34e1eccb244ceabd468f3d597e853-logo-rond-l.png"
        )

        await channel.send(embed=embed)

    def load_cogs(self, reloading: Optional[bool] = False):
        for file in os.listdir("cogs/"):
            try:
                if file.endswith(".py"):
                    if reloading:
                        self.reload_extension(f'cogs.{file[:-3]}')
                    else:
                        self.load_extension(f'cogs.{file[:-3]}')
                    logger.info(f"{file} loaded")
            except Exception:
                logger.exception(f"Fail to load {file}")

    async def on_ready(self):
        await self.change_presence(
            activity=None,
            status=discord.Status.online
        )
        logger.info("Licence ready")


if __name__ == "__main__":
    bot = Licence()
    bot.run(reconnect=True)

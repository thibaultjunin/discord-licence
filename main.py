import discord
from discord.ext import commands
from discord_slash import SlashCommand
import traceback
import logging
import sys
import os
from src.database import DB
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


class Licence(commands.AutoShardedBot, DB):
    def __init__(self, *args, **kwargs):
        intents = discord.Intents.default()
        intents.members = True

        super().__init__(
            activity=discord.Game(
                name="Starting..."
            ),
            status=discord.Status.dnd,
            command_prefix="uca",
            intents=intents
        )
        self.slash = SlashCommand(
            self,
            sync_commands=True,
            sync_on_cog_reload=True
        )
        super(DB, self).__init__()
        self.remove_command("help")
        self._color = 0x007fa3
        self._footer_text = "Licence Informatique@UCA"
        self._icon_url = "https://usercontent.stantabcorp.com/~thibault/46d34e1eccb244ceabd468f3d597e853-logo-rond-l.png"
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

    @property
    def color(self):
        return self._color

    async def on_member_join(self, member):
        if member.dm_channel is None:
            await member.create_dm()

        channel = member.dm_channel

        embed = discord.Embed(
            color=self.color,
            description="Bienvenue sur le discord **Licence Informatique@UCA** ce lieu a pour vocation d'être ta place de communication avec les autres étudiants et les professeurs durant ta licence.\n\nCe serveur est gérer par des étudiants et il se doit de rester un espace propre, pour cela, nous avons mis en places quelques règles que tu retrouveras dans <#743452204207439913>.\n\nN’oublie pas de choisir également un rôle pour avoir accès à tes cours dans <#748152325654446110>.\n\n**Un petit mot sur moi :** Mes créateurs, ne sont plus en licence et pour certains plus à l’université. C’est pour cela qu’ils ont besoin de toi afin que tu me maintiennes et que je continue à fonctionner pour tous les étudiants, je suis fait en Python et tu vas voir c’est simple, tout ce passe sur github : [https://github.com/thibaultjunin/discord-licence](https://github.com/thibaultjunin/discord-licence)\n**On compte sur toi !**",
            timestamp=dt.datetime.utcnow()
        )
        embed.set_author(
            name="Bienvenue sur le discord de la licence informatique à l'Université Côte d'Azur !",
            icon_url=self.icon_url
        )
        embed.set_thumbnail(url=self.icon_url)
        embed.set_footer(
            text=self.footer_text,
            icon_url=self.icon_url
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
        await self.init()
        await self.change_presence(
            activity=None,
            status=discord.Status.online
        )
        logger.info("Licence ready")

    @property
    def footer_text(self):
        return self._footer_text

    @property
    def icon_url(self):
        return self._icon_url

    async def on_command_error(self, ctx: commands.Context, error: commands.CommandError):
        # Log every errors in the on_command_error event
        logger.error(traceback.format_exception(type(error), error, error.__traceback__), exc_info=True)
        if isinstance(error, commands.CommandNotFound):
            return await ctx.send("Cette commande n'existe pas.")
            # Handling Command Not Found Errors

        # raise error
        embed = discord.Embed(
            title="Error",
            description=error,
            timestamp=dt.datetime.utcnow(),
            color=self.color
        )
        await ctx.send(embed=embed)

    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent):
        guild = await self.fetch_guild(payload.guild_id)
        user: discord.Member = await guild.fetch_member(payload.user_id)
        if user.bot:
            return

        if payload.emoji.is_custom_emoji():
            role_id = await self.get_role_id(guild.id, payload.emoji.id, payload.message_id)
        else:
            role_id = await self.get_role_id_by_emoji_name(guild.id, str(payload.emoji.name), payload.message_id)
        if role_id is None:
            logger.info(f"{user} a ajouté une réaction inconnu au message.")
            return
        role: discord.Role = guild.get_role(role_id)
        if role in user.roles:
            return
        await user.add_roles(role)
        logger.info(
            f"Le role {role.name} a été ajouté de l'utilisateur {user}")

    async def on_raw_reaction_remove(self, payload: discord.RawReactionActionEvent):
        guild = await self.fetch_guild(payload.guild_id)
        user: discord.Member = await guild.fetch_member(payload.user_id)
        if user.bot:
            return

        if payload.emoji.is_custom_emoji():
            role_id = await self.get_role_id(guild.id, payload.emoji.id, payload.message_id)
        else:
            role_id = await self.get_role_id_by_emoji_name(guild.id, str(payload.emoji.name), payload.message_id)
        if role_id is None:
            return
        role: discord.Role = guild.get_role(role_id)

        await user.remove_roles(role)
        logger.info(
            f"Le role {role.name} a été supprimé de l'utilisateur {user}")


if __name__ == "__main__":
    bot = Licence()
    bot.run(reconnect=True)

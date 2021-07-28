from discord.ext import commands

import src.commands as botCommands


class Commands(commands.Cog):
    r"""
    Parameters
    ----------
    :bot: The bot object
    """
    __slots__ = ("bot")

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="cours")
    async def _lessons(self, ctx: commands.Context, year: str, title: str):
        await botCommands.addChannelGroup(self.bot, ctx, year, title)


    @commands.command(name="embed")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _embed(self, ctx: commands.Context, *, embed_title: str):
        await botCommands.embed_command(self.bot, ctx, embed_title)

def setup(bot):
    bot.add_cog(Commands(bot))
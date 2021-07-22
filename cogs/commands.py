from discord.ext import commands

import src.commands as botCommands


class Commands(commands.Cog):
    __slots__ = ("bot")

    def __init__(self, bot):
        self.bot = bot

    @commands.command(name="cours")
    async def _lessons(self, ctx: commands.Context, year: str, title: str):
        await botCommands.addChannelGroup(self.bot, ctx, year, title)

def setup(bot):
    bot.add_cog(Commands(bot))
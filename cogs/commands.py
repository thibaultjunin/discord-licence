import discord
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

    @commands.command(name="reactrole")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _react_role(self, ctx: commands.Context, channel: discord.TextChannel, message_id: str, role: discord.Role):
        await botCommands.react_role_command(self.bot, ctx, channel, int(message_id), role)

    @commands.command(name="test")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _test(self, ctx, message_id):
        await ctx.send(await self.bot.get_guild_id(message_id))

    # @commands.command(name="addreact")
    # @commands.has_permissions(administrator=True)
    # @commands.guild_only()
    # async def _add_react(self, ctx: commands.Context,

def setup(bot):
    bot.add_cog(Commands(bot))
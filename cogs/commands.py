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

    @commands.command(name="embed_update")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _embed_update(self, ctx: commands.Context, update_type, channel: discord.TextChannel, message_id: str, *, content: str):
        await botCommands.embed_update_command(self.bot, ctx, update_type, channel, int(message_id), content)

    @commands.command(name="react_role")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _react_role(self, ctx: commands.Context, channel: discord.TextChannel, message_id: str, role: discord.Role, *, role_description: str):
        await botCommands.react_role_command(self.bot, ctx, channel, int(message_id), role, role_description)

    @commands.command(name="remove_react")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _remove_react_role(self, ctx: commands.Context, channel: discord.TextChannel, message_id: str, emoji: str):
        await botCommands.remove_react_role_command(self.bot, ctx, channel, int(message_id), emoji)

    @commands.command(name="remove_embed")
    @commands.has_permissions(administrator=True)
    @commands.guild_only()
    async def _remove_embed(self, ctx: commands.Context, channel: discord.TextChannel, message_id: str):
        await botCommands.remove_embed_command(self.bot, ctx, channel, int(message_id))


def setup(bot):
    bot.add_cog(Commands(bot))

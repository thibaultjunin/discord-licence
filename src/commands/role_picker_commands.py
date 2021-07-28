from datetime import timedelta
from typing import Union
import discord

from discord.ext import commands
from main import Licence
from discord_slash import SlashContext

import asyncio


async def embed_command(bot: Licence, ctx: Union[SlashContext, commands.Context], embed_title: str):
    r"""
    Parameters
    ----------
    bot :Licence
        The bot's licence.
    ctx :Union[SlashContext, commands.Context]
        The context in which the command was used.

    Raises
    ------
    TypeError
        If `ctx` is not a :class:`SlashContext` or :class:`Context`.
    """
    if not isinstance(ctx, (SlashContext, commands.Context)):
        raise TypeError(
            f"Expected a {SlashContext.__name__} or {commands.Context.__name__}, got {type(ctx)}.")

    example_embed = discord.Embed(
        description=":red_circle: Rouge\n:green_circle: Vert\n:orange_circle: Orange\n",
        color=discord.Colour.green()
    )
    example_embed.set_author(
        name="Titre exemple embed",
        icon_url=bot.user.avatar_url
    )
    example_embed.set_footer(
        text="Université Côte d'Azur",
        icon_url=bot.user.avatar_url
    )
    message = await ctx.send("Vous pouvez désormais écrire la déscription de l'embed par exemple : ", embed=example_embed)

    try:
        description = await bot.wait_for("message", check=lambda m: m.author == ctx.author and m.channel == ctx.channel, timeout=600)
    except asyncio.TimeoutError:
        await message.delete()
    embed = discord.Embed(
        description=description.content,
        color=bot.color
    )
    embed.set_author(
        name=embed_title,
        icon_url=bot.user.avatar_url
    )
    embed.set_footer(
        text="Université Côte d'Azur",
        icon_url=bot.user.avatar_url
    )

    await ctx.send(embed=embed)

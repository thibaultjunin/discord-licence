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
    `bot` :Licence
        The bot's licence.
    `ctx` :Union[SlashContext, commands.Context]
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


class EmbedNotFoundException(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)


class MessageNotFoundException(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)


async def react_role_command(bot: Licence, ctx: Union[SlashContext, commands.Context], channel: discord.TextChannel, message_id: int, role: discord.Role):
    r"""
    Parameters
    ----------
    `bot` :Licence
        The bot's licence.
    `ctx` :Union[SlashContext, commands.Context]
        The context in which the command was used.
    `channel` : discord.TextChannel
        The channel where the message is in.
    `message_id` : str
        The message id.
    `role` : discord.Role
        The discord role that the reaction will add to the user.

    Raises
    ------
    TypeError
        If `ctx` is not a :class:`SlashContext` or :class:`Context`.
    EmbedNotFoundException
        If embed is not found in the message.
    MessageNotFoundException
        If specified message is not found in the channel.
    """
    if not isinstance(ctx, (SlashContext, commands.Context)):
        raise TypeError(
            f"Expected a {SlashContext.__name__} or {commands.Context.__name__}, got {type(ctx)}.")

    # message: discord.Message = await channel.fetch_message(int(message_id))
    # embeds = message.embeds
    # if len(embeds):
    #     embed = embeds[0]
    # else:
    #     embed = None

    # if embed is None:
    #     raise EmbedNotFound("L'embed n'a pas pu être retrouvé")

    message_specified: discord.Message = None
    async for message in channel.history(limit=200):
        if message.id == message_id:
            message_specified = message
            break
    if message_specified is None:
        raise MessageNotFoundException("Le message n'a pas pu être retrouvé")
    await ctx.send(f"DEBUG : {message_specified.id} is linked to the role {role.name}")

    try:
        message_wait_reaction = await ctx.send("Ajoutez la réaction à ce message pour le rôle à laquelle vous voulez qu'il corresponde")

        def check(reaction, user):
            return reaction.message.id == message_wait_reaction.id and user == ctx.author
        reaction, user = await bot.wait_for("reaction_add", check=check, timeout=600)
        print(reaction, reaction.custom_emoji)

        if reaction in message_specified.reactions:
            return await ctx.send("Cette réaction à déjà été ajouté au message")
        await bot.insert_role(ctx.guild.id, message_specified.id, channel.id, reaction, role.id)
        await message_specified.add_reaction(reaction)
    except asyncio.TimeoutError:
        await message_wait_reaction.delete()
        await ctx.message.delete()

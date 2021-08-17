from typing import Union
import discord
import datetime as dt
from discord.ext import commands

from main import Licence
from discord_slash import SlashContext

import asyncio
import src.util as util
from src.errors import EmbedNotFoundException



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

    embed = discord.Embed(
        description="En attente d'ajout de réactions avec la commande\n`ucareactrole <#channel> <message_id> <@role> <role_description>` ...",
        color=bot.color,
        timestamp=dt.datetime.utcnow()
    )
    embed.set_author(
        name=embed_title,
        icon_url=bot.icon_url
    )
    embed.set_footer(
        text=bot.footer_text,
        icon_url=bot.icon_url
    )

    await ctx.send(embed=embed)


async def embed_update_command(bot: Licence, ctx: Union[SlashContext, commands.Context], update_type: str, channel: discord.TextChannel, message_id: int, content: str):
    message: discord.Message = await channel.fetch_message(message_id)
    embed = util.get_embed(message)
    print(embed.author.name)

    if update_type == "title":
        embed.set_author(
            name=content,
            icon_url=bot.icon_url
        )
    elif update_type == "description":
        embed.description = content
    elif update_type == "footer":
        embed.footer = content
        embed.set_footer(
            text=content,
            icon_url=bot.icon_url
        )
    else:
        return await ctx.send("Rien n'a changé")

    print(embed.author.name)
    await message.edit(embed=embed)


async def react_role_command(bot: Licence, ctx: Union[SlashContext, commands.Context], channel: discord.TextChannel, message_id: int, role: discord.Role, role_description: str):
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
        If the message is not found.
    """
    if not isinstance(ctx, (SlashContext, commands.Context)):
        raise TypeError(
            f"Expected a {SlashContext.__name__} or {commands.Context.__name__}, got {type(ctx)}.")

    message_specified: discord.Message = await channel.fetch_message(message_id)
    embeds = message_specified.embeds
    if len(embeds):
        embed = embeds[0]
    else:
        embed = None

    if embed is None:
        raise EmbedNotFoundException("L'embed n'a pas pu être retrouvé")

    try:
        message_wait_reaction = await ctx.send("Ajoutez la réaction voulut sous ce message, vous avez 10 minutes pour y réagir.")

        def check(reaction, user):
            return reaction.message.id == message_wait_reaction.id and user == ctx.author
        reaction, user = await bot.wait_for("reaction_add", check=check, timeout=600)

        if reaction in message_specified.reactions:
            return await ctx.send("Cette réaction à déjà été ajouté au message")
        await bot.insert_role(ctx.guild.id, message_specified.id, channel.id, reaction, role.id)
        if embed.description.startswith("En attente"):
            embed.description = f"{reaction} - {role_description}"
        else:
            embed.description = f"{embed.description}\n{reaction} - {role_description}"
        await message_specified.edit(embed=embed)
        await message_specified.add_reaction(reaction)
    except asyncio.TimeoutError:
        pass  # cooldown finished
    finally:
        await message_wait_reaction.delete()
        await ctx.message.delete()


async def remove_react_role_command(bot: Licence, ctx: Union[SlashContext, commands.Context], channel: discord.TextChannel, message_id: int, emoji: str):
    r"""

    """
    if not isinstance(ctx, (SlashContext, commands.Context)):
        raise TypeError(
            f"Expected a {SlashContext.__name__} or {commands.Context.__name__}, got {type(ctx)}.")

    message_specified: discord.Message = await channel.fetch_message(message_id)


    print(message_specified.reactions)

    reaction = await util.remove_role_from_reaction(bot, ctx, message_specified, channel, emoji)
    print("la1")
    await bot.delete_role(ctx.guild.id, message_specified.id, channel.id, reaction)

    print(ctx.guild.id, message_specified.id, channel.id, reaction, "la2")


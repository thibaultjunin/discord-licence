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
    description = "Message id : `{0}`\n\nEn attente d'ajout de réactions avec la commande\n`ucareact_role #{1} {0} @role Description` <a:loading:880061819002171432>"
    embed = discord.Embed(
        description=description,
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

    message = await ctx.send(embed=embed)
    description = description.format(message.id, message.channel)
    embed.description = description
    await message.edit(embed=embed)
    await ctx.message.delete()


async def embed_update_command(bot: Licence, ctx: Union[SlashContext, commands.Context], update_type: str, channel: discord.TextChannel, message_id: int, content: str):
    r"""
    Parameters
    ----------
    `bot` :Licence
        The bot's licence.
    `ctx` :Union[SlashContext, commands.Context]
        The context in which the command was used.
    `update_type` : str
        The type of update.
    `channel` : discord.TextChannel
        The channel where the message is in.
    `message_id` : str
        The message id.
    `content` : str
        The content of the message.
    """
    message: discord.Message = await channel.fetch_message(message_id)
    embed = util.get_embed(message)

    if update_type == "title":
        embed.set_author(
            name=content,
            icon_url=bot.icon_url
        )
    elif update_type == "description":
        embed.description = content
    elif update_type == "footer":
        embed.set_footer(
            text=content,
            icon_url=bot.icon_url
        )
    else:
        return await ctx.send("Rien n'a changé")

    await message.edit(embed=embed)
    await ctx.message.delete()


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

    embed = util.get_embed(message_specified)

    try:
        message_wait_reaction = await ctx.send("Ajoutez la réaction voulue sous ce message, vous avez 10 minutes pour y réagir.")

        def check(reaction, user):
            return reaction.message.id == message_wait_reaction.id and user == ctx.author
        reaction, user = await bot.wait_for("reaction_add", check=check, timeout=600)

        if reaction in message_specified.reactions:
            return await ctx.send("Cette réaction à déjà été ajouté au message")
        await bot.insert_role(ctx.guild.id, message_specified.id, channel.id, reaction, role.id)
        if not isinstance(discord.Embed.Empty, type(embed.description)) and embed.description.startswith("Message id :"):
            embed.description = f"{reaction} - {role_description}"
        elif not isinstance(discord.Embed.Empty, type(embed.description)):
            embed.description = f"{embed.description}\n{reaction} - {role_description}"
        else:
            embed.description = f"{reaction} - {role_description}"
        await message_specified.edit(embed=embed)
        await message_specified.add_reaction(reaction)
    except asyncio.TimeoutError:
        pass  # cooldown finished
    finally:
        await message_wait_reaction.delete()
        await ctx.message.delete()


async def remove_react_role_command(bot: Licence, ctx: Union[SlashContext, commands.Context], channel: discord.TextChannel, message_id: int, emoji: str):
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
    `emoji` : str
        The emoji that will be removed from the message.
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

    reaction = await util.remove_role_from_reaction(bot, ctx, message_specified, message_id, emoji)
    await bot.delete_role(ctx.guild.id, message_specified.id, channel.id, reaction)

    embed = util.get_embed(message_specified)
    splited_description = embed.description.split("\n")
    new_description = ""
    if len(splited_description) > 1:
        for d in splited_description:
            if d.startswith(str(reaction)):
                continue
            new_description += d + "\n"
        embed.description = new_description if len(
            new_description) else embed.description
    else:
        embed.description = ""

    await message_specified.edit(embed=embed)
    await ctx.message.delete()


async def remove_embed_command(bot: Licence, ctx: Union[SlashContext, commands.Context], channel: discord.TextChannel, message_id: int):
    r"""
    Parameters
    ----------
    `bot` :Licence
        The bot's licence.
    `ctx` :Union[SlashContext, commands.Context]
        The context in which the command was used.
    `message_id` : str
        The message id.
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

    for reaction in message_specified.reactions:
        await util.remove_role_from_reaction(bot, ctx, message_specified, message_id, str(reaction))

    await bot.delete_message(message_specified.guild.id, message_id)
    await message_specified.delete()
    await ctx.message.delete()

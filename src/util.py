import logging

from discord.ext import commands
from main import Licence
import discord
from src.errors import EmbedNotFoundException

logger = logging.getLogger("licence")


def get_embed(message: discord.Message):
    embeds = message.embeds
    embed = None
    if len(embeds):
        embed = embeds[0]

    if embed is None:
        raise EmbedNotFoundException("L'embed n'a pas pu être retrouvé")
    return embed


async def remove_role_from_reaction(bot: Licence, ctx: commands.Context, message: discord.Message, message_id: int, emoji: str):
    for reaction in message.reactions:
        print(reaction.custom_emoji, str(reaction) == emoji)
        if str(reaction) == emoji:
            if reaction.custom_emoji:
                role_id = await bot.get_role_id(ctx.guild.id, reaction.emoji.id, message_id)
            else:
                role_id = await bot.get_role_id_by_emoji_name(ctx.guild.id, str(reaction), message_id)

            reactors = await reaction.users().flatten()
            await message.clear_reaction(reaction)
            role: discord.Role = ctx.guild.get_role(role_id)

            for reactor in reactors:
                await reactor.remove_roles(role)
            logger.info(
                f"{role.name} a été enlevé à {len(reactors)} utilisateurs.")
            return reaction

    logger.info("Aucun rôle n'a été enlevé")
    return None

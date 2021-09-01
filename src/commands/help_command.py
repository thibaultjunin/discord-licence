from main import Licence
from typing import Union
from discord.ext import commands
import discord
from discord_slash.context import SlashContext
import datetime as dt


async def help_command(bot: Licence, ctx: Union[SlashContext, commands.Context]):
    r"""
    The help command.
    Parameters:
    bot: The bot object.
    ctx: The context from which the help command was called.
    Raises:
    TypeError: If the context is not a SlashContext or a Context.
    """
    if not isinstance(ctx, (SlashContext, commands.Context)):
        raise TypeError(
            f"Expected a {SlashContext.__name__} or {commands.Context.__name__}, got {type(ctx)}.")
    embed = discord.Embed(
        description=f"Prefix : `{ctx.prefix}`\nN'oubliez pas d'enlever les \"<\" ou \">\"",
        color=bot.color,
        timestamp=dt.datetime.utcnow()
    )
    embed.set_author(name="Aide pour les commandes", icon_url=bot.icon_url)
    embed.set_footer(text=bot.footer_text, icon_url=bot.icon_url)
    embed.add_field(name=f"`{ctx.prefix}embed <titre>`",
                    value=f"Créer un embed dans le channel courant", inline=False)
    embed.add_field(name=f"`{ctx.prefix}embed_update <title | description | footer> #channel message_id <Nouvelle description>`",
                    value=f"Permet d'éditer un embed précedemment envoyé.", inline=False)
    embed.add_field(name=f"`{ctx.prefix}react_role #channel message_id @role Description`",
                    value=f"Permet d'ajouter des rôles à selectionner avec les réactions.", inline=False)
    embed.add_field(name=f"`{ctx.prefix}remove_react #channel message_id emoji`",
                    value=f"Enlève la réaction et le rôle correspondant à l'emoji de l'embed.", inline=False)
    embed.add_field(name=f"`{ctx.prefix}remove_embed #channel message_id`",
                    value=f"Supprime complétement un embed du bot.", inline=False)
    # embed.add_field(name=f"`{ctx.prefix}embed <titre>`", value=f"Créer un embed dans le channel courant", inline=False)

    await ctx.send(embed=embed)

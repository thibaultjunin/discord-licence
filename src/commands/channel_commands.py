import discord
from discord.ext import commands
from discord_slash.context import SlashContext

from typing import Union

from main import Licence

"""
Add a new group of channel.
- A category called: "year - title"
-- A text channel called "title"
-- A voice channel called "general"
-- An announcement channel called "annonces-title"
"""


async def addChannelGroup(bot: Licence, ctx: Union[SlashContext, commands.Context], year, title):
    guild = ctx.guild

    # Testing if a category already exists with the same name
    for channel in guild.channels:
        if isinstance(channel, discord.CategoryChannel):
            if channel.name == f"{year} - {title}":
                await ctx.send("Une catégorie existe déjà avec le même nom...")
                return

    # Adding a new role
    role = await guild.create_role(
        name=f"{year} - {title}",
        reason="Ajout d'un nouveau cours.",
        mentionable=True
    )

    # Adding a new category
    category = await guild.create_category(
        f"{year} - {title}",
        overwrites={
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            role: discord.PermissionOverwrite(view_channel=False),
        },
        reason="Ajout d'un nouveau cours."
    )

    # Adding a new announcement channel
    news = await guild.create_text_channel(
        f"annonces-{title}",
        overwrites={
            guild.default_role: discord.PermissionOverwrite(view_channel=False),
            role: discord.PermissionOverwrite(view_channel=False),
        },
        reason="Ajout d'un nouveau cours.",
        category=category,
    )

    await news.edit(
        type=discord.ChannelType.news
    )

    await ctx.send("Et voilà! Nouveau cours ajouté.")

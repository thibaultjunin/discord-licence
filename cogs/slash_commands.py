from discord.ext import commands
from discord_slash import SlashContext, cog_ext, manage_commands

from main import Licence
import src.commands as botCommands


class SlashCommands(commands.Cog):
    __slots__ = ("bot")

    def __init__(self, bot: Licence):
        self.bot: Licence = bot

    @cog_ext.cog_slash(
        name="cours",
        description="Ajoute un nouveau cours (Groupe d'un salon annonce, textuel et vocal)",
        options=[
            manage_commands.create_option(
                name="year",
                description="Quelle est l'année de ce cours?",
                option_type=3,
                required=True,
                choices=[
                    manage_commands.create_choice(
                        name="Licence 1",
                        value="L1"
                    ),
                    manage_commands.create_choice(
                        name="Licence 2",
                        value="L2"
                    ),
                    manage_commands.create_choice(
                        name="Licence 3",
                        value="L3"
                    ),
                ]
            ),
            manage_commands.create_option(
                name="title",
                description="Nom du cours",
                option_type=3,
                required=True
            )
        ]
    )
    async def _lessons(self, ctx: SlashContext, year, title):
        await botCommands.addChannelGroup(self.bot, ctx, year, title)

    @cog_ext.cog_slash(
        name="embed",
        description="Créer un embed pour le rôle picker.",
        options=[
            manage_commands.create_option(
                name="title",
                description="Veuillez choisir le titre de l'embed.",
                option_type=3,
                required=True,
                choices=[
                    manage_commands.create_choice(
                        name="Licence 1",
                        value="L1"
                    ),
                    manage_commands.create_choice(
                        name="Licence 2",
                        value="L2"
                    ),
                    manage_commands.create_choice(
                        name="Licence 3",
                        value="L3"
                    ),
                    manage_commands.create_choice(
                        name="Master 1",
                        value="M1"
                    ),
                    manage_commands.create_choice(
                        name="Master 2",
                        value="M2"
                    ),
                ]
            ),
            manage_commands.create_option(
                name="titre",
                description="Nom de l'embed",
                option_type=3,
                required=True
            )
        ]
    )
    async def _embed(self, ctx: SlashContext, embed_title: str):
        await botCommands.embed_command(self.bot, ctx, embed_title)


def setup(bot):
    bot.add_cog(SlashCommands(bot))

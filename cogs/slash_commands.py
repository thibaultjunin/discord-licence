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
        guild_ids=[747824621486866612],
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


def setup(bot):
    bot.add_cog(SlashCommands(bot))

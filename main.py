import discord
from discord.ext import commands
from discord_slash import SlashCommand

import logging
import sys
import os
from src.constants import BOT
from typing import Optional

logger = logging.getLogger("licence")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(
    filename='licence.log',
    encoding='utf-8',
    mode='w'
)
handler.setFormatter(logging.Formatter(
    '%(asctime)s:%(levelname)s:%(name)s: %(message)s'
)
)
logger.addHandler(handler)


class Licence(commands.AutoShardedBot):
    def __init__(self, *args, **kwargs):
        super().__init__(
            activity=discord.Game(
                name="Starting..."
            ),
            status=discord.Status.dnd,
            command_prefix="♫"
        )
        self.slash = SlashCommand(
            self,
            sync_commands=True,
            sync_on_cog_reload=True
        )
        self.load_cogs()

    def _exit(self):
        try:
            self.loop.run_until_complete(self._close())
            logger.info("Pool closed")
        except Exception as e:
            logger.exception(e, exc_info=True)
            sys.exit(1)
        finally:
            logger.info("Licence has been shutted down")
            sys.exit(0)

    def run(self, *args, **kwargs):
        try:
            super().run(BOT, *args, **kwargs)
        except KeyboardInterrupt:
            self._exit()

    def load_cogs(self, reloading: Optional[bool] = False):
        for file in os.listdir("cogs/"):
            try:
                if file.endswith(".py"):
                    if reloading:
                        self.reload_extension(f'cogs.{file[:-3]}')
                    else:
                        self.load_extension(f'cogs.{file[:-3]}')
                    logger.info(f"{file} loaded")
            except Exception:
                logger.exception(f"Fail to load {file}")

    async def on_ready(self):
        await self.change_presence(
            activity=None,
            status=discord.Status.online
        )
        logger.info("Licence ready")


if __name__ == "__main__":
    bot = Licence()
    bot.run(reconnect=True)

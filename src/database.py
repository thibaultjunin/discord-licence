import asyncio
import logging
import discord
import sqlalchemy as sa

from aiomysql.sa import create_engine
from src.constants import DB_HOST, DB_TABLE, DB_USER, DB_PASSWORD, DB_PORT

metadata = sa.MetaData()

logger = logging.getLogger("licence")


class DB:
    def __init__(self, loop):
        self.engine = None
        self.loop = loop or asyncio.get_event_loop()

    async def init(self):
        """
        Init engine and table
        """
        try:
            self.rpicker_tbl = sa.Table(DB_TABLE, metadata,
                                        sa.Column('guild_id', sa.BIGINT),
                                        sa.Column('message_id', sa.BIGINT),
                                        sa.Column('channel_id', sa.BIGINT),
                                        sa.Column('reaction_id',
                                                  sa.BIGINT, nullable=True),
                                        sa.Column('role_id', sa.BIGINT),
                                        sa.Column(
                                            'is_custom_emoji', sa.BOOLEAN),
                                        sa.Column('emoji', sa.VARCHAR(
                                            255), nullable=True),
                                        sa.Column('created_at', sa.DATETIME),)
            self.engine = await create_engine(user=DB_USER,
                                              db=DB_USER,
                                              host=DB_HOST,
                                              password=DB_PASSWORD,
                                              port=DB_PORT,
                                              loop=self.loop,
                                              autocommit=True
                                              )
            if self.engine is not None:
                logger.info(f"Database engine created: {self.engine}")
        except Exception as e:
            logger.exception(e, exc_info=True)

    async def get_guild_id(self, message_id):
        async with self.engine.acquire() as conn:
            result = await conn.execute(self.rpicker_tbl.select().where(self.rpicker_tbl.c.message_id == message_id))
            row = await result.fetchone()
            return row['guild_id']

    async def get_channel_id(self, message_id):
        async with self.engine.acquire() as conn:
            result = await conn.execute(self.rpicker_tbl.select().where(self.rpicker_tbl.c.message_id == message_id))
            row = await result.fetchone()
            return row['channel_id']

    async def get_message_id(self, guild_id, channel_id):
        async with self.engine.acquire() as conn:
            result = await conn.execute(self.rpicker_tbl.select().where(self.rpicker_tbl.c.guild_id == guild_id).where(self.rpicker_tbl.c.channel_id == channel_id))
            row = await result.fetchone()
            return row['message_id']

    async def get_role_id(self, guild_id, reaction_id, message_id):
        async with self.engine.acquire() as conn:
            result = await conn.execute(self.rpicker_tbl.select().
                                        where(sa.and_
                                              (self.rpicker_tbl.c.guild_id == guild_id,
                                               self.rpicker_tbl.c.reaction_id == reaction_id,
                                               self.rpicker_tbl.c.message_id == message_id)))
            row = await result.fetchone()
            return row['role_id']

    async def get_role_id_by_emoji_name(self, guild_id, emoji, message_id):
        async with self.engine.acquire() as conn:
            result = await conn.execute(self.rpicker_tbl.select().
                                        where(sa.and_
                                              (self.rpicker_tbl.c.guild_id == guild_id,
                                               self.rpicker_tbl.c.emoji == emoji,
                                               self.rpicker_tbl.c.message_id == message_id)))
            row = await result.fetchone()
            return row['role_id']

    async def insert_role(self, guild_id, message_id, channel_id, reaction: discord.Reaction, role_id):
        async with self.engine.acquire() as conn:
            reaction_id = None if not reaction.custom_emoji else reaction.emoji.id
            await conn.execute(self.rpicker_tbl.insert().values(
                guild_id=guild_id,
                message_id=message_id,
                channel_id=channel_id,
                reaction_id=reaction_id,
                role_id=role_id,
                is_custom_emoji=reaction.custom_emoji,
                emoji=str(reaction)
            ))

    async def delete_role(self, guild_id, message_id, channel_id, reaction: discord.Reaction):
        async with self.engine.acquire() as conn:
            await conn.execute(self.rpicker_tbl.delete().where(sa.and_(
                self.rpicker_tbl.c.guild_id == guild_id,
                self.rpicker_tbl.c.message_id == message_id,
                self.rpicker_tbl.c.channel_id == channel_id,
                self.rpicker_tbl.c.emoji == str(reaction)
            )))

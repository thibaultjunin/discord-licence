#!/bin/bash

sudo docker ps -a -q  --filter ancestor=discord-licence
sudo docker rmi discord-licence --force && sudo docker-compose build && sudo docker-compose up -d --force-recreate
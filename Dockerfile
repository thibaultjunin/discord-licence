FROM python:3.9-slim

WORKDIR /app
RUN apt-get update
RUN apt install make
COPY . .
RUN make install

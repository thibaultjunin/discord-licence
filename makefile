CC=python3.9

all:
	$(CC) main.py
install:
	$(CC) -m pip install -r requirements.txt
upgrade:
	$(CC) -m pip install --upgrade pip && \
	$(CC) -m pip install -r requirements.txt --upgrade
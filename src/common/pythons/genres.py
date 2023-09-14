import requests
import os
from bs4 import BeautifulSoup
import psycopg2
from slugify import slugify

conn = psycopg2.connect(
    database=os.environ.get('DATABASE_NAME'), 
    user=os.environ.get('DATABASE_USERNAME'), 
    password=os.environ.get('DATABASE_PASSWORD'), 
    host=os.environ.get('DATABASE_HOST'), 
    port=os.environ.get('DATABASE_PORT')
)

cursor = conn.cursor()

def insertGere(cursor, value_genre, value_slug):
    postgres_insert_query = """ INSERT INTO public."genres" (genre, slug) VALUES ('{genre}', '{slug}')""".format(
        genre=value_genre, slug=value_slug)
    cursor.execute(postgres_insert_query)
    conn.commit()

def layThongTinGenre():
    response = requests.get('https://truyentranhlh.net/')
    genres = BeautifulSoup(response.content, "html.parser")
    temp = genres.find_all('a', class_='dropdown-item genres-item')
    for ele in temp:
        genre = ele.text
        slug = slugify(genre)
        insertGere(cursor, str(genre), slug)

layThongTinGenre()

conn.commit()
conn.close()

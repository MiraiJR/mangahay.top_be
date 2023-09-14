import requests
from bs4 import BeautifulSoup
import psycopg2
from slugify import slugify
import time
import os

conn = psycopg2.connect(
    database=os.environ.get('DATABASE_NAME'), 
    user=os.environ.get('DATABASE_USERNAME'), 
    password=os.environ.get('DATABASE_PASSWORD'), 
    host=os.environ.get('DATABASE_HOST'), 
    port=os.environ.get('DATABASE_PORT')
)

cursor = conn.cursor()

def layThongTinChapter(link, idComic):
    response = requests.get(link)
    chapter = BeautifulSoup(response.content, "html.parser")
    try:
        name = chapter.find('li', class_='active').findChildren(
            'a')[0].text.strip()
        
        check_existed_chapter = kiemTraChapterDaTonTaiChua(cursor, idComic, name)

        if check_existed_chapter == False:
            images = []
            for ele in chapter.find('div', id='chapter-content').findChildren('img', recursive=False):
                if ele.has_attr('data-src'):
                    images.append(ele.attrs['data-src'])
            slug = slugify(name)

            print(idComic, name)

            record_to_insert_chapter = (str(name), images, slug, int(idComic))
            insertChapter(cursor, record_to_insert_chapter)
            updateDateUpdateForComic(cursor, idComic)
        else:
            return False
    except:
        return False


def kiemTraChapterDaTonTaiChua(cursor, id_comic, name_chapter):
    query = """ SELECT * FROM public."chapter" where id_comic = %s and name = %s """
    record = (int(id_comic), str(name_chapter))
    cursor.execute(query, record)

    result = cursor.fetchall()

    return False if len(result) == 0 else True


def capNhatChapter(link, id_comic):
    response = requests.get(link)
    comic = BeautifulSoup(response.content, "html.parser")

    link_chapters = []
    if (comic.find('ul', class_='list-chapters at-series')) is not None:
        array_temp_at_series = []
        for ele in comic.find('ul', class_='list-chapters at-series'):
            array_temp_at_series.append(ele)
        if(len(array_temp_at_series) != 0):
            for ele in array_temp_at_series[::-1]:
                link_chapters.append(ele.attrs['href'])
            for chapter in link_chapters:
                if layThongTinChapter(chapter, id_comic) == False:
                    break


def updateDateUpdateForComic(cursor, id_comic):
    query = """ UPDATE public."comic" SET "updatedAt" = '{date}' WHERE id = {id_comic}""".format(
        date=time.strftime('%Y-%m-%d %H:%M:%S'), id_comic=id_comic)
    cursor.execute(query)

    conn.commit()

def insertChapter(cursor, record_to_insert_chapter):
    postgres_insert_query = """ INSERT INTO public."chapter" (name, images, slug, id_comic) VALUES (%s,%s,%s, %s)"""
    cursor.execute(postgres_insert_query, record_to_insert_chapter)
    conn.commit()

def capNhatChapterChoTruyen(cursor):
    query = """ SELECT * FROM public."comic" """
    cursor.execute(query)

    result = cursor.fetchall()

    for x in result:
        link = "https://truyentranhlh.net/truyen-tranh/" + x[1]
        print(x[2] + ' ===========> đang cập nhật')
        capNhatChapter(link, x[0])


capNhatChapterChoTruyen(cursor)

conn.commit()
conn.close()

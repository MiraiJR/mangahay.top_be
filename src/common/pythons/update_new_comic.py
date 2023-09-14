import requests
from bs4 import BeautifulSoup
import psycopg2
from slugify import slugify
import os

conn = psycopg2.connect(
    database=os.environ.get('DATABASE_NAME'), 
    user=os.environ.get('DATABASE_USERNAME'), 
    password=os.environ.get('DATABASE_PASSWORD'), 
    host=os.environ.get('DATABASE_HOST'), 
    port=os.environ.get('DATABASE_PORT')
)

cursor = conn.cursor()

def getListLinkComic():
    origin_url = 'https://truyentranhlh.net/danh-sach?sort=update&page='
    array_page = []
    link_comics = []
    for i in range(6, 0, -1):
        array_page.append(origin_url + str(i))

    for page in array_page:
        response = requests.get(page)
        soup = BeautifulSoup(response.content, "html.parser")
        comics = soup.findAll('div', class_='thumb-wrapper')
        for ele in comics:
            link = ele.findChildren('a',  recursive=False)[0]
            link_comics.append(link.attrs['href'])
    return link_comics


def layThongComic(link):
    response = requests.get(link)
    comic = BeautifulSoup(response.content, "html.parser")
    try:
        slug = link.split('/')[-1]

        check_existed_comic = kiemTraComicDaTonTaiChua(cursor, slug)

        if check_existed_comic == False:
            link_image = comic.find(
                'div', class_='content img-in-ratio').attrs['style']
            link_image = link_image.split('\'')[1]
            name = comic.find('span', class_='series-name').findChildren('a',
                                                                         recursive=False)[0].text.strip()
            print("Tên: ", name, " =======> đã được thêm vào.")
            another_name = comic.find('span', class_='info-value').text.strip()
            genres = []
            for genre in comic.findAll('span', class_='badge badge-info bg-lhmanga mx-1'):
                genres.append(genre.text.strip())
            authors = []
            state = comic.findAll('span', class_='info-value')[-1].text.strip()
            brief_desc = comic.find(
                'div', class_='summary-content')
            for ele in comic.findAll('div', class_='info-item'):
                if (ele.findChildren('span', class_='info-name')[0].text == 'Tác giả:'):
                    for child in ele.findChildren('span', class_='info-value'):
                        authors.append(child.findChildren('a')[0].text.strip())
            record_to_insert = (str(name), str(another_name), genres, authors, str(
                state), str(link_image), str(brief_desc), str(slug))
            id = insertComic(cursor, record_to_insert)
            conn.commit()
            link_chapters = []
            if (comic.find('ul', class_='list-chapters at-series')) is not None:
                array_temp_at_series = []
                for ele in comic.find('ul', class_='list-chapters at-series'):
                    array_temp_at_series.append(ele)
                if (len(array_temp_at_series) != 0):
                    for ele in array_temp_at_series[::-1]:
                        link_chapters.append(ele.attrs['href'])
                    for chapter in link_chapters:
                        layThongTinChapter(chapter, id)
    except:
        pass


def layIdComic(cursor, slug):
    query = """ SELECT id FROM public."comic" WHERE slug = '{slug_comic}' """.format(
        slug_comic=slug)
    cursor.execute(query)

    result = cursor.fetchone()
    return result[0]


def layThongTinChapter(link, idComic):
    response = requests.get(link)
    chapter = BeautifulSoup(response.content, "html.parser")
    try:
        name = chapter.find('li', class_='active').findChildren(
            'a')[0].text.strip()
        images = []
        for ele in chapter.find('div', id='chapter-content').findChildren('img', recursive=False):
            if ele.has_attr('data-src'):
                images.append(ele.attrs['data-src'])
        slug = slugify(name)

        record_to_insert_chapter = (str(name), images, slug, int(idComic))
        insertChapter(cursor, record_to_insert_chapter)
        return True
    except:
        return False


def layThongTin():
    link_comics = getListLinkComic()

    for link_ in link_comics:
        layThongComic(link_)


def kiemTraComicDaTonTaiChua(cursor, slug):
    query = """ SELECT * FROM public."comic" WHERE slug = '{slug_comic}' """.format(
        slug_comic=slug)

    cursor.execute(query)

    result = cursor.fetchall()

    return False if len(result) == 0 else True


def insertComic(cursor, record_to_insert):
    postgres_insert_query = """ INSERT INTO public."comic" (name, another_name, genres, authors, state, thumb, brief_desc, slug) VALUES (%s,%s,%s, %s,%s,%s, %s,%s) RETURNING id"""
    cursor.execute(postgres_insert_query, record_to_insert)
    id = cursor.fetchone()[0]
    conn.commit()
    return id


def insertChapter(cursor, record_to_insert_chapter):
    postgres_insert_query = """ INSERT INTO public."chapter" (name, images, slug, id_comic) VALUES (%s,%s,%s, %s)"""
    cursor.execute(postgres_insert_query, record_to_insert_chapter)
    conn.commit()


layThongTin()

conn.commit()
conn.close()

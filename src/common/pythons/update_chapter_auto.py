import requests
from bs4 import BeautifulSoup
import psycopg2
from slugify import slugify
from datetime import date
import time

conn = psycopg2.connect(
    # database="COMIC", user='postgres', password='1234', host='127.0.0.1', port='5432'
    database="comic_uqxm", user='mangahay', password='YVwXMiVQkriJ6oOoW2RwFLfNoX9jmw1N', host='dpg-ci8ost5gkuvmfnrrde80-a.singapore-postgres.render.com', port='5432'
    # database="comic", user='mangahay', password='7TkYqFQb1znlJ0lPYcsiUsCbl6zgr3DF', host='dpg-cgttjv02qv2fdeacb4l0-a.singapore-postgres.render.com', port='5432'
)

cursor = conn.cursor()


def getListLinkComic():
    origin_url = 'https://truyentranhlh.net/danh-sach?sort=update&page='
    array_page = []
    link_comics = []
    for i in range(5, 100):
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
        link_image = comic.find(
            'div', class_='content img-in-ratio').attrs['style']
        link_image = link_image.split('\'')[1]
        name = comic.find('span', class_='series-name').findChildren('a',
                                                                     recursive=False)[0].text.strip()
        # print(name)
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
        id = insert(cursor, record_to_insert)
        conn.commit()
        link_chapters = []
        if (comic.find('ul', class_='list-chapters at-series')) is not None:
            for ele in comic.find('ul', class_='list-chapters at-series'):
                link_chapters.append(ele.attrs['href'])
            for chapter in link_chapters:
                layThongTinChapter(chapter, id)
    except:
        pass


def layThongTinChapter(link, idComic):
    response = requests.get(link)
    chapter = BeautifulSoup(response.content, "html.parser")
    try:
        name = chapter.find('li', class_='active').findChildren(
            'a')[0].text.strip()
        print(kiemTraChapterDaTonTaiChua(cursor, idComic, name))
        if kiemTraChapterDaTonTaiChua(cursor, idComic, name) == False:
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


def layThongTin():
    link_comics = getListLinkComic()
    for link_ in link_comics:
        layThongComic(link_)


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


def insert(cursor, record_to_insert):
    postgres_insert_query = """ INSERT INTO public."comic" (name, another_name, genres, authors, state, thumb, brief_desc, slug) VALUES (%s,%s,%s, %s,%s,%s, %s,%s) RETURNING id"""
    cursor.execute(postgres_insert_query, record_to_insert)
    id = cursor.fetchone()[0]
    conn.commit()
    return id


def insertChapter(cursor, record_to_insert_chapter):
    postgres_insert_query = """ INSERT INTO public."chapter" (name, images, slug, id_comic) VALUES (%s,%s,%s, %s)"""
    cursor.execute(postgres_insert_query, record_to_insert_chapter)
    conn.commit()


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


def capNhatChapterChoTruyen(cursor):
    query = """ SELECT * FROM public."comic" """
    cursor.execute(query)

    result = cursor.fetchall()

    for x in result:
        link = "https://truyentranhlh.net/truyen-tranh/" + x[1]
        capNhatChapter(link, x[0])


capNhatChapterChoTruyen(cursor)

conn.commit()
conn.close()

from flask import Flask, flash, request, redirect, render_template, Markup, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import datetime as dt
import sqlite3
import json
import os

FONT_SIZE_LIST = [(1, 3), (2, 3), (2, 4), (3, 6), (4, 8), (5, 8), (5, 12), (7, 14), (7, 15), (8, 16),
                  (9, 17), (10, 18), (10, 20), (11, 21), (12, 22), (13, 23), (14, 25), (14, 27), (15, 29), (16, 30),
                  (17, 31), (17, 32), (19, 33), (19, 36), (20, 36), (21, 39), (22, 39), (22, 39), (23, 42), (24, 42)]

AUTO_SIZE = 'auto_size'
LINE_COUNT = 'line_count'
FONT_SIZE = 'font_size'
GROUPS = 'groups'
LET_NUM, PUNCTUATION, SPECIAL = 'let_num', 'punctuation', 'special'
COLOR = 'color'
BLACK, WHITE, COLOURED = 'black', 'white', 'coloured'
SATURATION = 'saturation'

SETTINGS = {
    AUTO_SIZE: True,
    LINE_COUNT: 50,
    FONT_SIZE: 5,
    GROUPS: [LET_NUM, PUNCTUATION, SPECIAL],
    COLOR: BLACK,
    SATURATION: 100
}
FILENAME = ''
USER = {}
LOGIN = False


def img_to_ascii(image, settings={}):
    line_count = settings.get(LINE_COUNT, 100)
    font_size = settings.get(FONT_SIZE, 5)
    groups = settings.get(GROUPS, [LET_NUM, PUNCTUATION, SPECIAL])
    color = settings.get(COLOR, COLOURED)
    saturation = settings.get(SATURATION, 100)
    width, height = image.size

    # font = QtGui.QFont("Courier New", font_size)
    # fm = QFontMetrics(font)
    let_wid = FONT_SIZE_LIST[font_size - 1][0]
    let_hei = FONT_SIZE_LIST[font_size - 1][1]

    all_let_black = '''$@B%8&WM*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]lI?-_+~<>i!;:,"^`'. '''
    all_let_coloured = '''.'`^",:;!i~+_-?Il][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*MW&8%B@$'''
    all_let_white = ''' !+_-?I}{1)(tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*MW&8%B'''
    if color == BLACK:
        all_let = all_let_black
    if color == COLOURED:
        extra = 'background-color: black;'
        all_let = all_let_coloured
    if color == WHITE:
        all_let = all_let_white
    let_num = ''' iIl1tfjrxnuvczXYUJCLQ0OZmwqpdbkhaoMW8B'''
    punctuation = ''' .'`",:;!-?)('''
    special = ''' ^><~+_][}{|\\/*&%@$'''
    usage = ''
    for let in all_let:
        if LET_NUM in groups and let in let_num or \
                PUNCTUATION in groups and let in punctuation or \
                SPECIAL in groups and let in special:
            usage += let

    h = height // line_count
    w = round(h * let_wid / let_hei)

    pix = image.load()
    result, result_color = '', ''
    r, g, b = [], [], []
    for x in range(0, height - 2 * h, h):
        for y in range(0, width - 2 * w, w):
            for i in range(y, y + w):
                r.append(pix[i, x][0])
                g.append(pix[i, x][1])
                b.append(pix[i, x][2])
            sr = (sum(r) + sum(g) + sum(b)) // (w * 3)
            gray = int(sr / 255 * (len(usage) - 1))
            letter = usage[gray]
            result += letter
            if color == COLOURED:
                sr_red, sr_green, sr_blue = sum(r) // len(r), sum(g) // len(g), sum(b) // len(b)
                sr_red = 255 - (255 - sr_red) * (saturation / 100)
                sr_green = 255 - (255 - sr_green) * (saturation / 100)
                sr_blue = 255 - (255 - sr_blue) * (saturation / 100)
                result_color += f'<font style="color: rgb({sr_red}, {sr_green}, {sr_blue});">{letter}</font>'
            r, g, b = [], [], []
        result += '\n'
        result_color += '\n'
    result = result[:-1]
    result_color = result_color[:-1]
    result = result.replace('\t', '\\')
    if color == COLOURED:
        result = Markup(result_color)
    # print(result.replace('\n', '<br/>'), font_size, (line_count, width // w - 1),
    #       (let_wid * (width // w), let_hei * line_count))
    # return result, result_color, (let_wid * (width // w), let_hei * line_count), (
    # line_count, width // w - 1), font_size, extra
    return result, font_size


def convert(filename):
    image = Image.open(f'static/uploads/{filename}')
    width, height = image.size
    # h = height // self.line_count_spb.value()
    h = height // 50
    sort_font_size_list = sorted(FONT_SIZE_LIST, key=lambda x: abs(h - x[1]))
    font_size = FONT_SIZE_LIST.index(sort_font_size_list[0]) + 1
    if SETTINGS[AUTO_SIZE]:
        SETTINGS[FONT_SIZE] = font_size
    return img_to_ascii(image, SETTINGS)


app = Flask(__name__)

app.secret_key = "secret key"
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

path = os.getcwd()
UPLOAD_FOLDER = os.path.join(path, 'static/uploads')
if not os.path.isdir(UPLOAD_FOLDER):
    os.mkdir(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def upload_form():
    data = []
    if LOGIN:
        for el in USER['templates']['templates']:
            data.append(el['name'])
    return render_template('index.html', templates=data)


@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/log-in', methods=['POST'])
def log_in():
    global USER, LOGIN
    if request.method == 'POST':
        data = request.json
        login = data['login']
        con = sqlite3.connect("static/database/Converter.db")
        cur = con.cursor()
        result = cur.execute(
            f"SELECT login, password, email, name, surname, images, templates FROM users WHERE (login='{login}' OR email='{login}')").fetchall()
        if result:
            LOGIN = True
            USER = {
                'login': result[0][0],
                'password': result[0][1],
                'email': result[0][2],
                'name': result[0][3],
                'surname': result[0][4],
                'images': json.loads(result[0][5]),
                'templates': json.loads(result[0][6])
            }
        login = USER.get('login', 'Не указан')
        password = USER.get('password', 'Не указан')
        email = USER.get('email', 'Не указан')
        name = USER.get('name', 'Не указано')
        surname = USER.get('surname', 'Не указана')
        images = USER.get('surname', 'История пуста')
        templates = USER.get('surname', 'Шаблонов нет')
        return 'true'


@app.route('/get-login', methods=['GET'])
def get_login():
    if request.method == 'GET':
        if LOGIN:
            return USER['login']
        return 'false'


@app.route('/get-using', methods=['GET'])
def get_using():
    if request.method == 'GET':
        con = sqlite3.connect("static/database/Converter.db")
        cur = con.cursor()
        result = cur.execute(f"SELECT login, email FROM users").fetchall()
        data = {'login': dict(), 'email': dict()}
        for log, email in result:
            data['login'][str(log)] = 1
            data['email'][str(email)] = 1
        print(data)
        return jsonify(data)


@app.route('/get_login_password', methods=['GET'])
def get_login_password():
    if request.method == 'GET':
        con = sqlite3.connect("static/database/Converter.db")
        cur = con.cursor()
        result = cur.execute(f"SELECT login, email, password FROM users").fetchall()
        data = dict()
        for log, email, password in result:
            data[str(log)] = str(password)
            data[str(email)] = str(password)
        print(data)
        return data


@app.route('/profile')
def profile():
    if not LOGIN:
        data = []
        return render_template('index.html', templates=data)
    print(USER)
    login = USER.get('login', 'Не указан')
    password = USER.get('password', 'Не указан')
    email = USER.get('email', 'Не указан')
    name = USER.get('name', 'Не указано')
    surname = USER.get('surname', 'Не указана')
    images = USER.get('images', 'История пуста')
    templates = USER.get('templates', 'Шаблонов нет')
    print(images['images'])
    if images['images']:
        images['images'].sort(key=lambda x: -int(x['index']))
    if templates['templates']:
        templates['templates'].sort(key=lambda x: x['name'])
    return render_template('profile.html', login=login, password=password, email=email, name=name, surname=surname,
                           images=images, templates=templates)


@app.route('/log-out', methods=['POST'])
def log_out():
    global LOGIN, USER
    if request.method == 'POST':
        LOGIN = False
        USER = {}
        data = []
        return render_template('index.html', templates=data)


@app.route('/del-template-element', methods=['POST'])
def del_template_element():
    global LOGIN, USER
    if request.method == 'POST':
        data = request.json
        index = data['id'][9:]
        print(index)
        rm = -1
        for i in range(len(USER['templates']['templates'])):
            if str(index) == str(USER['templates']['templates'][i]['name']):
                rm = i
                break
        USER['templates']['templates'].pop(rm)
        con = sqlite3.connect("static/database/Converter.db")
        cur = con.cursor()
        cur.execute(f"UPDATE users SET images='{json.dumps(USER['templates'])}' WHERE login='{USER['login']}'")
        con.commit()
        return 'true'


@app.route('/del-history-element', methods=['POST'])
def del_history_element():
    global LOGIN, USER
    if request.method == 'POST':
        data = request.json
        index = data['id'][4:]
        rm = -1
        for i in range(len(USER['images']['images'])):
            if str(index) == str(USER['images']['images'][i]['index']):
                rm = i
                break
        USER['images']['images'].pop(rm)
        con = sqlite3.connect("static/database/Converter.db")
        cur = con.cursor()
        cur.execute(f"UPDATE users SET images='{json.dumps(USER['images'])}' WHERE login='{USER['login']}'")
        con.commit()
        return 'true'


@app.route('/registration')
def registration():
    return render_template('registration.html')


@app.route('/new-user', methods=['POST'])
def new_user():
    global USER, LOGIN
    if request.method == 'POST':
        data = request.json
        images = '{"images": []}'
        templates = '{"templates": []}'
        if not data['name']:
            data['name'] = 'Не указано'
        if not data['surname']:
            data['surname'] = 'Не указана'
        con = sqlite3.connect("static/database/Converter.db")
        cur = con.cursor()
        cur.execute(f"INSERT INTO users (login, password, email, name, surname, images, templates) VALUES "
                    f"('{data['login']}', '{data['password']}', '{data['email']}', '{data['name']}', '{data['surname']}', '{images}', '{templates}')")
        con.commit()
        USER = data
        USER['images'] = json.loads(images)
        USER['templates'] = json.loads(templates)
        LOGIN = True
        return 'true'


@app.route('/load-template', methods=['POST'])
def load_template():
    global FILENAME, USER, SETTINGS
    if request.method == 'POST':
        name = request.json['name']
        temps = USER.get('templates', {'templates': []})['templates']
        for el in temps:
            if el['name'] == name:
                for key, value in el.items():
                    if key in SETTINGS:
                        if key == FONT_SIZE or key == LINE_COUNT:
                            SETTINGS[key] = int(value)
                        elif key == AUTO_SIZE:
                            SETTINGS[key] = bool(value)
                        else:
                            SETTINGS[key] = value
                break
        return 'true'


@app.route('/load-image', methods=['POST'])
def load_image():
    global FILENAME, USER
    if request.method == 'POST':
        if 'img-file' not in request.files:
            flash('No file part')
            data = []
            if LOGIN:
                for el in USER['templates']['templates']:
                    data.append(el['name'])
            return render_template('index.html', templates=data)
        file = request.files['img-file']
        # filename = secure_filename(file.filename)
        FILENAME = file.filename
        print(FILENAME)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], FILENAME))
        if LOGIN:
            history = dict()
            history['index'] = str(len(USER['images']['images']) + 1)
            date = dt.datetime.now().date()
            time = dt.datetime.now().time()
            history['date'] = f'{str(date.day).rjust(2, "0")}.{str(date.month).rjust(2, "0")}.{date.year} ' \
                              f'{str(time.hour).rjust(2, "0")}:{str(time.minute).rjust(2, "0")}:{str(time.second).rjust(2, "0")}'
            history['name'] = FILENAME
            USER['images']['images'].append(history)
            print(json.dumps(USER['images']))

            con = sqlite3.connect("static/database/Converter.db")
            cur = con.cursor()
            cur.execute(f"UPDATE users SET images='{json.dumps(USER['images'])}' WHERE login='{USER['login']}'")
            con.commit()
        return 'True'
        # return render_template('index.html', imageLoad='loaded')


@app.route('/get-settings', methods=['GET'])
def get_settings():
    if request.method == 'GET':
        return SETTINGS


@app.route('/get-ascii', methods=['GET'])
def upload_file():
    if request.method == 'GET':
        text, font_size = convert(FILENAME)
        return {'ascii': text, 'font_size': font_size, 'color': SETTINGS[COLOR]}


@app.route('/new-template', methods=['POST'])
def new_template():
    data = request.json
    template = dict()
    template['name'] = data['name']
    if SETTINGS[COLOR] == COLOURED:
        template['color'] = COLOURED
    else:
        template['color'] = BLACK
    template['line_count'] = data['line_count']
    template['font_size'] = data['font_size']
    if 'let_num' in data['groups']:
        template['let_num'] = 'True'
    else:
        template['let_num'] = 'False'

    if 'punctuation' in data['groups']:
        template['punctuation'] = 'True'
    else:
        template['punctuation'] = 'False'

    if 'special' in data['groups']:
        template['special'] = 'True'
    else:
        template['special'] = 'False'
    print(template)
    USER['templates']['templates'].append(template)

    con = sqlite3.connect("static/database/Converter.db")
    cur = con.cursor()
    cur.execute(f"UPDATE users SET templates='{json.dumps(USER['templates'])}' WHERE login='{USER['login']}'")
    con.commit()

    return 'True'


@app.route('/settings', methods=['POST'])
def get_ajax_settings():
    data = request.json
    for key, value in data.items():
        if key in SETTINGS:
            if key == FONT_SIZE or key == LINE_COUNT:
                SETTINGS[key] = int(value)
            elif key == AUTO_SIZE:
                SETTINGS[key] = bool(value)
            else:
                SETTINGS[key] = value
    print(SETTINGS)
    return 'True'


if __name__ == '__main__':
    app.run(port=8080, host='127.0.0.1', debug=False)

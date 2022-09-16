import tornado.ioloop
import tornado.web
import json
import random


class resourceRequestHandler(tornado.web.RequestHandler):
    def get(self, id):
        self.write("Querying soemthing with id " + id)


# Если понадобится возвращать openCellsInCurrentGame
class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


class turn(tornado.web.RequestHandler):
    def get(self):
        game_id = int(self.get_argument("game_id"))
        x = int(self.get_argument("x"))
        y = int(self.get_argument("y"))
        send = {'game_id': game_id, 'x': x, 'y': y}
        global openCells
        if not endGame[game_id]:
            openAllCells(x, y, game_id)
            send['endGame'] = False
            # openCells генерируется каждый раз новый учитывая прошлые открытые клетки из openedCellsInCurrentGame
            # В openedCellsInCurrentGame[game_id] хранятся все открытые клетки в конкретной игре, в openCells только клетки открытые в этот ход
            send['open_cells'] = openCells  # list(openedCellsInCurrentGame[game_id])    #json.dumps(openedCellsInCurrentGame[game_id], cls=SetEncoder)
            # send['GameEnd'] = endGame[game_id]
        else:
            send['endGame'] = True
        self.write(send)
        print(openCells)
        # print(openedCellsInCurrentGame[game_id])


class returnField(tornado.web.RequestHandler):
    def get(self):
        game_id = int(self.get_argument("game_id"))
        if game_id in openedCellsInCurrentGame:
            send = {'openCells': list(openedCellsInCurrentGame[game_id]), 'endGame': endGame[game_id]}
        else:
            send = {'openCells': (0, 0, 0), 'endGame': False}
        self.write(send)


class mainpage(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")


class appjs(tornado.web.RequestHandler):
    def get(self):
        self.render("app.js")


class renderCSS(tornado.web.RequestHandler):
    def get(self):
        self.render("style.css")


class start(tornado.web.RequestHandler):
    def get(self):
        self.render("start.html")


class startjs(tornado.web.RequestHandler):
    def get(self):
        self.render("generateField.js")


class generateNewGameId(tornado.web.RequestHandler):
    def set_default_headers(self):
        self.set_header("Content-Type", 'application/json')

    def post(self):
        value = self.request.body
        data = json.loads(value)
        generateSize(data['Difficult'])
        send = {'gameId': gameId}
        self.write(send)


class getField(tornado.web.RequestHandler):
    def post(self):
        value = self.request.body
        data = json.loads(value)
        print(allFields)
        send = {'field': allFields[int(data['ID'])]}
        self.write(send)


gameId = 0
field = []
openCells = []
xSize = 0
ySize = 0
OpenCellsById = []
Set = set()
openedCellsInCurrentGame = dict()
allFields = dict()
fieldSize = dict()
endGame = dict()


def openAllCells(x, y, game_id):
    st = []
    global openCells
    global Set
    st.clear()
    openCells.clear()
    if game_id in openedCellsInCurrentGame:
        Set = openedCellsInCurrentGame[game_id]
    else:
        Set.clear()
    if allFields[game_id][x][y] != -1:
        if allFields[game_id][x][y] > 0:
            openCells.append([x, y, allFields[game_id][x][y]])
            Set.add((x, y, allFields[game_id][x][y]))
            if game_id in openedCellsInCurrentGame:
                openedCellsInCurrentGame[game_id] = openedCellsInCurrentGame[game_id].union(Set)
            else:
                openedCellsInCurrentGame[game_id] = Set
        elif allFields[game_id][x][y] == 0:
            st.append([x, y])
            Set.add((x, y, allFields[game_id][x][y]))
            openCells.append([x, y, allFields[game_id][x][y]])
            while len(st) > 0:
                x = st[-1][0]
                y = st[-1][1]
                st.pop()
                st = fastOpen(x + 1, y, st, game_id)
                st = fastOpen(x - 1, y, st, game_id)
                st = fastOpen(x, y + 1, st, game_id)
                st = fastOpen(x, y - 1, st, game_id)
    else:
        for i in range(1, fieldSize[game_id][0] + 1):
            for j in range(1, fieldSize[game_id][1] + 1):
                openCells.append([i, j, allFields[game_id][i][j]])
                Set.add((x, y, allFields[game_id][x][y]))
        openedCellsInCurrentGame[game_id] = openCells
        # if game_id in openedCellsInCurrentGame:
        #    openedCellsInCurrentGame[game_id] = openedCellsInCurrentGame[game_id].union(Set)
        # else:
        #    openedCellsInCurrentGame[game_id] = Set
        endGame[game_id] = True


def fastOpen(x, y, st, game_id):
    global openCells
    global Set
    if checkGran(x, y, game_id) and (x, y, allFields[game_id][x][y]) not in Set:
        openCells.append([x, y, allFields[game_id][x][y]])
        st.append([x, y])
        Set.add((x, y, allFields[game_id][x][y]))
        if game_id in openedCellsInCurrentGame:
            openedCellsInCurrentGame[game_id] = openedCellsInCurrentGame[game_id].union(Set)
        else:
            openedCellsInCurrentGame[game_id] = Set
    return st


def checkGran(x, y, game_id):
    if 1 <= x <= fieldSize[game_id][0] and 1 <= y <= fieldSize[game_id][1] and allFields[game_id][x][y] == 0:
        return True
    else:
        return False


def generateSize(mode):
    global gameId
    gameId += 1
    endGame[gameId] = False
    x = 0
    y = 0
    mines = 0
    if mode == 'Easy':  # 9 * 9 - 10    8.1 (Клеток на 1 мину)
        x = 9
        y = 9
        mines = 10
    if mode == 'Medium':  # 16 * 16 - 40  6.4
        x = 16
        y = 16
        mines = 40
    if mode == 'Hard':  # 16 * 30 - 99  4.84
        x = 16
        y = 30
        mines = 99
    print(gameId, mode)
    fieldSize[gameId] = [x, y]
    generateField(x, y, mines)


def generateField(x, y, mines):
    mainField = []
    for i in range(0, x + 2):
        temp = []
        for j in range(0, y + 2):
            temp.append(0)
        mainField.append(temp)
    generateMines(x, y, mines, mainField)


def generateRandomXY(x, y):
    pos = list()
    pos.append(random.randint(1, x))
    pos.append(random.randint(1, y))
    return pos


def generateMines(x, y, mines, mainField):
    minesCord = set()
    while len(minesCord) < mines:
        pos = generateRandomXY(x, y)
        minesCord.add(tuple(pos))
    for cord in minesCord:
        mainField[cord[0]][cord[1]] = -1
    generateNumbersAroundMines(x, y, mainField)


def generateNumbersAroundMines(x, y, mainField):
    for i in range(1, x + 1):
        for j in range(1, y + 1):
            q = 0
            if mainField[i][j] != -1:
                if mainField[i + 1][j] == -1:
                    q += 1
                if mainField[i - 1][j] == -1:
                    q += 1
                if mainField[i][j + 1] == -1:
                    q += 1
                if mainField[i][j - 1] == -1:
                    q += 1
                if mainField[i + 1][j + 1] == -1:
                    q += 1
                if mainField[i + 1][j - 1] == -1:
                    q += 1
                if mainField[i - 1][j + 1] == -1:
                    q += 1
                if mainField[i - 1][j - 1] == -1:
                    q += 1
                mainField[i][j] = q
    global field
    field = mainField
    allFields[gameId] = field
    for i in range(1, x + 1):
        for j in range(1, y + 1):
            j += 0
            # print(field[i][j], end='')
        # print('')


if __name__ == "__main__":
    app = tornado.web.Application([
        (r"/", mainpage),
        (r"/app.js", appjs),
        (r"/start", start),
        (r"/turn", turn),
        (r"/generateField.js", startjs),
        (r"/generateGameId", generateNewGameId),
        (r"/getField", getField),
        (r"/style.css", renderCSS),
        (r"/field", returnField),
        (r'/fonts/(.*)', tornado.web.StaticFileHandler, {'path': './fonts'}),
        (r'/img/(.*)', tornado.web.StaticFileHandler, {'path': './img'}),
        (r'/css/(.*)', tornado.web.StaticFileHandler, {'path': './css'}),
        # (r"/resource/([0-9]+)", resourceRequestHandler),
    ])

    app.listen(8888)
    print("localhost:8888/")
    tornado.ioloop.IOLoop.current().start()

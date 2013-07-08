// i = x = top
// j = y = left

var HorseSteps = [[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1]]; //Возможности коня
var current;
function IntDiv(x, y){
    return x/y>>0
}// деление целочисленное

//Размеры клеток и фигур
var stdWidth = $(window).height() > $(window).width()? IntDiv( $(window).width() - 140 , 8 ) : IntDiv( $(window).height() - 140 , 8 );//длина\высота
stdWidth = stdWidth > 100? 100:stdWidth;
var figureHeight = stdWidth - IntDiv(stdWidth, 8);
var figureLeft = IntDiv(stdWidth, 4);

//Клетка
function TableCell(posX, posY) {
    this.x = posX;
    this.y = posY;
    this.Attacked = false;
    var tX = 50 + this.x * stdWidth;
    var tY = 50 + this.y * stdWidth;
    var HTML = '<img class = "TableItem" src = "' + (((i + j) % 2 )?'black.jpg':'white.jpg') +'" width = ' + stdWidth + ' \
                    style = "position : absolute; left :' + tY + 'px ; top : ' + tX + 'px ;"/>';
    var WarHTML = '<img id = "W' + this.x + this.y + '" class = "WarItem HideCl" src = "WarItem.png" width = ' + stdWidth + ' \
                    style = "position : absolute; left:' + tY + 'px; top: ' + tX + 'px;"/>';
    this.paintTable = function()
    {
        $('#table').append(HTML);
        
    }
    this.paintSteps = function () {
        $('#PlayersItems').append(WarHTML);
    }
    //Клетка под ударом
    this.onAttack = function()
    {
        this.Attacked = true;
        $('#W' + this.x + this.y).removeClass('HideCl');
    }
    //очищение
    this.onClear = function()
    {
        this.Attacked = false;
        $('#W' + this.x + this.y).addClass('HideCl');
    }
    //атака клетки
    this.Attack = function (allies, enemies, tableMap) {
        if (this.isBusy(allies, enemies) == -1) {
            var toKill = this.getBusyIndex(enemies);
          
            enemies[toKill].kill(enemies);
        }
    }
    //Поиск фигуры, занимающей клетку
    this.getBusyIndex = function (target) {
        for (var i = 0; i < target.length; i++)
            if (target[i].x == this.x && target[i].y == this.y)
                return i;
    }
    //проврка занятости клетки
    this.isBusy = function (first, second) {
        var x = this.x;
        var y = this.y;
        for (var index in second) {
            if (second[index].x == x && second[index].y == y)
                return -1;
        }
        for (var index in first)
        {
            if (first[index].x == x && first[index].y == y)
                return 1;
        }
       
        return 0;
    }
    this.checkStep = function (isWhiteTurn,white,black) {
        var Check = isWhiteTurn ? black : white;
        var Another = isWhiteTurn ? white : black;
    }
}



//Фигура
function Figure(posX, posY, imgPath, figure, state,index) {
    this.x = posX;
    this.y = posY;
    this.img = imgPath;
    this.Type = figure;
   
    this.flag = state;
    this.index = index;
    this.id = state + figure + index;
    this.turned = false;
    //true, если игрок взял эту фигуру
    var cased = false;
    var tY = 50 + this.y * stdWidth + figureLeft;
    var tX = 50 + this.x * stdWidth;
    var HTML = '<img id="'+this.id+'" class = "TableItem ' + this.flag + '" index='+index+' Figure = "' + this.Type + '" src = "' + this.img + '" height = ' + figureHeight + 'px \
                    style = "position : absolute; left:' + tY + 'px; top: ' + tX + 'px;"/>';
    this.changeIndex = function(index)
    {

        $('#' + this.id).attr('index', index);
    }
    this.uncased = function()
    {
        cased = false;
    }
    this.casedOn = function () {
        cased = true;
    }
    //Возможно ли поставить фигуру на пустую клетку
    this.checkStepTableItem = function (Nx, Ny, allies, enemies, tableMap, checkX, checkY) {
    
        
        if (checkX != undefined) {
            if (Nx == checkX && Ny == checkY) {
                
                return true;
            }
        } else {
            
            var xTemp = this.x;
            var yTemp = this.y;
            this.x = Nx;
            this.y = Ny;
            if (allies[0].checkSecurity(allies,enemies,tableMap)) {
               
                tableMap[Ny][Nx].onAttack();
            }
            this.x = xTemp;
            this.y = yTemp;
       
        }
        
        return false;
    }
    //возможно ли атаковать врага на клетке
    this.checkEnemyTableItem = function(Nx,Ny,allies, enemies, tableMap,checkX,checkY)
    {
  
        if ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0)) {
            var res = tableMap[Ny][Nx].isBusy(allies,enemies);
            if (res == -1) {
                if (checkX != undefined) {
                    if (Nx == checkX && Ny == checkY)
                        return true;
                } else {
                    var xTemp = this.x;
                    var yTemp = this.y;
                    this.x = Nx;
                    this.y = Ny;
                    if (allies[0].checkSecurity(allies,enemies,tableMap)) {

                        tableMap[Ny][Nx].onAttack();
                    }
                    this.x = xTemp;
                    this.y = yTemp;
                }
            }
        }
        return false;
    }
     
    this.onCheckStep = function (allies, enemies, tableMap) {
        this.checkStep[this.Type](this,allies, enemies, tableMap);
    }
    //проверяет были ли фигуры на его месте (идут ли проверки на убийство)
    this.canBeKilled = function(enemies)
    {
        for (var i = 0; i < enemies.length; i++)
            if (enemies[i].x == this.x && enemies[i].y == this.y)
                return true;
        return false;
    }
    //определяет клетки, куда может походить фигура. если определены checkX | checkY - проверка бьет ли фигура данную клетку
    this.checkStep = [];
//для ладьи
    this.checkStep['L'] = function (current, allies, enemies, tableMap, checkX, checkY) {
        current.casedOn();
        if (checkX == undefined) console.log(1);
        if (current.canBeKilled(enemies)) return false;
        for (var dx = -1; dx < 2; dx += 2) {
            var Nx = Number(current.x) + Number(dx);
            var Ny = Number(current.y);
            

            while ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
                if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY)) {
                  
                    return true;
                }
                Nx += Number(dx);
            }
            //Если фигуру, куда уткнулись можно срубить
            if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY)) {
           
                return true;
            }
        }

        
        for (var dy = -1; dy < 2; dy += 2) {
            var Nx = Number(current.x);
            var Ny = Number(current.y) + Number(dy);

            while ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
                if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY)) {
                
                    return true;
                }
                Ny += Number(dy);
            }
            //Если фигуру, куда уткнулись можно срубить
            if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY)) {
            
                return true;
            }
        }
    }
    //для коня
    this.checkStep['H'] = function (current, allies, enemies, tableMap, checkX, checkY) {
        current.casedOn();
        if (current.canBeKilled(enemies)) return false;
        for (var iterator = 0; iterator < 8; iterator++) {
            var Nx = Number(current.x) + Number(HorseSteps[iterator][0]);
            var Ny = Number(current.y) + Number(HorseSteps[iterator][1]);
            if ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
                if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                    return true;
            }
            if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                return true;
        }
    }
    //для слона
    this.checkStep['E'] = function (current, allies, enemies, tableMap, checkX, checkY) {
        current.casedOn();
        if (current.canBeKilled(enemies)) return false;
        for (var dx = -1; dx < 2; dx += 2)
            for (var dy = -1; dy < 2; dy += 2) {
                var Nx = Number(current.x) + Number(dx);
                var Ny = Number(current.y) + Number(dy);
                while ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
                    if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                        return true;
                    Nx += Number(dx); Ny += Number(dy);
                }
                //Если фигуру, куда уткнулись можно срубить
                if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                    return true;
            }
    }
    //король
    this.checkStep['K'] = function (current, allies, enemies, tableMap, checkX, checkY) {
        current.casedOn();
        if (current.canBeKilled(enemies)) return false;
        for (var dx = -1; dx < 2; dx++)
            for (var dy = -1; dy < 2; dy++) {
                if (dx == dy && dx == 0) continue;
                var Nx = Number(current.x) + Number(dx);
                var Ny = Number(current.y) + Number(dy);
                if ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
                    if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                        return true;
                }
                if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                    return true;
            }
        //Рокировка
        if (checkX == undefined) {
            if (!current.turned) {
                for (var index in allies) {
                    var x = allies[index];
                    if (!x.turned && x.Type == 'L') {
                        
                        if (x.x < current.x && !tableMap[current.y][current.x-2].isBusy(allies, enemies) && !tableMap[current.y][current.x-1].isBusy(allies, enemies)) {
                            x.x += 3;
                            (current.checkStepTableItem(current.x - 2, current.y, allies, enemies, tableMap, checkX, checkY));
                            x.x -= 3;
                        }
                        if (x.x > current.x && !tableMap[current.y][current.x+2].isBusy(allies, enemies) && !tableMap[current.y][current.x+1].isBusy(allies, enemies)) {
                            x.x += 2;
                            (current.checkStepTableItem(current.x + 2, current.y, allies, enemies, tableMap, checkX, checkY));
                            x.x -= 2;
                        }
                    }
                }
            }
        }
    }
    //Ферзь
    this.checkStep['F'] = function (current, allies, enemies, tableMap, checkX, checkY) {
        current.casedOn();
        if (current.canBeKilled(enemies)) return false;
        for (var dx = -1; dx < 2; dx++)
            for (var dy = -1; dy < 2; dy++) {
                if (dx == dy && dx == 0) continue;
                var Nx = Number(current.x) + Number(dx);
                var Ny = Number(current.y) + Number(dy);
                while ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
                    if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                        return true;
                    Nx += Number(dx);
                    Ny += Number(dy);
                }
                if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                    return true;
            }
    }
    //Пешка
    this.checkStep['S'] = function (current, allies, enemies, tableMap, checkX, checkY) {
        if (current.canBeKilled(enemies)) return false;
        current.casedOn();
        if (!current.turned) {
            var dy;
            if (current.flag == "white") {
                dy = -2;
            } else {
                dy = 2;
            }
            var Nx = current.x;
            var Ny = Number(current.y) + Number(dy);

            if ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies) && !tableMap[Ny-Number(dy/2)][Nx].isBusy(allies, enemies)) {
                if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                    return true;
            }
        }
        var dy;
        if (current.flag == "white") {
            dy = -1;
        } else {
            dy = 1;
        }
        var Nx = current.x;
        var Ny = Number(current.y) + Number(dy);
        
        if ((Nx >= 0 && Nx < 8) && (Ny < 8 && Ny >= 0) && !tableMap[Ny][Nx].isBusy(allies, enemies)) {
            if (current.checkStepTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                return true;
        }
        for (var dx = -1; dx < 2; dx += 2)
        {
          
                Nx = Number(current.x) + Number(dx);
          
            if (current.checkEnemyTableItem(Nx, Ny, allies, enemies, tableMap, checkX, checkY))
                return true;
        }
    }

    //true -  в случае, если ход возможен
    this.checkSecurity = function(allies,enemies,tableMap)
    {
        var targetX = allies[0].x;
        var targetY = allies[0].y;
        
        for (var i in enemies) {
            var x = enemies[i];
    
            if (x.checkStep[x.Type](x, enemies, allies, tableMap, targetX, targetY)) {
               
                return false;
            }
        }
        return true;
    }
    //самоубийство
    this.kill = function (allies) {
        $('#' + this.id).slideUp(100);
        var toKill;
        for (var i = 0 ; allies.length  > i; i++) {
            if (allies[i] == this) {
                
                allies[i] = null;
                toKill = i;
            }
        }
       
        for (var i = Number(toKill) + Number(1) ; i < allies.length; i++) {
            allies[i - 1] = allies[i];
            allies[i - 1].changeIndex(i - 1);
        }
        allies.pop();
        
 
    }
    //делаем шаг
    this.step = function (allies, enemies, tableMap, newY, newX) {
        
        this.turned = true;
      
        tableMap[newY][newX].Attack(allies, enemies, tableMap);
        if (this.Type == "K" && (newX - this.x > 1 || newX - this.x < -1)) {
            var complete = false;
            for (var index = 0; index < allies.length && !complete; index++) {
                var x = allies[index];
                if (!x.turned && x.Type == 'L') {
                    if (newX > this.x && x.x > this.x) {
                        x.step(allies, enemies, tableMap, x.y, x.x - 2);
                        complete = true;
                    } else
                        if (newX < this.x && x.x < this.x) {
                            x.step(allies, enemies, tableMap, x.y, x.x + 3);
                            complete = true;
                        }
                }
            }
        }
        if (this.Type == "S" && (newY == 0 || newY == 7)) {
            var cases = ["ферзь","слон","конь","ладья"];
            var i = 0;
            while (!confirm("Выбор = " + cases[i] + "?")) {
                i = i == 3 ? 0 : i + 1;
            }
            switch (i) {
                case 0: this.Type = "F";
                    break;
                case 1: this.Type = "E";
                    break;
                case 2: this.Type = "H";
                    break;
                case 3: this.Type = "L";
                    break;
            }
            if (this.flag == "white") {
                $("#" + this.id).attr("src", "White" + this.Type + ".png");
            }
            else{
                $("#" + this.id).attr("src", "Black" + this.Type + ".png");
            }
        }
        this.y = newY;
        this.x = newX;
        var tY = 50 + this.y * stdWidth + figureLeft
        var tX = 50 + this.x * stdWidth;
        $('#'+this.id).animate(
            {
                "left":+ tY + 'px',
                "top": tX + 'px'
            }, 500);
        
    }
    this.paint = function()
    {
        $("#PlayersItems").append(HTML);
    }
 
}


//Игровое поле
function Table()
{
   
    var whiteTurn = true;

    var currentFigure = null;
    var table = null;
    var white = [];
    var black = [];
    this.constructTable = function()
    {
        table = [];
        for (i = 0; i<8; i++)
            table[i] = [];

        for(j=0;j<8;j++)
            for(i=0;i<8;i++)
            {
                table[j][i] = new TableCell(i,j);
                table[j][i].paintTable();
            }
    }
    this.constructSteps = function () {
        for (j = 0; j < 8; j++)
            for (i = 0; i < 8; i++) {
             
                table[j][i].paintSteps();
            }
    }
    //Рисуем систему координат доски
    this.constuctNavigator = function () {
        var Temp = $("#Navigator");
        var TempNames = ['', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
        for (var j = 8; j > 0; j--) {
            
            var LeftV = 50 + (8 - j) * stdWidth + figureLeft; -(-1) * IntDiv(stdWidth, 2);
            var TopV = 50 + (8-j) * stdWidth;
            Temp.append('<p class = "NavigationPoint" style = " left : ' + LeftV + 'px ; top : ' + 0 + 'px;">' + j + '</p>');
            Temp.append('<p class = "NavigationPoint" style = " left : ' + 5 + 'px ; top : ' + TopV + 'px;">' + TempNames[j] + '</p>');
        }
    }

    this.clearSteps = function () {
        $(white).each(function () {
            this.uncased()
        });
        $(black).each(function () {
            this.uncased()
        });
        for (j = 0; j < 8; j++)
            for (i = 0; i < 8; i++)
                table[j][i].onClear();
    }
    this.binding = function(){
        $('.white,.black').bind("click keypress", function () {
            var t = $(this);
            var index = t.attr("index");
            console.log(index);
            current.clearSteps();
            if (whiteTurn && t.hasClass('white')) {
                white[index].onCheckStep(white, black, table);
                currentFigure = white[index];
            }
            else
                if (!whiteTurn && t.hasClass('black')) {
                 
                    black[index].onCheckStep(black, white, table);
                    currentFigure = black[index];
                }

        });

        $('.WarItem').bind("click keypress", function () {
            var t = $(this).attr('id');
            
            var x = t[1];
            var y = t[2];
            if (table[y][x].Attacked) {
                if (currentFigure.flag == "white")
                    currentFigure.step(white, black, table, y, x);
                else 
                    currentFigure.step(black, white, table, y, x);
                whiteTurn = !whiteTurn;
                current.clearSteps();
            }
        });
    }
    this.constructorArmies = function(state)
    {
      
        var figureList = ["L", "H", "E", "F", "K", "E", "H", "L", "S"];
        if (state == "white") {
            var index = 0;
            for (var i = 0; i < 8; i++) {
                var temp = new Figure(i, 7,"White"+figureList[i] +".png", figureList[i], state,index++);
                temp.paint();
                white.push(temp);
                temp = new Figure(i, 6, "White" + figureList[8] + ".png", figureList[8], state,index++);
                temp.paint();
                white.push(temp);
            }
            var t = white[8];
            white[8] = white[0];
            white[0] = t;
            white[0].changeIndex(0);
            white[8].changeIndex(8);
        }
        else {
            var index = 0;
            for (var i = 0; i < 8; i++) {
                var temp = new Figure(i, 0, "Black" + figureList[i] + ".png", figureList[i], state,index++);
                temp.paint();
                black.push(temp);
                temp = new Figure(i, 1, "Black" + figureList[8] + ".png", figureList[8], state,index++);
                temp.paint();
                black.push(temp);
            }
            var t = black[8];
            black[8] = black[0];
            black[0] = t;
            black[0].changeIndex(0);
            black[8].changeIndex(8);
        }
    }
    
}
$(function () {
    current = new Table();
    current.constructTable();
    current.constructorArmies("white");
    current.constructorArmies("black");
    current.constuctNavigator();
    current.constructSteps();
    current.binding();
 
});
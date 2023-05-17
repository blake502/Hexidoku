log("Script loaded");

var numbersTable = [];

var letters = " 1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@#$%^&*()_+[]{}\\|`:;\"',.<>/?ßΓπΣσµτΦΘ";

var elementsTable = [];
var staticNumbersTable = [];
var branches = [];
var totalBranches = 0;
var totalBacksteps = 0;
var resets = 0;
var resetsAccounted = 0;

var root = 4;
var square = root * root;

//Entry point
window.onload = function()
{
    log("Page loaded");

    for(var y = 0; y < square; y++)
    {
        numbersTable[y] = [];
        for(var x = 0; x < square; x++)
            numbersTable[y][x] = 0;
    }

    createGameboard();

    
}

//Creates the necessary nested elements for the gameboard
function createGameboard()
{
    for(var i = 0; i < square; i++)
    {
        elementsTable[i] = [];
        staticNumbersTable[i] = [];
    }

    var gameTable = createElement("table", "game", document.body);
    for(var yy = 0; yy < root; yy++)
    {
        var ninthrow = createElement("tr", null, gameTable);
        for(var xx = 0; xx < root; xx++)
        {
            var ninthcell = createElement("td", null, ninthrow);
            var ninth = createElement("table", "ninth", ninthcell);
            for(var y = yy * root; y < (yy + 1) * root; y++)
            {
                var row = createElement("tr", null, ninth);
                for(var x = xx * root; x < (xx + 1) * root; x++)
                {
                    var cell = createElement("td", "cell", row);

                    elementsTable[y][x] = cell;

                    staticNumbersTable[y][x] = numbersTable[y][x];
                }
            }
        }
    }

    placeNumsInElems();

    var buttonSolve = createElement("button", null, document.body)
    buttonSolve.innerHTML = "Solve"
    buttonSolve.onclick = solve;
    var buttonSlowSolve = createElement("button", null, document.body)
    buttonSlowSolve.innerHTML = "Slow Solve"
    buttonSlowSolve.onclick = slowSolve;
    var buttonReset = createElement("button", null, document.body)
    buttonReset.innerHTML = "Reset"
    buttonReset.onclick = reset;
};

function reset()
{
    resets++;
    setTimeout(function()
    {
        for(var x = 0; x < square; x++)
            for(var y = 0; y < square; y++)
                numbersTable[y][x] = staticNumbersTable[y][x];
        placeNumsInElems();
        branches = [];
        totalBranches = 0;
        totalBacksteps = 0;
        resetsAccounted = resets;
    }, 100)
}

//returns a string containing all numbers 1-9 not contained within the provided string
function getMissingNumbers(provided)
{
    var returnable = [];

    for(var i = 1; i <= square; i++)
    {
        if(provided.indexOf(i) == -1)
            returnable.push(i);
    }

    return returnable;
}

function getRowContains(row)
{
    var rowContains = [];
    for(var x = 0; x < square; x++)
        if (numbersTable[row][x] != 0)
            rowContains.push(numbersTable[row][x]);
    return rowContains;
}

function getColContains(col)
{
    var colContains = [];
    for(var y = 0; y < square; y++)
        if (numbersTable[y][col] != 0)
            colContains.push(numbersTable[y][col]);

    return colContains;
}

function getBlockContains(xx, yy)
{
    xx = Math.floor(xx / root);
    yy = Math.floor(yy / root);


    var blockContains = [];
    for(var x = xx * root; x < (xx + 1) * root; x++)
        for(var y = yy * root; y < (yy + 1) * root; y++)
            if (numbersTable[y][x] != 0)
                blockContains.push(numbersTable[y][x]);

    return blockContains
}

function addContains(first, second)
{
    for (var i = 0; i < second.length; i++)
        if(first.indexOf(second[i]) == -1)
            first.push(second[i]);
    return first;
}

function getEntropy(x, y)
{
    return getPossibilities(x, y).length;
}

function getPossibilities(x, y)
{
    return getMissingNumbers(getUnavailable(x, y));
}

function getUnavailable(x, y)
{
    var rowContains = getRowContains(y);
    var colContains = getColContains(x);
    var blockContains = getBlockContains(x, y);
    
    var unavailable = rowContains;
    unavailable = addContains(unavailable, colContains);
    unavailable = addContains(unavailable, blockContains);

    return unavailable;
}

function cloneNumTable(inTable)
{
    var outTable = [];
    for(var y = 0; y < inTable.length; y++)
    {
        outTable[y] = [];
        for(var x = 0; x < inTable[y].length; x++)
            outTable[y][x] = inTable[y][x];
    }
    
    return outTable;
}

function placeNumsInElems()
{
    for(var x = 0; x < square; x++)
        for(var y = 0; y < square; y++)
        {

            elementsTable[y][x].innerHTML = letters[numbersTable[y][x]].toString();

            if(numbersTable[y][x] == 0)
                elementsTable[y][x].innerHTML = "&nbsp"

            if(staticNumbersTable[y][x] != 0)
                elementsTable[y][x].innerHTML = "<b>" + elementsTable[y][x].innerHTML + "</b>"
        }
}

function getSpaceWithLowestEntropy()
{
    var lowestEntropy = square + 1;
    var lowestX = -1;
    var lowestY = -1;
    for(var x = 0; x < square; x++)
        for(var y = 0; y < square; y++)
            if(numbersTable[y][x] == 0)
            {
                var entropy = getEntropy(x, y);
                
                if(entropy < lowestEntropy)
                {
                    lowestEntropy = entropy;
                    lowestX = x;
                    lowestY = y;
                }
            }

    if(lowestEntropy == 0 || lowestEntropy == square + 1)
        return -1;
    
    return {x: lowestX, y: lowestY};
}

function makeAMove()
{
    var position = getSpaceWithLowestEntropy();

    var x = position.x;
    var y = position.y;

    var selectedIndex = 0;

    if(position == -1)
    {
        if(branches.length < 1)
            return false;

        totalBacksteps++;
        
        var branch = branches.pop();
        x = branch.x;
        y = branch.y;
        selectedIndex = ++branch.i;
        
        numbersTable = branch.t;
        placeNumsInElems();
    }
    
    var possiblities = getPossibilities(x, y);

    if((possiblities.length - selectedIndex) > 1)
    {
        branches.push({x:x, y:y, i:selectedIndex, t:cloneNumTable(numbersTable)});
        totalBranches++;
    }

    var selectedNumber = parseInt(possiblities[selectedIndex]);

    log("Lowest entropy (" + possiblities.length + ") at: (" + (x + 1) + ", " + (y + 1) + "). " +
    "Branches: " + totalBacksteps.toString() + "/" + totalBranches.toString() + " (" + branches.length + "). " +
    "Selecting: " + selectedNumber + " from " + possiblities)

    numbersTable[y][x] = selectedNumber;
    
    elementsTable[y][x].innerHTML = letters[selectedNumber];
    
    if(selectedNumber == 0)
        elementsTable[y][x].innerHTML = "&nbsp"

    return true;
}

function solve()
{
    while(!checkComplete() && makeAMove()){}
    return checkComplete();
}

function slowSolve()
{
    if(!checkComplete() && makeAMove() && resets == resetsAccounted)
        setTimeout(slowSolve, 0);
    else
        return checkComplete();
}

//Returns true if the gameboard is solved. Returns false otherwise.
function checkComplete()
{
    //Rows
    for(var y = 0; y < square; y++)
        if(getRowContains(y).length < square)
            return false;

    //Columns
    for(var x = 0; x < square; x++)
        if(getColContains(x).length < square)
            return false;

    //Blocks
    for(var x = 0; x < root; x++)
        for(var y = 0; y < root; y++)
            if(getBlockContains(x, y).length < square)
                return false;

    return true;
}

//Creates and element of type elemType, sets className to className, and appends it as a child to parent
function createElement(elemType, className, parent)
{
    var elem = document.createElement(elemType);

    if(className)
        elem.className = className;

    if(parent)
        parent.appendChild(elem);

    return elem;
}

//Alias for console.log
function log(msg)
{
    console.log(msg);
}
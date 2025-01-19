const e = ["l1", "l2", "l3", "l4", "l5", "f1", "f2", "f3", "f4"];
const NUM = 9;

function goodGroup() {
   if (cs[0] < 5 || cs[1] < 5 || cs[2] < 5 ) {
        if (cs[3] < 5 || cs[4] < 5 || cs[5] < 5 ) {
            if (cs[6] < 5 || cs[7] < 5 || cs[8] < 5 ) {
                return true;
            }
        }
   }
   return false;
}

function allGirlGroup() {
    if (cs[0] < 5 && cs[1] < 5 && cs[2] < 5 ) {
        return true;
    }
    if (cs[3] < 5 && cs[4] < 5 && cs[5] < 5 ) {
        return true;
    }
    if (cs[6] < 5 && cs[7] < 5 && cs[8] < 5 ) {
        return true;
    }
    return false;
}

function findFirstFree(index) {
    for(let i = cs[index] + 1; i < NUM; i++) {
        if (mfree[i]) { return i; }
    }
    return -1;
}

var cs = [-1, -1, -1, -1, -1, -1, -1, -1, -1];
var mfree = [true, true, true, true, true, true, true, true, true];
var allGroup;
var goodGroupNum;
var allGirlGroupNum;

function fillDepth(depth) {
    let nextFree = findFirstFree(depth);
    while (nextFree != -1) {
        if (cs[depth] != -1) {
            mfree[cs[depth]] = true;
        }
        cs[depth] = nextFree;
        mfree[nextFree] = false;
        if (depth == NUM-1) {
            allGroup++;
            //console.log(allGroup + " -> " + cs);
            if (goodGroup()) {
                goodGroupNum++;
                if (allGirlGroup()) {
                    allGirlGroupNum++;
                }
            }
            mfree[cs[depth]] = true;
            cs[depth] = -1;
            return;
        }
        fillDepth(depth+1);
        nextFree = findFirstFree(depth);
    }
    mfree[cs[depth]] = true;
    cs[depth] = -1;
}

function matf() {
    allGroup = 0;
    goodGroupNum = 0;
    allGirlGroupNum = 0;
    fillDepth(0);
    console.log("Groups num: " + allGroup);
    console.log("Good group num: " + goodGroupNum);
    console.log("All girl group num: " + allGirlGroupNum);
}
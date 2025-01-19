let orderedMatches = [[],[]];

// returns the first found match in other ordered match array, and its index
function findMatchInOtherDoc(match, otherDocNo, orderedMatchFrom) {
    let matchesToCheck = match.matchGroup.matchGroups[otherDocNo];
    let found = false;
    let orderedMatchI = -1;
    let checkMatch = null;
    for(let matchI = 0; !found && matchI < matchesToCheck.length; matchI++) {
        checkMatch = matchesToCheck[matchI];
        orderedMatchI = orderedMatchFrom;
        let otherMatch = null;
        while(!found && orderedMatchI < orderedMatches[otherDocNo].length) {
            otherMatch = orderedMatches[otherDocNo][orderedMatchI];
            if (checkMatch == otherMatch) {
                found = true;
            } else {
                orderedMatchI++;
            }
        }
    }
    if (found) {
        return {"checkMatch" : checkMatch, "checkMatchI" : orderedMatchI};
    } else {
        return {"checkMatch" : null, "checkMatchI" : -1};
    }
}

function subtitleProcess() {
    createOrderedMatchGroupList()
    let matchI1 = 0, matchI2 = 0;
    let nextMatchI1, nextMatchI2;
    let nextMatch1, nextMatch2;
    let diff1 = "";
    let diff2 = "";
    let pos1 = 0, pos2 = 0;
    while (matchI1 < orderedMatches[0].length && matchI2 < orderedMatches[1].length) {
        let match1 = orderedMatches[0][matchI1];
        let qPart1 = "";
        let foundForMatch1 = findMatchInOtherDoc(match1, 1, matchI2);
        nextMatchI2 = foundForMatch1.checkMatchI;
        nextMatch2 = foundForMatch1.checkMatch;
        nextMatchI1 = matchI1;
        nextMatch1 = match1;
        while (nextMatchI1 < orderedMatches[0].length && (nextMatch2 == null || nextMatchI2 - matchI2 > 10)) {
            nextMatchI1++;
            if (nextMatchI1 < orderedMatches[0].length) {
                nextMatch1 = orderedMatches[0][nextMatchI1];
                foundForMatch1 = findMatchInOtherDoc(nextMatch1, 1, matchI2);
                nextMatchI2 = foundForMatch1.checkMatchI;
                nextMatch2 = foundForMatch1.checkMatch;
            }
        }

        console.log(" nextMatchI1: " + nextMatchI1 + " - nextMatchI2: " + nextMatchI2);
        if (nextMatchI1 < orderedMatches[0].length) {
            nextMatch1 = orderedMatches[0][nextMatchI1];
            if (nextMatch1.startPos > pos1) {
                diff1 = texts[0].substring(pos1, nextMatch1.startPos);
            }
        } else {
            diff1 = "";
        }

        if (nextMatch2 != null) {
            if (nextMatch2.startPos > pos2) {
                diff2 = texts[1].substring(pos2, nextMatch2.startPos);
            }
        } else {
            diff2 = "";
        }

        console.log("diff1: [" + diff1 + "]");
        console.log("diff2: [" + diff2 + "]");
        el("diff1Div").innerHTML = diff1;
        el("diff2Div").innerHTML = diff2;

        let match2 = orderedMatches[1][matchI2];
        let foundForMatch2 = findMatchInOtherDoc(match2, 0, matchI1);
        
        if (match1.startPos > pos1) {
            qPart1 = texts[0].substring(pos1, match1.startPos);
        }
        break;
    }
}

function findFirst(docI, index) {
    let matchFound = null;
    for(let mI = 0; mI < matchGroups.length; mI++) {
        let matchgroup = matchGroups[mI];
        if (matchgroup.show) {
            let found = false;
            for(mdI = 0; !found && mdI < matchgroup.matchGroups[docI].length; mdI++) {
                let match = matchgroup.matchGroups[docI][mdI];
                if (match.startIndex > index && match.show) {
                    if (matchFound == null || matchFound.startIndex > match.startIndex) {
                        matchFound = match;
                    }
                }
            }
        }
    }
    return matchFound;
}

function createOrderedMatchGroupList() {
    for(let docI = 0; docI < DOC_NUM; docI++) {
        let index = -1;
        let match = findFirst(docI, index);
        let lastMatch = null;
        let round = 0;
        while (match != null) {
            if (match!=lastMatch) {
                orderedMatches[docI].push(match);
            }
            index = match.startIndex + match.tokenLength;
            lastMatch = match;
            match = findFirst(docI, index);
            round++;
            if (round%50 == 0) {
                console.log(round);
            }
        }
    }
    console.log("ordered matches:");
    console.log(orderedMatches);
}

function choose(event) {
    let choice = event.target.id;
    if (choice=="choose1") {
        return el("diff1Div").value;
    }
}
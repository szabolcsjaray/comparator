
var tokens = [];
var docsOccurences = [[], []];
var matchGroups = [];
var texts = [];

const NONE = -1;
const BOTH = 10;

const MAX_ITER_NUM = 20000;

const DOC_NUM = 2; // to do - use this everywhere!

const TOKEN_DIV = 1;
const MID_DIV = 2;

var bookmarkGroup = null;

function el(id) {
    return document.getElementById(id);
}

function loadPreviousContent() {
    let stored1 = localStorage.getItem("comparator_1");
    let stored2 = localStorage.getItem("comparator_2");
    if (stored1 != undefined && stored1!=null) {
        el("doc1").value = stored1;
    }
    if (stored2 != undefined && stored2!=null) {
        el("doc2").value = stored2;
    }
}

function storeContent() {
    localStorage.setItem("comparator_1", el("doc1").value );
    localStorage.setItem("comparator_2", el("doc2").value );
}

function init() {
    console.log("Comparator started.");
    loadPreviousContent();
    buttonListeners();
    //processDocs();
}

function processDocs() {
    storeContent();
    texts[0] = el("doc1").value;
    texts[1] = el("doc2").value;

    makeTokens();
    findMatches();
    findOverlaps();
    makeColors();
    //console.log("Matches:");
    //console.log(matchGroups);
    
}

function inputSwitch() {
    el("doc1").style.display = 'block';
    el("doc1Div").style.display = 'none';
    el("doc2").style.display = 'block';
    el("doc2Div").style.display = 'none';

}

function findOverlaps() {
    for(let i = 0; i < matchGroups.length - 1; i++) {
        for(let j = i+1; j < matchGroups.length; j++) {
            matchGroups[i].overlapping(matchGroups[j]);
            //matchGroups[j].overlapping(matchGroups[i]);
        }
    }
}

function resultSwitch() {
    el("doc1").style.display = 'none';
    el("doc1Div").style.display = 'block';
    el("doc2").style.display = 'none';
    el("doc2Div").style.display = 'block';

}

function buttonListeners() {
    el("switchInput").addEventListener("click", inputSwitch);
    el("switchResult").addEventListener("click", resultSwitch);
    el("process").addEventListener("click", processDocs);
    el("subtitles").addEventListener("click", subtitleProcess);
    el("choose1").addEventListener("click", choose);
    el("choose2").addEventListener("click", choose);
}

function getMidSpanId(occurence, lineI) {
    return "m" + occurence.docNo + "-" + (occurence.docI-1) + "-" + lineI;
}

function visibleSpaces(str) {
    return str.replaceAll(" ", "&nbsp;").replaceAll("\n", "<br>");
}

function createMidTokenSpan(occurence, midTokenStr) {
    let lineSplitParts = midTokenStr.split('\n');
    let i;
    let midTokenResultStr = "";
    let firstLine = true;
    for(i = 0; i < lineSplitParts.length; i++) {
        if (!firstLine) {
            midTokenResultStr += "<br>"
        }
        let midTokenPart = visibleSpaces(lineSplitParts[i]);
        midTokenResultStr += "<div class=\"docSpan\" id=\""
            + getMidSpanId(occurence, i)
            + "\">" + midTokenPart + "</div>";
        firstLine = false;
    }
    occurence.prevMidTokenSpanNum = lineSplitParts.length;
    return midTokenResultStr;
}

function makeDoc(docNo, saved) {
    let docStr = "";
    let lastStrI = 0;
    let span = false;
    let spanClass;
    upperSaved = saved[docNo].toUpperCase().replaceAll("'", "’");
    docsOccurences[docNo].forEach( occurence => {
        if (span) {
            docStr += "</div>";
            span = false;
        }
        let tokenStartsI = upperSaved.indexOf(occurence.token.word, lastStrI);
        docStr += createMidTokenSpan(occurence, saved[docNo].substr(lastStrI, occurence.startPos-lastStrI));
        lastStrI += occurence.startPos-lastStrI;
        spanClass = "class=\"docSpan\"";
        /*if (occurence.matches.length > 0) {
            if (occurence.matches[0].matchGroup.matchGroups.length > 1) {
                spanClass = " class=\"docSpan multiple\""
            }
        }*/
        docStr += "<div id=\"" + occurence.getSpanId() + "\"" + spanClass + ">";
        span = true;
        docStr += saved[docNo].substr(tokenStartsI, occurence.token.word.length);
        lastStrI += occurence.token.word.length;
    });
    return docStr;
}

function spanClick2(evt) {
    console.log("clicked");
    /*let elem = evt.currentTarget;
    console.log(elem);
    console.log("clicked");*/
}

function linkSpansToOccurencesInDoc(docNo) {
    docsOccurences[docNo].forEach(occurence => {
        let spanEl = el(occurence.getSpanId());
        if (occurence.matches.length > 0 &&
            spanEl != null &&
            occurence.matches[0].matchGroup != null) {
            spanEl.occurenceLink = occurence;
            spanEl.addEventListener("mouseover", spanHover);
            spanEl.addEventListener("mouseout", spanLeave);

        }    
        occurence.setPrevOccurencesNextMidTokenSpan();
    });    
}    

function linkSpansToOccurences() {
    linkSpansToOccurencesInDoc(0);
    linkSpansToOccurencesInDoc(1);
}

function makeColors() {
    let saved = [ el("doc1").value, el("doc2").value ];
    //console.log(saved[0]);

    let content1 = makeDoc(0, saved);
    el("doc1Div").innerHTML = content1;

    let content2 = makeDoc(1, saved);
    el("doc2Div").innerHTML = content2;

    linkDivs();
    resultSwitch();
    findMatchgroupsToShow();
    markMatchgroups();
    //linkSpansToOccurences();
}

function findMatchgroupsToShow() {
    for(let i = matchGroups.length - 1; i >= 0; i--) {
        let matchGroup = matchGroups[i];
        if (matchGroup.show) {
            for(let mI = 0; mI < matchGroup.getMatchNum(); mI++) {
                let match = matchGroup.getMatchByIndex(mI);
                if (match.show) {
                    for(let j = 0; j < match.overlaps.length; j++) {
                        if (match.overlaps[ j ].show) {
                            match.overlaps[ j ].dontShow();
                        }
                    }
                }
            }
        }
    }
}

function markMatchgroups() {
    let str = "";
    let str2 = "";
    for(let i = matchGroups.length - 1; i >= 0; i--) {
        let matchGroup = matchGroups[i];
        if (matchGroup.show) {
            for(let docI = 0; docI < DOC_NUM; docI++) {
                for(let j = 0; j < matchGroup.matchGroups[docI].length; j++) {
                    let match = matchGroup.matchGroups[docI][j];
                    if (match.show) {
                        markMatch(match);
                        str2 += " " + match.matchGroup.id;
                    }
                }
            }
            str += " " + matchGroup.id;
        }
    }
    //console.log("marked: " + str + "\n" + str2);
}

function divClick(evt) {

    console.log("clicked: " + evt.target.id);
    bookmarkGroup = evt.target.matchGroup;
    divHover(evt);
}

function addListeners(div) {
    div.addEventListener("mouseover", divHover);
    div.addEventListener("mouseout", divLeave);
    div.addEventListener("click", divClick);
}

function markMatch(match) {
    let markDiv = match.firstOccurence.myDiv;
    markDiv.className = "docSpan multiple";
    markDiv.matchGroup = match.matchGroup;
    addListeners(markDiv);
    let tokenNum = 1;
    while (markDiv!=null && tokenNum < match.tokenLength) {
        markDiv = markDiv.nextDiv;
        if (markDiv != null) {
            markDiv.matchGroup = match.matchGroup;
            addListeners(markDiv);
            markDiv.className = "docSpan multiple";
            if (markDiv.id[0]!='m') {
                tokenNum++;
            }
        }
    }
}

function linkDivs() {
    for(let docI = 0; docI < DOC_NUM; docI++) {
        let tokenI = 0;
        let lastDiv = null;
        while (tokenI < docsOccurences[docI].length) {
            let occurence = docsOccurences[docI][tokenI];
            let midSpanI = 0;
            let midSpan = el(getMidSpanId(occurence, midSpanI));
            while (midSpan != null && midSpan != undefined) {
                midSpan.prevDiv = lastDiv;
                midSpan.nextDiv = null;
                if (lastDiv!=null) {
                    lastDiv.nextDiv = midSpan;
                }
                midSpan.divType = MID_DIV;
                lastDiv = midSpan;
                midSpanI++;
                midSpan = el(getMidSpanId(occurence, midSpanI));
            }

            let tokenDiv = el(occurence.getSpanId());
            occurence.myDiv = tokenDiv;
            tokenDiv.divType = TOKEN_DIV;
            tokenDiv.prevDiv = lastDiv;
            tokenDiv.nextDiv = null;
            if (lastDiv!=null) {
                lastDiv.nextDiv = tokenDiv;
            }
            lastDiv = tokenDiv;

            tokenI++;
        }
    }
}

function findLongerMatches() {
    let addedNewMathcGroup = false;
    let iteration = 1;
    //console.log("findLong begins. Matchgroups:");
    //console.log(matchGroups);

    do {
        //console.log("Iteration: " + iteration);
        addedNewMathcGroup = false;
        for(let mI = 0; mI < matchGroups.length; mI++) {
            matchGroup = matchGroups[ mI ];
            if (!matchGroup.checked) {
                possibleNewMatch = [];
                //console.log("Matchgroup id: " + matchGroup.id + ", length: " + matchGroup.getMatchNum() + ", docNo2 start index: " + matchGroup.matchStartIndexes[1]);
                let matchGroupLength = matchGroup.getMatchNum();
                let matchI = 0;
                let newMatchGroups = [];
                for(matchI = 0; matchI < matchGroupLength; matchI++) {
                    let newGroup = new MatchGroup();
                    newGroup.parent = matchGroup;
                    //console.log("Match: " + matchGroup.getMatchByIndex(matchI).desc());
                    let newMatch = matchGroup.getMatchByIndex(matchI).createNewMatchByAppendingNextToken(newGroup);

                    if (newMatch != null) {
                        newGroup.addMatch(newMatch.docNo, newMatch);
                        //console.log("New match: " + newMatch.desc());
                        let checkMatchI = 0;
                        let foundGroup = false;
                        //console.log(newMatchGroups.length);
                        while (checkMatchI < newMatchGroups.length && !foundGroup) {
                            //console.log(newMatchGroups[checkMatchI]);
                            if (newMatchGroups[checkMatchI].getMatchByIndex(0).isSame(newMatch)) {
                                newMatchGroups[checkMatchI].addMatch(newMatch.docNo, newMatch);
                                newMatch.matchGroup = newMatchGroups[checkMatchI];
                                foundGroup = true;
                            }
                            checkMatchI++;
                        }
                        if (!foundGroup) {
                            newMatchGroups.push(newGroup);
                        }
                    }
                }
                let matchGroupI = 0;
                while (matchGroupI < newMatchGroups.length) {
                    if (newMatchGroups[matchGroupI].getMatchNum() <= 1) {
                        newMatchGroups.splice(matchGroupI, 1);
                    } else {
                        matchGroupI++;
                    }
                }

                //console.log("newMatchGroups:");
                //console.log(newMatchGroups);
                //console.log("----");
                matchGroup.checked = true;

                // old matchgroup not needed, full subset
                if (newMatchGroups.length == 1 && newMatchGroups[0].getMatchNum()==matchGroup.getMatchNum()) {
                    matchGroup.dropMyReferences();
                    matchGroups.splice(mI, 1);
                }

                checkAndDeleteCannibalizedGroups(newMatchGroups);
                // TODO check occpupied later start matchgroup
                if (newMatchGroups.length>0) {
                    addedNewMathcGroup = true;
                    matchGroups = [...matchGroups, ...newMatchGroups];
                }
            }

         };
         console.log("Iteration "+ iteration +" result matchgroups num:\n");
         iteration++;
         console.log(matchGroups.length);
    } while (addedNewMathcGroup && iteration < MAX_ITER_NUM);
}

function checkAndDeleteCannibalizedGroups(newMatchGroups) {
    let matchGroupI = 0;
    while (matchGroupI < newMatchGroups.length) {
        let newGroup = newMatchGroups[matchGroupI];
        let oldGroupI = 0;
        while (oldGroupI < matchGroups.length) {
            let oldGroup = matchGroups[oldGroupI];
            if (newGroup.contains(oldGroup)) {
                matchGroups.splice(oldGroupI, 1);
            } else {
                oldGroupI++;
            }
        }
        matchGroupI++;
    }

}

function findMatches() {
    tokens.forEach(token => {
        if (token.occurences[0].length>1 || token.occurences[1].length>1 || token.docs==BOTH) {
            let newGroup = new MatchGroup();
            newGroup.parent = null;
            newGroup.tokenText = token.word;
            let docNo;
            for(docNo = 0; docNo < DOC_NUM; docNo++) {
                token.occurences[docNo].forEach(occurence => {
                    let match = new Match(docNo, occurence.startPos, occurence.docI, token.word.length, 1, occurence, newGroup);
                    newGroup.addMatch(docNo, match);
                })
            }
            matchGroups.push(newGroup);
        }
    });
    findLongerMatches();
}

function findOrAddToken(token) {
    let tokenUpper = token.toUpperCase();
    let newOrFoundToken = tokens.find( tokenEl => tokenEl.word == tokenUpper);
    if (newOrFoundToken == undefined) {
        newOrFoundToken = new Token(tokenUpper, tokens.length);
        tokens.push( newOrFoundToken );
    }
    return newOrFoundToken;
}

function processTokens(tokenArray, text, docNo) {
    let actPos = 0;
    tokenArray.forEach((tokenStr) => {
        if (tokenStr.length>0 && tokenStr!="<br>") {
            actPos = text.indexOf(tokenStr, actPos);
            let token = findOrAddToken(tokenStr);
            let occurence = token.addOccurence(docNo, docsOccurences[docNo].length, actPos);
            docsOccurences[docNo].push(occurence);
            actPos += tokenStr.length;
        }
    })
}

function makeTokens() {
    tokens = [];
    docsOccurences[0] = [];
    docsOccurences[1] = [];
    text1 = el("doc1").value;
    text1 = text1.toUpperCase().replaceAll("'", "’");
    let tokens1 = text1.split(/[\s\n\r\!\.\?:\,\;]+/);
    
    text2 = el("doc2").value;
    text2 = text2.toUpperCase().replaceAll("'", "’");
    let tokens2= text2.split(/[\s\n\r\!\.\?:\,\;]+/);

    processTokens(tokens1, text1, 0);
    processTokens(tokens2, text2, 1);

    /*console.log("tokens:");
    console.log(tokens);
    console.log("docsTokens:");
    console.log(docsOccurences);*/
}
const HighlightOperation = {
    HIGHLIGHT: 0,
    UNHIGHLIGHT: 1
}

var highlightMatchGroup = null;

function highlightSpan(spanEl, bookmarked) {
    spanEl.originalBackgroundColor = spanEl.style.backgroundColor;
    spanEl.style.backgroundColor = (bookmarked ? "orange" : "yellow");

}

function unHighlightSpan(spanEl, bookmarked) {
    spanEl.style.backgroundColor = (bookmarked ? "#61ea61" : spanEl.originalBackgroundColor);
}

function loopThroughSpans(event, docNo, highlightMode) {
    let spanEl = event.currentTarget;
    spanEl.occurenceLink.matches[0].matchGroup.matchGroups[docNo].forEach(match => {
        match.getOccurencies().forEach( occurence => {
            switch (highlightMode) {
                case HighlightOperation.HIGHLIGHT:
                    highlightSpan(el(occurence.getSpanId()));
                    break;
                case HighlightOperation.UNHIGHLIGHT:
                    unHighlightSpan(el(occurence.getSpanId()));
                    break;
            }
        });
    });
}

function loopThroughDivs(matchGroup, highlightMode) {
    //console.log(" matchGroup is:");
    //console.log(matchGroup);
    let divs = [];
    let bookmarked = matchGroup == bookmarkGroup;
    for(let docI = 0; docI < DOC_NUM; docI++) {
        for(let j = 0; j < matchGroup.matchGroups[docI].length; j++) {
            let match = matchGroup.matchGroups[docI][j];
            if (match.show) {
                let markDiv = match.firstOccurence.myDiv;
                divs.push(markDiv);
                switch (highlightMode) {
                    case HighlightOperation.HIGHLIGHT:
                        highlightSpan(markDiv, bookmarked);
                        break;
                    case HighlightOperation.UNHIGHLIGHT:
                        unHighlightSpan(markDiv, bookmarked);
                        break;
                }

                let tokenNum = 1;
                while (markDiv!=null && tokenNum < match.tokenLength) {
                    markDiv = markDiv.nextDiv;
                    if (markDiv != null) {
                        switch (highlightMode) {
                            case HighlightOperation.HIGHLIGHT:
                                highlightSpan(markDiv, bookmarked);
                                break;
                            case HighlightOperation.UNHIGHLIGHT:
                                unHighlightSpan(markDiv, bookmarked);
                                break;
                        }
                        if (markDiv.id[0]!='m') {
                            tokenNum++;
                        }
                    }
                }
            }
        }
    }
    return divs;
}

function spanHover(event) {
    loopThroughSpans(event, 0, HighlightOperation.HIGHLIGHT);
    loopThroughSpans(event, 1, HighlightOperation.HIGHLIGHT);
}

function spanLeave(event) {
    loopThroughSpans(event, 0, HighlightOperation.UNHIGHLIGHT);
    loopThroughSpans(event, 1, HighlightOperation.UNHIGHLIGHT);
}

function divHover(event) {
    let div = event.target;
    let myDocIndex = Number(div.id[0] == 'm' ? div.id[1] : div.id[0]);
    let otherDocIndex = (myDocIndex + 1) % 2;
    if (highlightMatchGroup != div.matchGroup) {
        let divs = loopThroughDivs(div.matchGroup, HighlightOperation.HIGHLIGHT);
        if (divs.length == 2) {
            let div1Doc = divs[0].id[0] == 'm' ? divs[0].id[1] : divs[0].id[0];
            let div2Doc = divs[1].id[0] == 'm' ? divs[1].id[1] : divs[1].id[0];
            if (div1Doc + div2Doc == 1) {
                //console.log(divs[0].offsetTop + "|" + divs[1].offsetTop);
                //console.log((divs[0].offsetTop-el("doc1Div").scrollTop) + "|" + (divs[1].offsetTop-el("doc2Div").scrollTop));
                let myDocDiv = el("doc" + (myDocIndex+1) + "Div");
                let otherDocDiv = el("doc" + (otherDocIndex+1) + "Div");
                otherDocDiv.scrollTop = divs[otherDocIndex].offsetTop - (divs[myDocIndex].offsetTop-myDocDiv.scrollTop);
            }
        } 
        highlightMatchGroup = div.matchGroup;
    }

    //console.log(div.offsetTop)
}

function divLeave(event) {
    let div = event.target;
    loopThroughDivs(div.matchGroup, HighlightOperation.UNHIGHLIGHT);
    highlightMatchGroup = null;
}
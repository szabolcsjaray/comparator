class Occurence {
    constructor(docNo, docI, startPos, token) {
        this.myType = "Occurence";
        this.docNo = docNo;
        this.docI = docI;
        this.startPos = startPos;
        this.token = token;
        this.matches = [];
        this.prevMidTokenSpanNum = 0;
        this.nextMidTokenSpan = null;
    }

    addMatch(match) {
        this.matches.push(match);
    }

    removeMatch(match) {
        const matchI = this.matches.indexOf(match);
        if (matchI > -1) { 
            this.matches.splice(matchI, 1);
        }
    }

    getSpanId() {
        return "" + this.docNo + "-" + this.docI;
    }

    getPrevious() {
        return (this.docI == 0 ? null : docsOccurences[this.docNo][this.docI-1]);
    }

    getNext() {
        return (docsOccurences[this.docNo].length == this.docI+1  ? null : docsOccurences[this.docNo][this.docI+1]);
    }

    setPrevOccurencesNextMidTokenSpan() {
        if (this.prevMidTokenSpanNum == 0) {
            console.log("Cannot set midtoken span element for occurence. Too early call.");
            return;
        }

        let midTokenSpanId = getMidSpanId(this, this.prevMidTokenSpanNum, 0);
        let midTokenSpan = el(midTokenSpanId);

        let prevOccurence = this.getPrevious();
        if (prevOccurence != null) {
            prevOccurence.nextMidTokenSpan = midTokenSpan;
        }
    }

}

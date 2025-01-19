class Match {

    constructor(docNo, startPos, startIndex, length, tokenLength, firstOccurence, matchGroup) {
        this.myType = "Match";
        this.docNo = docNo;
        this.startPos = startPos;
        this.startIndex = startIndex;
        this.length = length;
        this.tokenLength = tokenLength;
        this.firstOccurence = firstOccurence;
        this.matchGroup = matchGroup;
        this.raw = this.text();
        firstOccurence.addMatch(this);
        this.show = true;
        this.overlaps = [];
    }

    getOccurencies() {
        let occList = [];
        let i;
        for(i=0; i < this.tokenLength; i++) {
            occList.push(docsOccurences[this.docNo][this.startIndex + i]);
        }
        return occList;
    }

    lastTokenIndex() {
        return this.startIndex + this.tokenLength - 1;
    }

    createNewMatchByAppendingNextToken(newMatchGroup) {
        if (docsOccurences[this.docNo].length > this.startIndex + this.tokenLength) {
            let newTokenIndex = this.startIndex + this.tokenLength;
            let newLength = (docsOccurences[this.docNo][newTokenIndex].startPos - this.startPos) + docsOccurences[this.docNo][newTokenIndex].token.word.length;
            return new Match(
                    this.docNo,
                    this.startPos,
                    this.startIndex,
                    newLength,
                    this.tokenLength + 1,
                    this.firstOccurence,
                    newMatchGroup
                );
        } else {
            return null;
        }
    }

    text() {
        return texts[this.docNo].substring(this.startPos, this.startPos + this.length);
    }

    desc() {
        return "Match: " + this.docNo + ": " + this.startPos + " len:" + this.length + " ["+ this.text() + "]";
    }

    isSame(otherMatch) {
        return this.matchGroup.tokenText == otherMatch.matchGroup.tokenText; // only token level match of the matches
        //return this.text() === otherMatch.text(); // exact match of the text part
    }

    overlapping(otherMatch) {
        if (this.docNo != otherMatch.docNo) {
            return false;
        }

        if (this.startIndex > otherMatch.startIndex + otherMatch.tokenLength - 1) {
            return false;
        }

        if (otherMatch.startIndex > this.startIndex + this.tokenLength - 1) {
            return false;
        }
        return true;
    }

    dontShow() {
        if (this.show) {
            this.show = false;
            this.matchGroup.oneLessToShow();
        }
    }

    dropMyReferences() {
        this.firstOccurence.removeMatch(this);
    }
}
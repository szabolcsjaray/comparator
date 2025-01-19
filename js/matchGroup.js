var matchGroupGlobalId = 0;

class MatchGroup {
    constructor(parent) {
        this.myType = "MatchGroup";
        this.matchGroups = [[], []];
        this.matchGroupNum = 2;
        this.matchStartIndexes = [];
        this.id = matchGroupGlobalId;
        this.occurencies = [[], []];
        this.checked = false;
        this.needed = true;
        this.overlaps = []; //overlapping other groups array
        this.show = true;
        this.tokenText = null;
        this.parent = parent;
        matchGroupGlobalId++;
        this.matchNotShown = 0;
    }

    refreshMatchStartIndexes() {
        this.matchStartIndexes[0] = 0;
        let mgIndex = 1;
        while (mgIndex<this.matchGroups.length) {
            this.matchStartIndexes[mgIndex] = this.matchStartIndexes[mgIndex-1] + this.matchGroups[mgIndex-1].length;
            mgIndex++;
        }
        this.matchStartIndexes[mgIndex] = this.matchStartIndexes[mgIndex-1] + this.matchGroups[mgIndex-1].length;
    }

    addMatch(docNo, match) {
        if (this.tokenText == null) {
            if (this.parent == null) {
                this.tokenText = docsOccurences[match.docNo][match.lastTokenIndex()].token.word;
            } else {
                this.tokenText = this.parent.tokenText + " " + docsOccurences[match.docNo][match.lastTokenIndex()].token.word;
            }
        }
        this.raw = match.text();
        this.matchGroups[docNo].push(match);
        this.refreshMatchStartIndexes();
        this.occurencies[docNo].push(match.getOccurencies());
    }

    getMatchNum() {
        return this.matchStartIndexes[this.matchGroupNum-1] + this.matchGroups[this.matchGroupNum-1].length;
        //return this.matchGroups.reduce((a, b) => a.length + b.length, 0);
    }

    getMatchByIndex(index) {
        let mgIndex = 0;
        do {
            if (mgIndex >= this.matchGroups.length || this.matchStartIndexes[mgIndex + 1] > index) {
                return this.matchGroups[mgIndex][index - this.matchStartIndexes[mgIndex]];
            }
            mgIndex++;
        } while(mgIndex <= this.matchGroups.length);
        return null;
    }

    contains(otherGroup) {
        let myFirstMatch = this.getMatchByIndex(0);
        let otherFirstMatch = otherGroup.getMatchByIndex(0);
        let matchContains = false;
        if (myFirstMatch.docNo == otherFirstMatch.docNo) {
            if (myFirstMatch.startIndex <= otherFirstMatch.startIndex &&
                myFirstMatch.tokenLength >= otherFirstMatch.tokenLength + 
                    (otherFirstMatch.startIndex - myFirstMatch.startIndex)) {
                matchContains = true;
            }
        }
        if (matchContains && otherGroup.getMatchNum() <= this.getMatchNum()) {
            return true;
        }
        return false;
    }

    overlapping(otherGroup) {
        let overlappingMatchNum = 0;
        for(let docI = 0; docI < 2; docI++) {
            for(let i = 0; i < this.matchGroups[docI].length; i++) {
                let match = this.matchGroups[docI][i];
                for(let j = 0; j < otherGroup.matchGroups[docI].length; j++) {
                    let otherMatch = otherGroup.matchGroups[docI][j];
                    if (match.overlapping(otherMatch)) {
                        this.overlaps.push(otherGroup);
                        otherGroup.overlaps.push(this);
                        match.overlaps.push(otherMatch);
                        otherMatch.overlaps.push(match);
                        overlappingMatchNum++;
                    }
                }
            }
        }
        if (overlappingMatchNum ==otherGroup.getMatchNum()) {
            otherGroup.overlaps.push(this);
        }

        return false;
    }

    oneLessToShow() {
        this.matchNotShown++;
        if (this.matchNotShown >= (this.getMatchNum() - 1)) {
            this.show = false;
        }
    }

    dropMyReferences() {
        for(let docI = 0; docI < DOC_NUM; docI++) {
            for(let matchI = 0; matchI < this.matchGroups[docI].length; matchI++) {
                this.matchGroups[docI][matchI].dropMyReferences();
            }
        }
    }
}
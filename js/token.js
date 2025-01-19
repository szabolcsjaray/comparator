class Token {
    constructor(word, myIndex) {
        this.myType = "Token";
        this.word = word;
        this.occurences = [new Array(), new Array()];
        this.docs = NONE;
        this.myIndex = myIndex;
    }

    addOccurence(docNo, docI, startPos) {
        let occurence = new Occurence(docNo, docI, startPos, this);
        this.occurences[docNo].push(occurence);
        if (this.docs!=docNo) {
            if (this.docs==NONE) {
                this.docs = docNo;
            } else {
                this.docs = BOTH;
            }
        }
        return occurence;
    }
}
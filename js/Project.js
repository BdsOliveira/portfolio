class Project {
    constructor(element) {
        this.id = element._id;
        this.gitHubLink = element.gitHubLink;
        this.liveLink = element.liveLink;
        this.title = element.title;
        this.description = element.description;
        this.skillUsed1 = element.skillUsed1;
        this.skillUsed2 = element.skillUsed2;
        this.skillUsed3 = element.skillUsed3;
        this.skillUsed4 = element.skillUsed4;
        this.skillUsed5 = element.skillUsed5;
        this.isVisible = element.isVisible;
    }
}

export {Project};